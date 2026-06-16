#!/bin/bash
# ============================================================
# Pawn Shine — PUBLIC Instance Setup Script
# Run on: Public subnet VM (has public IP)
# Purpose: Serves the frontend UI (Nginx) and reverse-proxies
#          API requests to the private backend instance.
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

echo "============================================================"
echo "  Pawn Shine — PUBLIC Instance Setup (Frontend/UI)"
echo "  Backend IP: $BACKEND_PRIVATE_IP"
echo "============================================================"

# -----------------------------------------------------------
# 1. Update and Upgrade System Packages
# -----------------------------------------------------------
echo "[1/7] Updating and upgrading system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# -----------------------------------------------------------
# 2. Install Docker and utilities
#
# WHY Docker? Consistent environment across dev/staging/prod.
# No "works on my machine" issues. Nginx config, Node build,
# and all dependencies are baked into the image.
# -----------------------------------------------------------
echo "[2/7] Installing Docker and utilities..."
sudo apt-get install -y docker.io docker-compose-v2 git curl wget unzip iptables-persistent netfilter-persistent

# -----------------------------------------------------------
# 3. Enable Docker and add user to docker group
# -----------------------------------------------------------
echo "[3/7] Enabling Docker service..."
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu

# -----------------------------------------------------------
# 4. Create deployment directory and clone frontend repo
#
# WHY only the frontend repo? This instance doesn't need
# backend source code. Smaller attack surface, faster clones,
# and cleaner separation of concerns.
# -----------------------------------------------------------
echo "[4/7] Creating deployment directory..."
mkdir -p "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

echo "[5/7] Cloning frontend repository (Branch: $DEPLOY_BRANCH)..."
if [ ! -d "pawn-frontend" ]; then
    git clone -b "$DEPLOY_BRANCH" https://github.com/SAIPREMKAKUMANI/pawn-shine-portal.git pawn-frontend
else
    echo "  pawn-frontend already exists, skipping clone."
fi

# -----------------------------------------------------------
echo "[6/7] Allowing HTTP traffic..."
# Allow HTTP traffic in iptables
sudo iptables -I INPUT 6 -p tcp --dport 80 -j ACCEPT
# Save the firewall rules so they persist after reboot
sudo netfilter-persistent save

# -----------------------------------------------------------
# 7. Copy configuration files
#
# All UI configs (docker-compose.public.yml, nginx-public.conf)
# now live in the frontend repo — single source of truth.
# -----------------------------------------------------------
echo "[7/7] Setting up configuration files..."
cp "$DEPLOY_DIR/pawn-frontend/docker-compose.yml" "$DEPLOY_DIR/docker-compose.yml"

# Create .env with backend IP
if [ ! -f "$DEPLOY_DIR/.env" ]; then
    cat > "$DEPLOY_DIR/.env" <<EOF
# ============================================================
# Public Instance Environment Variables
# ============================================================
# Private IP of the backend instance (Oracle VCN internal)
BACKEND_PRIVATE_IP=$BACKEND_PRIVATE_IP
EOF
fi

# Copy utility scripts from frontend repo
cp "$DEPLOY_DIR/pawn-frontend/update.sh" "$DEPLOY_DIR/"
chmod +x "$DEPLOY_DIR/update.sh"

# -----------------------------------------------------------
# 7. Write MOTD
# -----------------------------------------------------------
sudo bash -c "cat > /etc/motd << 'MOTD'

    ╔═══════════════════════════════════════════════════════════╗
    ║          🏆 Pawn Shine — PUBLIC Instance (UI)             ║
    ╠═══════════════════════════════════════════════════════════╣
    ║                                                           ║
    ║  Role: Frontend (Nginx) + API Reverse Proxy               ║
    ║                                                           ║
    ║  1. Edit backend IP:                                      ║
    ║     nano ~/pawn-deploy/.env                               ║
    ║                                                           ║
    ║  2. Build & start:                                        ║
    ║     cd ~/pawn-deploy && docker compose up -d --build      ║
    ║                                                           ║
    ║  3. Check status:                                         ║
    ║     docker compose ps     `                                 ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝

MOTD"

echo ""
echo "============================================================"
echo "  PUBLIC Instance Setup Complete!"
echo ""
echo "  Next steps:"
echo "    1. Verify backend IP in ~/pawn-deploy/.env"
echo "    2. Build & start: cd ~/pawn-deploy && docker compose up -d --build"
echo "    3. Ensure the PRIVATE instance is also set up and running"
echo ""
echo "  Rebooting to apply docker group changes..."
echo "============================================================"
sudo reboot