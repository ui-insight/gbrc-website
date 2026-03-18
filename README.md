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
