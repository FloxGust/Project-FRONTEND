# SOC Agentic Platform

Agentic Security Operations Center — Frontend (React) + Backend (FastAPI)

## Quick Start

### With Docker Compose (Recommended)
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Nginx (unified): http://localhost:80
- API Docs: http://localhost:8000/docs

### Local Development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
cp .env .env.local  # edit as needed
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
cp .env .env.local  # edit VITE_API_BASE_URL if needed
npm run dev
```

## Project Structure
```
soc-agentic/
├── backend/        FastAPI — alerts, agents, incidents, intelligence, reports
├── frontend/       React + Vite + Tailwind
└── nginx/          Reverse proxy config
```

## Default Login
- username: `analyst` | password: `soc123`
- username: `admin`   | password: `admin123`

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET  | /api/alerts            | List alerts |
| POST | /api/alerts/:id/triage | Triage alert |
| GET  | /api/agents/catalog    | Available agents |
| POST | /api/agents/run        | Run an agent |
| GET  | /api/agents/jobs/:id   | Poll job status |
| GET  | /api/incidents         | List incidents |
| POST | /api/incidents         | Create incident |
| POST | /api/intelligence/enrich | Enrich IOC |
| POST | /api/reports/generate  | Generate report |
| POST | /api/auth/login        | Authenticate |
