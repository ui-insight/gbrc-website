# GBRC Website

**IIDS Genomics and Bioinformatics Resources Core** - University of Idaho

A modern web application for the GBRC, built with React + TypeScript (frontend) and FastAPI (backend).

## Quick Start

### Development

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:8000`.

### Docker

```bash
docker compose up --build
```

Site available at `http://localhost:9200`.

## Cost Recovery Dashboard

The site includes an internal-facing cost recovery dashboard at `/cost-recovery`.

- The dashboard route is part of the main frontend app and is linked in the site navigation.
- Dashboard APIs live under `/api/v1/dashboard/*`.
- Charge-based analytics are computed from the files in `backend/app/data/`.
- Proposal analytics may cover a broader fiscal-year range than the charge data, depending on the contents of `proposals.csv`.

### Access Control

Dashboard access is token-gated only when the backend is configured with `GBRC_DASHBOARD_TOKEN`.

```bash
# backend/.env
GBRC_DASHBOARD_TOKEN=your-shared-dashboard-token
```

If `GBRC_DASHBOARD_TOKEN` is left blank, the dashboard is accessible without auth for local development.

## Project Structure

```
gbrc-website/
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── api/v1/       # API endpoints
│   │   ├── config/       # Settings
│   │   ├── models/       # Data models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # Business logic
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/             # React + TypeScript application
│   ├── src/
│   │   ├── components/   # Shared components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   └── api/          # API client
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```
