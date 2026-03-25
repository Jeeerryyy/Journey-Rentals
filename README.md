<div align="center">
  <h1>🚗 JourneyRentals</h1>
  <p>A full-stack self-drive vehicle rental web application for cars & bikes — Solapur, India.</p>
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" />
  <img src="https://img.shields.io/badge/Vite-7-purple?logo=vite" />
  <img src="https://img.shields.io/badge/Node.js-Express-green?logo=node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-brightgreen?logo=mongodb" />
  <img src="https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel" />
</div>

---

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start (Local Dev)](#-quick-start-local-dev)
- [Environment Variables](#-environment-variables)
- [Google OAuth Setup](#-google-oauth-setup)
- [API Reference](#-api-reference)
- [Security](#-security)
- [Deploy to Vercel](#-deploy-to-vercel)
- [Custom Domain Setup](#-custom-domain-setup)

---

## 🏗️ Architecture

Everything runs on **one Vercel project** — no separate backend hosting needed.

```
┌──────────────────────────────────────────────┐
│              Vercel (Single Project)          │
│                                              │
│   journeyrentals.in/*     → React SPA        │
│   journeyrentals.in/api/* → Express (Serverless)
│                                              │
└──────────────┬───────────────────────────────┘
               │
         ┌─────┴─────┐
         ▼           ▼
    MongoDB       Cloudinary
    Atlas          (Images)
```

- **Frontend** (React + Vite) → Built as static files, served from Vercel's CDN
- **Backend** (Express) → Runs as a Vercel Serverless Function at `/api/*`
- **No cold starts** — Vercel serverless functions boot in ~200ms (vs Render's ~30s)

---

## 🛠️ Tech Stack

### Frontend (`client/`)

| Layer | Technology | Purpose |
|---|---|---|
| Framework | React 19 | Component-based UI |
| Build Tool | Vite 7 | Fast HMR, dev proxy to backend |
| Styling | Tailwind CSS v4 + Vanilla CSS | Utility + custom design system |
| Routing | React Router v7 | SPA routing, protected routes |
| Auth State | Custom AuthContext | JWT in localStorage |
| HTTP Client | Custom `api.js` | Fetch + AbortController 10s timeout |
| Carousel | Swiper.js | 3D fleet carousel on homepage |
| Fonts | Bebas Neue + Syne | Google Fonts |

### Backend (`api/`)

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js (ESM) | Vercel Serverless Function |
| Framework | Express.js | REST API routing and middleware |
| Auth | JSON Web Tokens | 7-day signed tokens |
| OAuth | Passport.js + Google OAuth 2.0 | Google login |
| Password | bcryptjs (10 salt rounds) | Password hashing |
| Security | Helmet + express-rate-limit | HTTP headers, brute-force protection |
| Images | Cloudinary | Base64 upload → CDN URLs |

### Database

| Service | Details |
|---|---|
| MongoDB Atlas (Free) | Mongoose ODM, connection pooling via global cache |
| Cloudinary (Free) | Vehicle images, documents, avatars |
| Google Cloud | OAuth 2.0 credentials |

---

## 📁 Project Structure

```
JourneyRentals/
│
├── api/                           # Express backend (Vercel Serverless)
│   ├── index.js                   # App entry — exports Express app
│   ├── package.json               # Server dependencies
│   ├── .env                       # Local env vars (git-ignored)
│   ├── .env.example               # Template for deployment
│   ├── routes/
│   │   ├── auth.js                # Signup, login, Google OAuth
│   │   ├── vehicles.js            # Public vehicle endpoints
│   │   ├── bookings.js            # Customer booking endpoints
│   │   ├── owner.js               # Owner-only management
│   │   └── upload.js              # Document upload
│   └── lib/
│       ├── auth.js                # JWT sign/verify, requireAuth, requireOwner
│       ├── mongodb.js             # Mongoose connection (serverless-safe)
│       ├── cloudinary.js          # Cloudinary config + upload helper
│       └── models/
│           ├── User.js
│           ├── Vehicle.js
│           ├── Booking.js
│           └── FleetSection.js
│
├── client/                        # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── context/AuthContext.jsx
│   │   ├── lib/api.js             # Centralized fetch utility
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Cars.jsx
│   │   │   ├── CarDetails.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── owner/             # Owner dashboard pages
│   │   ├── App.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js             # /api proxy → localhost:5000
│   └── package.json
│
├── vercel.json                    # Routes: /api/* → serverless, /* → client
├── .gitignore
├── CHANGELOG.md
├── AUDIT_REPORT.md
└── README.md
```

---

## ⚡ Quick Start (Local Dev)

### Prerequisites

- Node.js 18+
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works)
- [Cloudinary](https://cloudinary.com/) account (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/JourneyRentals.git
cd JourneyRentals

# Install server dependencies
cd api
npm install
cp .env.example .env      # Fill in your values

# Install client dependencies
cd ../client
npm install
```

### 2. Start Development Servers

```bash
# Terminal 1 — Backend
cd api
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/api/health |

> Vite automatically proxies all `/api/*` requests to `http://localhost:5000` — no CORS issues in development.

---

## 🔐 Environment Variables

### API (`api/.env`)

```env
# MongoDB Atlas
MONGODB_URI=your_mongodb_connection_string

# JWT — use a long random string (min 32 chars)
JWT_SECRET=your_super_secret_jwt_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth 2.0 (see setup guide below)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Owner dashboard credentials
OWNER_EMAIL=owner@yourdomain.com
OWNER_PASSWORD=your_secure_password

# App
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

> **For Vercel:** All these variables go in your Vercel project dashboard → Settings → Environment Variables. No `.env` file is used in production.

---

## 🔑 Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. **Create a new project** (or select existing)
3. Navigate to **APIs & Services → OAuth consent screen**
   - User type: **External**
   - Fill in App name, support email, developer email
4. Navigate to **APIs & Services → Credentials**
   - Click **Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
5. Add **Authorized redirect URIs**:
   ```
   http://localhost:5000/api/auth/google/callback     ← development
   https://journey-henna-omega.vercel.app/api/auth/google/callback  ← production
   ```
6. Add **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   https://journey-henna-omega.vercel.app
   ```
7. Copy **Client ID** and **Client Secret** into `api/.env` (locally) and Vercel dashboard (production)

---

## 📡 API Reference

### Auth (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/signup` | Public | Create customer account |
| `POST` | `/login` | Public | Login with email + password |
| `POST` | `/owner-login` | Public | Owner login |
| `PUT` | `/profile` | Customer | Update name/email |
| `PUT` | `/profile/avatar` | Customer | Upload avatar |
| `DELETE` | `/profile` | Customer | Delete account |
| `GET` | `/google` | Public | Initiate Google OAuth |
| `GET` | `/google/callback` | Public | Google OAuth callback |

### Vehicles (`/api/vehicles`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Public | Get all vehicles |
| `GET` | `/fleet-section` | Public | Fleet section for homepage |
| `GET` | `/:id` | Public | Get vehicle by ID |

### Bookings (`/api/bookings`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/create-order` | Customer | Create new booking |
| `GET` | `/mine` | Customer | Get my bookings |
| `PATCH` | `/cancel` | Customer | Cancel a booking |
| `POST` | `/verify-payment` | Customer | Verify payment (not yet implemented) |

### Owner (`/api/owner`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/dashboard` | Owner | Stats overview |
| `GET` | `/vehicles` | Owner | All vehicles |
| `POST` | `/vehicles` | Owner | Add new vehicle |
| `PATCH` | `/vehicles-item/:id` | Owner | Update vehicle |
| `DELETE` | `/vehicles-item/:id` | Owner | Delete vehicle |
| `POST` | `/upload/images` | Owner | Upload images to Cloudinary |
| `GET` | `/bookings` | Owner | All bookings (paginated) |
| `GET` | `/bookings/:id` | Owner | Single booking |
| `PATCH` | `/bookings/:id` | Owner | Update booking status |
| `GET` | `/fleet-section` | Owner | Fleet CMS |
| `PUT` | `/fleet-section` | Owner | Update fleet CMS |

---

## 🔒 Security

| Feature | Implementation |
|---|---|
| HTTP security headers | `helmet()` middleware |
| Brute-force protection | `express-rate-limit` — 10 req/15min on auth endpoints |
| Global rate limit | 300 req/15min per IP |
| CORS | Restricted to `FRONTEND_URL` only |
| JWT auth | 7-day expiry, `HS256`, verified server-side every request |
| Role-based access | `requireAuth` (customer) / `requireOwner` (owner) middleware |
| Password hashing | `bcrypt` with 10 salt rounds |
| Serverless DB | MongoDB connection cached in global scope (no pool exhaustion) |

---

## 🚀 Deploy to Vercel

### Step 1 — Push to GitHub

```bash
cd d:\JourneyRentals
git add .
git commit -m "Refactor: Vercel monorepo with serverless API"
git push origin main
```

### Step 2 — Import on Vercel

1. Go to [vercel.com](https://vercel.com) → Log in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your **JourneyRentals** repository
4. **Leave "Root Directory" as `.`** (root — the `vercel.json` handles everything)
5. **Framework Preset**: Other
6. **No custom build commands needed** — `vercel.json` handles the builds

### Step 3 — Add Environment Variables

In the Vercel dashboard → **Settings** → **Environment Variables**, add all variables from `api/.env.example`:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A strong random 64-char string |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth client secret |
| `OWNER_EMAIL` | Owner dashboard login email |
| `OWNER_PASSWORD` | Owner dashboard login password |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://journey-henna-omega.vercel.app` |
| `BACKEND_URL` | `https://journey-henna-omega.vercel.app` |

> **Generate a strong JWT_SECRET:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
> ```

### Step 4 — Deploy

Click **"Deploy"**. Vercel will:
1. Build the React frontend (`client/` → `dist/`)
2. Bundle the Express API (`api/index.js` → serverless function)
3. Route `/api/*` to the function and `/*` to the static frontend

Your site will be live at `https://your-project.vercel.app`.

---

## 🌐 Custom Domain Setup

### Step 1 — Add Domain in Vercel

1. Vercel dashboard → Your project → **Settings** → **Domains**
2. Add `journeyrentals.in`
3. Also add `www.journeyrentals.in`

### Step 2 — Update DNS Records

Go to your domain registrar and set:

| Type | Name | Value |
|------|------|-------|
| **A** | `@` | `76.76.21.21` |
| **CNAME** | `www` | `cname.vercel-dns.com` |

> DNS propagation takes 5 min to 48 hours. Usually done within 30 minutes.

### Step 3 — Update Google OAuth

In Google Cloud Console → Credentials → your OAuth client:
- Add redirect URI: `https://journey-henna-omega.vercel.app/api/auth/google/callback`
- Add JavaScript origin: `https://journey-henna-omega.vercel.app`

### Step 4 — Update Environment Variables

In Vercel dashboard, update:
- `FRONTEND_URL` = `https://journey-henna-omega.vercel.app`
- `BACKEND_URL` = `https://journey-henna-omega.vercel.app`

Redeploy for changes to take effect.

---

## 👤 Owner Access

The owner dashboard is at `/owner-login`. Credentials are set via environment variables:

```
OWNER_EMAIL=your_email@journeyrentals.com
OWNER_PASSWORD=your_strong_password
```

**Change these before going to production.**

---

## 📦 How `vercel.json` Works

```json
{
  "builds": [
    { "src": "api/index.js", "use": "@vercel/node" },
    { "src": "client/package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.js" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/client/$1" }
  ]
}
```

- **`@vercel/node`** — Bundles `api/index.js` as a single serverless function
- **`@vercel/static-build`** — Runs `npm run build` in `client/`, serves `dist/`
- **Route 1** — All `/api/*` requests hit the Express serverless function
- **Route 2** — `"handle": "filesystem"` serves actual static files (JS, CSS, images)
- **Route 3** — Everything else → `client/index.html` (SPA routing)

---

<div align="center">
  <p>Built with ❤️ for JourneyRentals · Solapur, India</p>
</div>
