# Deployment Guide for Wealthify

This project consists of three parts:
1. **Database**: Supabase (PostgreSQL)
2. **Backend**: FastAPI (Python)
3. **Frontend**: Next.js (TypeScript)

## Prerequisites

- A GitHub account (with this code pushed to a repository).
- A [Supabase](https://supabase.com/) account.
- A [Render](https://render.com/) account (for Backend).
- A [Vercel](https://vercel.com/) account (for Frontend).

---

## Step 1: Database Setup (Supabase)

1. Create a new project on Supabase.
2. Go to **Project Settings** -> **Database**.
3. Copy the **Connection String** (URI). It looks like: `postgresql://postgres:[PASSWORD]@db.ref.supabase.co:5432/postgres`.
   - *Note: You will need this for the Backend environment variables.*
4. Go to **Project Settings** -> **API**.
5. Copy the **Project URL** and **anon public key**.
   - *Note: You will need these for the Frontend environment variables.*

---

## Step 2: Backend Deployment (Render)

We will deploy the FastAPI backend to Render.

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Configure the service:
   - **Name**: `wealthify-backend`
   - **Root Directory**: `wealthify_backend` (Important!)
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Scroll down to **Environment Variables** and add:
   - `PYTHON_VERSION`: `3.11.0` (or your local version)
   - `DATABASE_URL`: (Paste your Supabase Connection String from Step 1)
   - `SUPABASE_URL`: (Your Supabase Project URL)
   - `SUPABASE_ANON_KEY`: (Your Supabase Anon Key)
   - `SECRET_KEY`: (Generate a random string)
   - `FRONTEND_URL`: (Leave blank for now, update after deploying frontend)
6. Click **Create Web Service**.
7. Wait for the deployment to finish. Copy the **Service URL** (e.g., `https://wealthify-backend.onrender.com`).

---

## Step 3: Frontend Deployment (Vercel)

We will deploy the Next.js frontend to Vercel.

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: Click `Edit` and select `wealthify_frontend`.
5. Expand **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL`: (Your Supabase Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Your Supabase Anon Key)
   - `NEXT_PUBLIC_API_URL`: (Paste the Render Backend URL from Step 2, e.g., `https://wealthify-backend.onrender.com/api/v1`)
     - *Note: Make sure to include `/api/v1` if your backend routes are prefixed.*
6. Click **Deploy**.

---

## Step 4: Final Configuration

1. **Update Backend CORS**:
   - Go back to Render Dashboard -> Environment Variables.
   - Add/Update `FRONTEND_URL` with your new Vercel URL (e.g., `https://wealthify-frontend.vercel.app`).
   - Add `BACKEND_CORS_ORIGINS` as a JSON string: `["https://wealthify-frontend.vercel.app"]`.

2. **Database Migrations**:
   - If you haven't run migrations on the production DB, you might need to connect to it locally and run Alembic, or use the Supabase SQL editor to set up your schema.

## Troubleshooting

- **Backend Health Check**: Visit `https://wealthify-backend.onrender.com/health` to see if the API is running.
- **Docs**: Visit `https://wealthify-backend.onrender.com/docs` for Swagger UI.
