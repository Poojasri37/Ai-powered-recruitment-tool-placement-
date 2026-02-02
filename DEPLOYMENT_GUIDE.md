# Deployment Guide in 3 Steps

This guide implements your hybrid strategy: **Backend on Render** and **Frontend on Vercel**.

## Phase 1: Deploy Backend (Render)

1.  **Create New Web Service** on Render.
2.  **Settings**:
    *   **Root Directory**: `backend`
    *   **Build Command**: `npm install && npm run build`
    *   **Start Command**: `npm start`
3.  **Environment Variables**:
    *   `NODE_ENV`: `production`
    *   `MONGO_URI`: `(Your MongoDB connection string)`
    *   `JWT_SECRET`: `(Your secret key)`
    *   `GROQ_API_KEY`: `(Your Groq key)`
4.  **Deploy**: Click Create.
5.  **Copy URL**: Once live, copy the URL (e.g., `https://recruitment-backend.onrender.com`).

---

## Phase 2: Deploy Frontend (Vercel)

1.  **Go to Vercel Dashboard** -> **Add New Project**.
2.  **Import** your GitHub repository.
3.  **Configure Project**:
    *   **Framework Preset**: Select **Vite** (Vercel usually auto-detects this).
    *   **Root Directory**: Click "Edit" and select `client`.
4.  **Environment Variables**:
    *   Expand the "Environment Variables" section.
    *   **Key**: `VITE_API_URL`
    *   **Value**: Paste your **Render Backend URL** (from Phase 1).
5.  **Deploy**: Click **Deploy**.
6.  **Copy URL**: Once live, copy the domain (e.g., `https://recruitment-frontend.vercel.app`).

---

## Phase 3: Connect Them

1.  Go back to **Render Dashboard** -> Your Backend Service.
2.  Go to **Environment Variables**.
3.  Add/Update:
    *   `FRONTEND_URL`: Paste your **Vercel Frontend URL** (from Phase 2).
4.  **Save Changes**. Render will auto-redeploy the backend.

**Done!** Your backend (Render) is now talking to your frontend (Vercel).
