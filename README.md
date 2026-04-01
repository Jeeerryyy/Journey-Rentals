<p align="center">
  <img src="favicon.svg" width="64" height="64" alt="Journey Rentals Logo" />
</p>

<h1 align="center">Journey Rentals</h1>

<p align="center">
  <strong>A premium self-drive car & bike rental platform built for the Indian market.</strong><br/>
  Real payments · OTP verification · Owner dashboard · WhatsApp notifications
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Razorpay-Live-0066FF?logo=razorpay&logoColor=white" alt="Razorpay" />
  <img src="https://img.shields.io/badge/Cloudinary-Storage-3448C5?logo=cloudinary&logoColor=white" alt="Cloudinary" />
  <img src="https://img.shields.io/badge/Deployed-Vercel%20%2B%20Render-black?logo=vercel&logoColor=white" alt="Deployed" />
</p>

---

## What is Journey Rentals?

Journey Rentals is a full-stack vehicle rental platform where customers can browse, book, and pay for cars and bikes online. The platform handles the entire lifecycle — from vehicle discovery and document upload to Razorpay-powered payments and real-time owner notifications via email, WhatsApp, and push.

Built as a production-grade SaaS for a real rental business operating in India, it handles both **car bookings** (multi-day with pickup/return dates) and **bike bookings** (hourly slots: 3hr, 6hr, 12hr).

---

## Core Features

### For Customers
- **Browse & Filter** — Full vehicle catalog with type filtering (car/bike) and detailed vehicle pages with image galleries
- **Secure Booking Flow** — Multi-step checkout with document upload (Aadhar + License), automatic pricing, and Razorpay payment gateway
- **Email OTP Verification** — Cryptographically secure 6-digit OTP with bcrypt hashing, 10-minute expiry, and rate limiting
- **Google OAuth** — One-tap sign-in via Google with automatic account linking
- **My Bookings** — Track booking status, view details, download invoices as Excel, and cancel active bookings
- **Profile Management** — Update name, email, profile picture (Cloudinary-stored), and delete account

### For the Business Owner
- **Owner Dashboard** — Live stats: total bookings, revenue, vehicle count, recent activity, and time-aware greetings
- **Vehicle Management** — Add/edit/delete vehicles with multi-image upload, dynamic pricing per bike slot, toggle availability
- **Booking Management** — View all bookings with cursor-based pagination, filter by status, search by reference ID, update status, attach pickup photos
- **Fleet Section Editor** — Drag-and-sort homepage fleet showcase with visibility toggles and live preview
- **Real-time Notifications** — Push notifications (Web Push API), email alerts, and WhatsApp messages on every new booking

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, React Router 7, Swiper |
| **Backend** | Node.js, Express 5 (ES Modules) |
| **Database** | MongoDB Atlas (Mongoose 9) |
| **Auth** | JWT (httpOnly cookies), Google OAuth 2.0, bcrypt, OTP with TTL |
| **Payments** | Razorpay (Live mode, HMAC-SHA256 signature verification) |
| **Storage** | Cloudinary (vehicle images, profile pics, booking documents) |
| **Email** | Nodemailer (Gmail SMTP with App Passwords) |
| **Messaging** | Meta WhatsApp Cloud API, Web Push (VAPID) |
| **Security** | Helmet, CORS, rate limiting, mongo-sanitize, express-validator |
| **Deployment** | Vercel (frontend) + Render (backend) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL (Frontend)                       │
│  React 19 + Vite + Tailwind CSS                            │
│  SPA with lazy-loaded routes, ErrorBoundary, AuthContext    │
└────────────────────────┬────────────────────────────────────┘
                         │  HTTPS (credentials: include)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     RENDER (Backend)                        │
│  Express 5 API Server                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │  Helmet  │ │  CORS    │ │  Rate    │ │  Mongo        │  │
│  │ (headers)│ │ (strict) │ │  Limiter │ │  Sanitize     │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │
│                                                             │
│  Routes: /api/auth · /api/vehicles · /api/bookings          │
│          /api/upload · /api/owner · /api/notifications       │
└────┬──────────┬──────────────┬──────────────┬───────────────┘
     │          │              │              │
     ▼          ▼              ▼              ▼
  MongoDB   Cloudinary     Razorpay     Gmail SMTP
   Atlas    (images)      (payments)    + WhatsApp API
```

---

## Security

This project implements several production security measures:

- **httpOnly Cookies** — JWT tokens are never exposed to JavaScript. Stored in httpOnly, Secure, SameSite cookies
- **Helmet** — Full security header suite including CSP, X-Frame-Options, X-Content-Type-Options
- **Rate Limiting** — Global limiter (300/15min) plus targeted limiters on auth and upload routes
- **NoSQL Injection Protection** — `express-mongo-sanitize` strips `$` operators from request bodies
- **Input Validation** — `express-validator` on all auth and booking endpoints with schema-level validation
- **Timing-Safe Comparison** — Owner credential checks use `crypto.timingSafeEqual` to prevent timing attacks
- **OTP Security** — OTPs are bcrypt-hashed before storage with automatic TTL expiry (10 minutes)
- **CORS** — Strict origin policy, only the production frontend URL is allowed
- **Password Hashing** — bcrypt with cost factor 12
- **File Validation** — MIME type whitelisting and size limits on all upload endpoints

---

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/healthz` | Health check |
| `GET` | `/api/vehicles` | List available vehicles |
| `GET` | `/api/vehicles/:id` | Vehicle details |
| `GET` | `/api/vehicles/fleet-section` | Homepage fleet data |

### Auth (Rate Limited)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register + send OTP |
| `POST` | `/api/auth/verify-otp` | Verify email OTP |
| `POST` | `/api/auth/resend-otp` | Resend OTP |
| `POST` | `/api/auth/login` | Login (cookie issued) |
| `POST` | `/api/auth/logout` | Logout (cookie cleared) |
| `GET` | `/api/auth/google` | Google OAuth initiate |
| `GET` | `/api/auth/google/callback` | Google OAuth callback |
| `POST` | `/api/auth/owner-login` | Owner login |
| `POST` | `/api/auth/owner-logout` | Owner logout |

### Protected (Requires Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth/me` | Get current user |
| `PUT` | `/api/auth/profile` | Update profile |
| `PUT` | `/api/auth/profile/avatar` | Upload avatar |
| `DELETE` | `/api/auth/profile` | Delete account |
| `POST` | `/api/bookings/create-order` | Create booking + Razorpay order |
| `POST` | `/api/bookings/verify-payment` | Verify Razorpay signature |
| `GET` | `/api/bookings/mine` | Get user's bookings |
| `PATCH` | `/api/bookings/cancel` | Cancel booking |
| `POST` | `/api/upload/document` | Upload Aadhar + License |

### Owner Only
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/owner/dashboard` | Dashboard stats |
| `GET/POST` | `/api/owner/vehicles` | List / Add vehicles |
| `PATCH/DELETE` | `/api/owner/vehicles-item/:id` | Edit / Delete vehicle |
| `PATCH` | `/api/owner/vehicles-visibility/:id` | Toggle vehicle visibility |
| `GET` | `/api/owner/bookings` | All bookings (paginated) |
| `PATCH` | `/api/owner/bookings/:id` | Update booking status |
| `POST` | `/api/owner/bookings/:id/photo` | Attach pickup photo |
| `GET/PUT` | `/api/owner/fleet-section` | Manage fleet showcase |

---

## Screenshots

The platform features a dark-themed, premium UI optimized for mobile and desktop:

- **Landing Page** — Hero section, fleet showcase, customer reviews, call-to-action
- **Vehicle Catalog** — Filterable grid with car/bike toggle and instant search
- **Booking Flow** — Step-by-step: select vehicle → pick dates/slot → upload documents → pay via Razorpay
- **Owner Dashboard** — Revenue cards, booking pipeline, vehicle management, fleet editor

---

## Project Structure

```
JourneyRentals/
├── api/                        # Express 5 backend
│   ├── index.js                # Server entry — middleware chain + routes
│   ├── _routes/
│   │   ├── auth.js             # Signup, login, OTP, OAuth, profile
│   │   ├── bookings.js         # Create order, verify payment, cancel
│   │   ├── vehicles.js         # Public vehicle listing
│   │   ├── upload.js           # Document upload (Aadhar/License)
│   │   ├── owner.js            # Owner dashboard, vehicles, bookings
│   │   └── notifications.js    # Push notification subscriptions
│   ├── _lib/
│   │   ├── auth.js             # JWT sign/verify, cookie helpers, middleware
│   │   ├── mongodb.js          # Mongoose connection with auto-reconnect
│   │   ├── mailer.js           # Nodemailer email templates
│   │   ├── cloudinary.js       # Cloudinary upload helpers
│   │   ├── otp.js              # Crypto OTP generation + bcrypt storage
│   │   ├── validators.js       # Email + password validation
│   │   ├── whatsapp.js         # Meta WhatsApp Cloud API
│   │   └── models/
│   │       ├── User.js         # User schema (local + Google OAuth)
│   │       ├── Vehicle.js      # Vehicle schema (car + bike)
│   │       ├── Booking.js      # Booking schema with Razorpay payment
│   │       ├── OTP.js          # OTP schema with TTL auto-delete
│   │       ├── FleetSection.js # Homepage fleet showcase schema
│   │       └── PushSubscription.js
│   └── scripts/                # Seed and utility scripts
│
├── client/                     # React 19 + Vite frontend
│   ├── src/
│   │   ├── App.jsx             # Route definitions, ErrorBoundary, guards
│   │   ├── main.jsx            # React DOM entry
│   │   ├── index.css           # Global styles (Tailwind + custom)
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Cookie-based auth state management
│   │   ├── lib/
│   │   │   ├── api.js          # Fetch wrapper with timeout + error handling
│   │   │   └── utils.js        # Shared utilities
│   │   ├── pages/              # Route-level components (lazy loaded)
│   │   │   ├── Home.jsx
│   │   │   ├── Cars.jsx
│   │   │   ├── CarDetails.jsx  # Full booking flow
│   │   │   ├── Login.jsx       # Login + Signup + Google OAuth
│   │   │   ├── OTPVerification.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── HelpSupport.jsx
│   │   │   └── owner/          # Owner dashboard pages
│   │   ├── components/         # Reusable UI components
│   │   └── utils/
│   │       └── themeToggle.js
│   ├── index.html
│   └── vite.config.js
│
├── render.yaml                 # Render deployment config
├── vercel.json                 # Vercel deployment config
└── .gitignore
```

---

## Deployment

| Component | Platform | URL Pattern |
|-----------|----------|-------------|
| Frontend | Vercel | `https://journeyrentals.vercel.app` |
| Backend | Render | `https://journey-rentals-api.onrender.com` |
| Database | MongoDB Atlas | Managed cloud cluster |
| Images | Cloudinary | `res.cloudinary.com/dl7ysqefj/...` |

---

## License

This project is proprietary software. All rights reserved.

Built with ☕ and late nights in Pune, India.
