# 🚀 Smart Parking AI - Complete Production Deployment Guide

A step-by-step production deployment manual covering MongoDB Atlas, Render (Backend), Vercel (Frontend), Environment Configurations, CORS, Razorpay, Cloudinary, Socket.IO, Leaflet, and GitHub CI/CD.

---

## 📋 Deployment Sequence Overview

| Step | Component | Platform / Service | Purpose |
|---|---|---|---|
| **Step 1** | Database | MongoDB Atlas | Cloud database cluster setup & IP whitelisting |
| **Step 2** | Backend API | Render.com | Node.js Express server deployment |
| **Step 3** | Frontend UI | Vercel | React SPA deployment with routing rewrite |
| **Step 4** | Config | Render & Vercel | Production environment variables injection |
| **Step 5** | Security | Express & Socket.IO | Dynamic Cross-Origin Resource Sharing (CORS) |
| **Step 6** | Payments | Razorpay Dashboard | Test & Live keys and webhook verification |
| **Step 7** | Media Storage | Cloudinary | Asset upload & parking photo verification |
| **Step 8** | Integration | Browser & Network | Leaflet Map, WSS Socket.IO & AI Prediction online validation |
| **Step 9** | Version Control | GitHub | Final production commit & push to `main` |

---

## 🗄️ Step 1: MongoDB Atlas Database Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. Click **Create Cluster** → Choose the free shared tier (**M0 Free**).
3. Select your closest AWS/GCP region (e.g., `Mumbai (ap-south-1)`).
4. **Database Access (User Setup)**:
   - Go to **Security → Database Access** → Click **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: e.g. `parking_admin`.
   - Password: Click **Autogenerate Secure Password** or set a strong password (copy this down).
   - Built-in Role: **Read and write to any database**.
5. **Network Access (IP Whitelist)**:
   - Go to **Security → Network Access** → Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`).
   - *Note*: Render backend runs on dynamic cloud IPs, so `0.0.0.0/0` is required.
6. **Get Connection String**:
   - Go to **Database → Clusters** → Click **Connect**.
   - Choose **Drivers** (Node.js).
   - Copy the URI:
     ```text
     mongodb+srv://parking_admin:<password>@cluster0.xxxxx.mongodb.net/smart_parking?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password and specify the database name `smart_parking`.

---

## ⚙️ Step 2: Backend Render Par Deploy

1. Go to [Render.com](https://render.com) and log in with GitHub.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `sumitbisen/next-park-ai`.
4. Configure service settings:
   - **Name**: `next-park-ai-backend`
   - **Region**: Singapore or Frankfurt (choose nearest to users)
   - **Branch**: `main`
   - **Root Directory**: `backend` *(CRITICAL: Must set to `backend`)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click **Create Web Service**.
6. Render will generate your backend public URL:
   `https://next-park-ai-backend.onrender.com`

---

## 🌐 Step 3: Frontend Vercel Par Deploy

1. Go to [Vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** → **Project**.
3. Import `sumitbisen/next-park-ai`.
4. Configure project settings:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: Click Edit → choose `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `build` (default)
5. `frontend/vercel.json` is already configured in the repo with:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
   *(This ensures that reloading on `/parking/:id`, `/booking/:id`, or `/admin/dashboard` never causes 404 errors).*
6. Click **Deploy**. Vercel will assign your frontend URL:
   `https://next-park-ai.vercel.app`

---

## 🔐 Step 4: Environment Variables Configure

### A. Render (Backend Environment Variables)
Go to your Web Service on Render → **Environment** tab → Add the following:

| Key | Value Example |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` *(or leave default, Render sets automatically)* |
| `MONGO_URI` | `mongodb+srv://parking_admin:password@cluster0.xxxxx.mongodb.net/smart_parking?retryWrites=true&w=majority` |
| `JWT_SECRET` | `your_strong_jwt_production_secret_key_123` |
| `CLIENT_URL` | `https://next-park-ai.vercel.app` |
| `RAZORPAY_KEY_ID` | `rzp_test_...` (or `rzp_live_...`) |
| `RAZORPAY_KEY_SECRET` | `your_razorpay_secret_key` |
| `CLOUDINARY_CLOUD_NAME` | `o5fitfjx` |
| `CLOUDINARY_API_KEY` | `648825323315977` |
| `CLOUDINARY_API_SECRET` | `your_actual_cloudinary_api_secret` |
| `CLOUD_NAME` | `o5fitfjx` |
| `CLOUD_API_KEY` | `648825323315977` |
| `CLOUD_API_SECRET` | `your_actual_cloudinary_api_secret` |

### B. Vercel (Frontend Environment Variables)
Go to Project on Vercel → **Settings** → **Environment Variables** → Add for *Production, Preview, and Development*:

| Key | Value |
|---|---|
| `REACT_APP_API_URL` | `https://next-park-ai-backend.onrender.com/api` |
| `REACT_APP_BACKEND_URL` | `https://next-park-ai-backend.onrender.com` |
| `REACT_APP_SOCKET_URL` | `https://next-park-ai-backend.onrender.com` |
| `REACT_APP_RAZORPAY_KEY_ID` | `rzp_test_...` *(Must match backend `RAZORPAY_KEY_ID`)* |

*Note: After saving environment variables on Vercel, go to **Deployments** → click **Redeploy** so the new build embeds the environment variables.*

---

## 🛡️ Step 5: CORS Update (Already Pre-configured)

The backend [`backend/server.js`](file:///c:/Users/sbise/NEXT%20PARK%20AI/backend/server.js) dynamically resolves allowed origins:
1. Matches localhost for development (`http://localhost:3000`).
2. Matches your production `CLIENT_URL` configured on Render.
3. Automatically allows all Vercel domains (`https://*.vercel.app`) so preview builds and production builds work without CORS errors.
4. Express CORS and Socket.IO CORS are both harmonized with `credentials: true`.

---

## 💳 Step 6: Razorpay Production/Test Configuration

1. Log into [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Toggle between **Test Mode** (for development/testing) and **Live Mode** (for real bank transactions).
3. Go to **Settings → API Keys** → Click **Generate Key**.
4. Copy `Key Id` and `Key Secret`.
5. Set `RAZORPAY_KEY_ID` in backend Render & frontend Vercel (`REACT_APP_RAZORPAY_KEY_ID`).
6. Set `RAZORPAY_KEY_SECRET` in backend Render.
7. Test booking payment flow in the browser using Razorpay test cards or UPI test VPA.

---

## ☁️ Step 7: Cloudinary Verify

1. Log into [Cloudinary Console](https://cloudinary.com/console).
2. Copy your **Cloud Name**, **API Key**, and **API Secret**.
3. Verify that `CLOUDINARY_API_SECRET` in Render environment variables is updated with your real secret (not `YOUR_SECRET_HERE`).
4. Log in as a Parking Owner on the deployed frontend and create a new parking listing with an image upload.
5. Confirm image uploads cleanly and image URL displays from `https://res.cloudinary.com/...`.

---

## 🧪 Step 8: Leaflet / Socket.IO / AI API Online Test

1. **Leaflet Maps**:
   - Visit the live site on Vercel (`https://next-park-ai.vercel.app/parking`).
   - Confirm the OpenStreetMap tiles load over HTTPS without mixed content warnings.
   - Click "Locate Me" to test browser geolocation distance calculation.
2. **Socket.IO Real-Time Telemetry**:
   - Open two browser tabs on the live site on the same parking details/booking page.
   - Book a slot in Tab 1.
   - Confirm Tab 2 instantly turns the slot from **🟢 Available** to **🔴 Booked** without reloading!
   - In browser DevTools Network tab, filter by `WS` to verify WSS connection (`wss://.../socket.io/`).
3. **AI Occupancy Prediction API**:
   - Open any parking details page.
   - Confirm the **🤖 AI Occupancy & Demand Predictor** card loads.
   - Test directly via browser or curl:
     ```bash
     curl https://next-park-ai-backend.onrender.com/api/parking/<PARKING_ID>/prediction
     ```
   - Expect valid JSON with `predictedOccupancy`, `demandLevel`, and smart driver recommendation.

---

## 📦 Step 9: Final Production Build + GitHub

Push all final production configurations to GitHub:

```bash
# 1. Check git status
git status

# 2. Stage all updated files
git add .

# 3. Commit deployment configuration
git commit -m "chore(deployment): configure production cors, vercel rewrites, and environment templates"

# 4. Push to GitHub main branch
git push origin main
```

Once pushed, Render and Vercel will automatically trigger zero-downtime production deployments!
