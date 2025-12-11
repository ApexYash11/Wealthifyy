# Deployment Guide for Wealthify

This project consists of three parts:
1. **Database**: Supabase (PostgreSQL)
2. **Backend**: FastAPI (Python)
3. **Frontend**: Next.js (TypeScript)

## Prerequisites

- A GitHub account (with this code pushed to a repository).
- A [Supabase](https://supabase.com/) account.
- A [Railway](https://railway.app/) account (for Backend).
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

## Step 2: Backend Deployment (Railway)

We will deploy the FastAPI backend to Railway.

1. Log in to [Railway Dashboard](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository.
4. **Important: Configure Monorepo**:
   - Click on the newly created service card.
   - Go to **Settings** -> **General**.
   - Scroll down to **Root Directory** and set it to `/wealthify_backend`.
   - Railway will now detect the `railway.json` and `start.sh` in that folder.
5. Click **Variables** and add:
   - `PORT`: `8000`
   - `DATABASE_URL`: (Paste your Supabase Connection String)
   - `SUPABASE_URL`: (Your Supabase Project URL)
   - `SUPABASE_ANON_KEY`: (Your Supabase Anon Key)
   - `SECRET_KEY`: (Generate a random string)
   - `FRONTEND_URL`: (Leave blank for now)
6. **Generate Domain**:
   - Go to **Settings** -> **Networking**.
   - Click **Generate Domain** (e.g., `wealthify-backend-production.up.railway.app`).

---

## Step 3: Frontend Deployment (Railway or Vercel)

You can deploy the frontend to Vercel (recommended for Next.js) or Railway.

### Option A: Vercel (Recommended)
1. Import the repo to Vercel.
2. Set **Root Directory** to `wealthify_frontend`.
3. Add Environment Variables (`NEXT_PUBLIC_API_URL`, etc.).

### Option B: Railway
1. In your Railway project, click **New** -> **GitHub Repo**.
2. Select the same repository again.
3. Click on the new service card.
4. Go to **Settings** -> **General**.
5. Set **Root Directory** to `/wealthify_frontend`.
6. Add Environment Variables.
7. Generate a domain.

---

## Step 4: Final Configuration

1. **Update Backend CORS**:
   - Go back to Railway Dashboard -> Variables.
   - Add/Update `FRONTEND_URL` with your new Vercel URL (e.g., `https://wealthify-frontend.vercel.app`).
   - Add `BACKEND_CORS_ORIGINS` as a JSON string: `["https://wealthify-frontend.vercel.app"]`.
   - Railway will automatically redeploy when you save variables.

2. **Database Migrations**:
   - If you haven't run migrations on the production DB, you might need to connect to it locally and run Alembic, or use the Supabase SQL editor to set up your schema.

## Troubleshooting

- **Backend Health Check**: Visit `https://<your-railway-url>/health` to see if the API is running.
- **Docs**: Visit `https://<your-railway-url>/docs` for Swagger UI.
