# Local Development Setup Guide

## Prerequisites

- Node.js 18+ and `npm` / `pnpm`
- Python 3.11+ and `pip` / `virtualenv`
- Supabase account (or local Supabase instance)
- Docker Desktop (optional for containerized setup)

---

## 1. Backend Setup

```bash
cd backend
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` with your Supabase credentials, PostgreSQL connection URL, and OpenAI API key.

Start the dev server:
```bash
uvicorn app.main:app --reload --port 8000
```
Interactive API docs available at `http://localhost:8000/docs`.

---

## 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env` to point to `http://localhost:8000/api/v1` and add your Supabase anon key.

Start Vite dev server:
```bash
npm run dev
```
Application opens at `http://localhost:5732` (or specified Vite port).

---

## 3. ML Pipeline Setup (Optional for standalone testing)

```bash
cd ml
pip install -r requirements.txt
python inference/predictor.py
```
