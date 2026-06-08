# Pawn Shine Portal — Frontend

Professional gold pawn broking management system for tracking customers, bills, ornaments, and interest calculations.

## Tech Stack

- **React 18** + **TypeScript** — UI framework
- **Vite 5** — Build tool with React SWC plugin for fast HMR
- **Tailwind CSS** + **shadcn/ui** — Styling and component library
- **React Query** — Server state management
- **Axios** — HTTP client with auth interceptors
- **React Router v6** — Client-side routing
- **Zod** — Schema validation
- **Zustand** — Client state management

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ and npm

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/SAIPREMKAKUMANI/pawn-shine-portal.git
cd pawn-shine-portal

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env with your backend URL

# 4. Start the dev server (http://localhost:8081)
npm run dev
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_BACKEND_URL` | `http://localhost:8080` | Backend API server URL for the Vite dev proxy |

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with HMR on port 8081 |
| `npm run build` | Production build to `dist/` |
| `npm run build:dev` | Development build (unminified) |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

## Production Deployment (Oracle Cloud)

The app is deployed on Oracle Cloud using a **two-instance architecture**:

```
┌─────────────────────┐        ┌─────────────────────┐
│   PUBLIC INSTANCE    │        │  PRIVATE INSTANCE    │
│   (Public Subnet)    │  VCN   │  (Private Subnet)    │
│                      │◄──────►│                      │
│  Nginx (port 80)     │        │  Spring Boot (:8080) │
│  - Serves static UI  │        │  PostgreSQL (:5432)  │
│  - Proxies /api/*    │        │                      │
└─────────────────────┘        └─────────────────────┘
```

### Deployment Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build: Node → Nginx |
| `nginx.conf` | Simple Nginx config (single-VM Docker Compose) |
| `nginx-public.conf` | Production Nginx config (two-instance, envsubst templating) |
| `docker-compose.public.yml` | Compose file for the public instance |
| `setup-public.sh` | One-time VM setup script |
| `update.sh` | Pull & redeploy script |

### First-Time Setup

```bash
# On the public VM
curl -sL https://raw.githubusercontent.com/SAIPREMKAKUMANI/pawn-shine-portal/main/setup-public.sh | bash
```

### Update & Redeploy

```bash
cd ~/pawn-deploy && bash update.sh
```

## Project Structure

```
pawn-shine-portal/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── shared/     # Shared components (status badges, etc.)
│   │   └── ui/         # shadcn/ui primitives
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities (API client, helpers)
│   ├── pages/          # Page-level components
│   ├── services/       # API service functions
│   ├── types/          # TypeScript types and enums
│   └── validators/     # Zod validation schemas
├── public/             # Static assets
├── docs/               # API documentation
└── dist/               # Production build output
```
