# AI-TrainTraffic-Control-Prototype

Security-first AI decision-support prototype to optimize section throughput and train precedence using demo-safe simulated data, human-in-the-loop controls, audit logging, and deploy-ready stacks (Next.js frontend + FastAPI backend).

Demo Mode: This instance uses simulated train data only. No live signalling/infrastructure is accessed. Critical actions require Supervisor sign-off.

![Dashboard View](./public/screenshots/dashboard.png)

## System Architecture

### High-Level Architecture

The system follows a modern microservices architecture with clear separation of concerns:

## Quick Start (Local)

Requirements: Docker + Docker Compose

1) Start stack:
- docker-compose up --build

2) Open UI:
- http://localhost:3000

3) What to try:
- Dashboard shows KPIs, live map, and audit activity.
- Click "Run Optimize" to generate a recommendation.
- Go to Controller Panel (/controller-panel) to Accept or Request Supervisor.
- Supervisor (/supervisor) can Approve/Reject pending tickets.
- Audit Log (/audit-log) shows immutable-like feed.

WebSocket: UI connects to ws://localhost:8000/ws/sim for streaming positions and recommendations.

## Services

- Frontend: Next.js (App Router, Tailwind + ShadCN UI)
- Backend: FastAPI (WS + REST), in-memory simulator, JWT stub
- Postgres, Redis: provisioned but not yet wired for persistence in demo (schemas included under scripts/sql)

## Env Variables

Frontend:
- NEXT_PUBLIC_BACKEND_URL (default http://localhost:8000)
- NEXT_PUBLIC_BACKEND_WS (default ws://localhost:8000/ws/sim)
- NEXT_PUBLIC_DEMO_MODE (true)

Backend:
- DEMO_MODE=true
- JWT_SECRET=dev-secret
- OIDC_ISSUER=demo-issuer

## Production Notes
- Deploy frontend to Vercel, backend to your container host (Render/Railway/ECS).
- Switch WS to wss://your-backend/ws/sim.
- Integrate real AuthN/AuthZ (Keycloak/Auth0) and wire DB + Redis.
- Follow security roadmap: OT/IT separation, two-person actuation, formal verification, SIEM/SOC integration.

## License
Demo use only. Do not connect to live signalling or TMS.
