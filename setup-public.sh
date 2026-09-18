#!/bin/bash
# ============================================================
# Pawn Shine — PUBLIC Instance Setup Script
# Run on: Public subnet VM (has public IP)
# Purpose: Serves the frontend UI (Nginx) over HTTPS (SSL/TLS)
#          and reverse-proxies API requests to private backend.
#
# WHY a separate public instance for the UI?
#   1. SECURITY: Only port 80/443 is exposed to the internet.
#      The backend and database are completely hidden on a
#      private subnet — no direct attack surface.
#   2. PERFORMANCE: Nginx serves static files locally with
#      aggressive caching. API calls are proxied over the fast
#      VCN internal network (sub-millisecond latency).
#   3. ISOLATION: A compromised frontend cannot access the DB
#      directly. Attackers would need to breach two instances.
# ============================================================
set -euo pipefail

DEPLOY_DIR=/home/ubuntu/pawn-deploy
BACKEND_PRIVATE_IP="${BACKEND_PRIVATE_IP:-10.0.1.29}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-develop}"
DOMAIN_NAME="${DOMAIN_NAME:-}"
CERT_EMAIL="${CERT_EMAIL:-admin@example.com}"

echo "============================================================"
echo "  Pawn Shine — PUBLIC Instance Setup (Frontend/UI)"
echo "  Backend IP: $BACKEND_PRIVATE_IP"
echo "============================================================"

# -----------------------------------------------------------
# 1. Update and Upgrade System Packages
# -----------------------------------------------------------
echo "[1/8] Updating and upgrading system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# -----------------------------------------------------------
# 2. Install Docker, Certbot, and utilities
#
# WHY Certbot? Certbot is EFF's official tool for requesting,
# issuing, and renewing free Let's Encrypt SSL/TLS certificates.
# -----------------------------------------------------------
echo "[2/8] Installing Docker, Certbot, and utilities..."
sudo apt-get install -y docker.io docker-compose-v2 git curl wget unzip iptables-persistent netfilter-persistent certbot openssl

# -----------------------------------------------------------
# 3. Enable Docker and add user to docker group
# -----------------------------------------------------------
echo "[3/8] Enabling Docker service..."
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu

# -----------------------------------------------------------
# 4. Create deployment directory and clone frontend repo
# -----------------------------------------------------------
echo "[4/8] Creating deployment directory..."
mkdir -p "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

echo "[5/8] Cloning frontend repository (Branch: $DEPLOY_BRANCH)..."
if [ ! -d "pawn-frontend" ]; then
    git clone -b "$DEPLOY_BRANCH" https://github.com/SAIPREMKAKUMANI/pawn-shine-portal.git pawn-frontend
else
    echo "  pawn-frontend already exists, skipping clone."
fi

# -----------------------------------------------------------
# 5. Firewall Configuration (Allow HTTP 80 & HTTPS 443)
#
# WHY Port 80 and 443?
#   - Port 80: For initial HTTP connection, Let's Encrypt HTTP-01
#     ACME validation, and redirecting HTTP to HTTPS (301).
#   - Port 443: For secure HTTPS traffic serving TLS 1.2/1.3.
# -----------------------------------------------------------
echo "[6/8] Configuring OS firewall rules for HTTP (80) & HTTPS (443)..."

# Helper function to open port cleanly before REJECT rule
open_port() {
    local PORT=$1
    if sudo iptables -C INPUT -p tcp --dport "$PORT" -j ACCEPT >/dev/null 2>&1; then
        echo "  Port $PORT rule already exists in iptables."
    else
        REJECT_LINE=$(sudo iptables -L INPUT --line-numbers | grep -i "REJECT" | head -n 1 | awk '{print $1}')
        if [ -n "$REJECT_LINE" ]; then
            echo "  Inserting port $PORT rule at position $REJECT_LINE (before REJECT rule)..."
            sudo iptables -I INPUT "$REJECT_LINE" -p tcp --dport "$PORT" -j ACCEPT
        else
            echo "  Appending port $PORT rule to INPUT chain..."
            sudo iptables -A INPUT -p tcp --dport "$PORT" -j ACCEPT
        fi
    fi
}

open_port 80
open_port 443

# Save iptables rules so they persist after VM reboot
sudo netfilter-persistent save || sudo service iptables save

# -----------------------------------------------------------
# 6. SSL / TLS Certificate Setup (Let's Encrypt / Fallback)
#
# WHY Fallback Certificates?
# If DOMAIN_NAME is not yet pointed via DNS, certbot will fail.
# Generating a fallback self-signed certificate guarantees Nginx
# can start up cleanly out-of-the-box. When DNS is ready,
# running `sudo certbot certonly --standalone` replaces it.
# -----------------------------------------------------------
echo "[7/8] Configuring SSL / TLS Certificates..."
sudo mkdir -p /var/www/certbot
sudo mkdir -p /etc/letsencrypt/live/default

# Generate fallback self-signed cert if default doesn't exist
if [ ! -f /etc/letsencrypt/live/default/fullchain.pem ]; then
    echo "  Generating fallback self-signed SSL certificate..."
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/letsencrypt/live/default/privkey.pem \
        -out /etc/letsencrypt/live/default/fullchain.pem \
        -subj "/C=IN/ST=Telangana/L=Hyderabad/O=PawnShine/OU=IT/CN=${DOMAIN_NAME:-localhost}" >/dev/null 2>&1
fi

SSL_CERT_PATH="/etc/letsencrypt/live/default/fullchain.pem"
SSL_KEY_PATH="/etc/letsencrypt/live/default/privkey.pem"

# If DOMAIN_NAME is provided, attempt Let's Encrypt certificate issuance
if [ -n "$DOMAIN_NAME" ]; then
    if [ -f "/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem" ]; then
        echo "  [INFO] Valid Let's Encrypt certificate already exists for domain $DOMAIN_NAME. Skipping re-issuance."
        SSL_CERT_PATH="/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem"
        SSL_KEY_PATH="/etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem"
    else
        echo "  Attempting Let's Encrypt SSL issuance for domain: $DOMAIN_NAME..."
        if sudo certbot certonly --standalone -d "$DOMAIN_NAME" --agree-tos -m "$CERT_EMAIL" --non-interactive; then
            echo "  Successfully obtained Let's Encrypt SSL certificate for $DOMAIN_NAME!"
            SSL_CERT_PATH="/etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem"
            SSL_KEY_PATH="/etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem"
        else
            echo "  [WARNING] Certbot issuance skipped or failed (check DNS resolution for $DOMAIN_NAME)."
            echo "  Falling back to self-signed cert. Run certbot manually once DNS propagates."
        fi
    fi
fi


# -----------------------------------------------------------
# 7. Auto-Renewal Cron Job for Let's Encrypt
#
# WHY Cron Job? Let's Encrypt certs expire every 90 days.
# This cron job runs monthly at 3 AM to automatically renew certs
# and signal Nginx inside Docker to reload without downtime.
# -----------------------------------------------------------
echo "  Setting up automated SSL certificate renewal cron job..."
CRON_JOB="0 3 1 * * root certbot renew --quiet --post-hook \"cd /home/ubuntu/pawn-deploy && docker compose exec -T frontend nginx -s reload\""
echo "$CRON_JOB" | sudo tee /etc/cron.d/certbot-renew >/dev/null
sudo chmod 644 /etc/cron.d/certbot-renew

# -----------------------------------------------------------
# 8. Copy configuration files & environment setup
# -----------------------------------------------------------
echo "[8/8] Setting up configuration files..."
cp "$DEPLOY_DIR/pawn-frontend/docker-compose.yml" "$DEPLOY_DIR/docker-compose.yml"

# Write / update .env with backend IP & SSL paths
if [ ! -f "$DEPLOY_DIR/.env" ]; then
    cat > "$DEPLOY_DIR/.env" <<EOF
# ============================================================
# Public Instance Environment Variables
# ============================================================
BACKEND_PRIVATE_IP=$BACKEND_PRIVATE_IP
DOMAIN_NAME=$DOMAIN_NAME
CERT_EMAIL=$CERT_EMAIL
SSL_CERT_PATH=$SSL_CERT_PATH
SSL_KEY_PATH=$SSL_KEY_PATH
EOF
fi

# Copy utility scripts from frontend repo
cp "$DEPLOY_DIR/pawn-frontend/update.sh" "$DEPLOY_DIR/"
chmod +x "$DEPLOY_DIR/update.sh"

# Write MOTD
sudo bash -c "cat > /etc/motd << 'MOTD'

    ╔═══════════════════════════════════════════════════════════╗
    ║      🏆 Pawn Shine — PUBLIC Instance (UI with SSL)        ║
    ╠═══════════════════════════════════════════════════════════╣
    ║                                                           ║
    ║  Role: Frontend (Nginx) + API Reverse Proxy + SSL/TLS     ║
    ║                                                           ║
    ║  1. Edit settings (.env):                                 ║
    ║     nano ~/pawn-deploy/.env                               ║
    ║                                                           ║
    ║  2. Request Let's Encrypt SSL (if domain ready):          ║
    ║     sudo certbot certonly --standalone -d pawn.domain.com ║
    ║                                                           ║
    ║  3. Build & start:                                        ║
    ║     cd ~/pawn-deploy && docker compose up -d --build      ║
    ║                                                           ║
    ║  4. Check status & logs:                                  ║
    ║     docker compose ps                                     ║
    ║     docker compose logs -f frontend                       ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝

MOTD"

echo ""
echo "============================================================"
echo "  PUBLIC Instance Setup Complete!"
echo ""
echo "  SSL Status:"
echo "    - Ports 80 & 443 open in OS iptables."
echo "    - Auto-renewal cron job added to /etc/cron.d/certbot-renew."
echo "    - SSL Cert: $SSL_CERT_PATH"
echo ""
echo "  Next steps:"
echo "    1. Verify backend IP & Domain in ~/pawn-deploy/.env"
echo "    2. Issue Let's Encrypt cert if DNS points to this server:"
echo "       sudo certbot certonly --standalone -d pawn.yourdomain.com"
echo "    3. Build & start: cd ~/pawn-deploy && docker compose up -d --build"
echo ""
echo "  Rebooting to apply docker group changes..."
echo "============================================================"
sudo reboot