# Journey Rentals — Technical Project Report

> **Audit Date:** 2026-04-13  
> **Auditor:** Automated Technical Analysis  
> **Codebase Revision:** Current HEAD  
> **Classification:** Internal Technical Reference

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Tools](#2-tech-stack--tools)
3. [Project Structure](#3-project-structure)
4. [Architecture & Data Flow](#4-architecture--data-flow)
5. [Database Schema](#5-database-schema)
6. [API Surface — Complete Endpoint Reference](#6-api-surface--complete-endpoint-reference)
7. [Authentication & Security](#7-authentication--security)
8. [Frontend Architecture](#8-frontend-architecture)
9. [External Service Integrations](#9-external-service-integrations)
10. [Configuration & Environment Variables](#10-configuration--environment-variables)
11. [Deployment & DevOps](#11-deployment--devops)
12. [Testing](#12-testing)
13. [Known Issues & Technical Debt](#13-known-issues--technical-debt)
14. [Recommendations & Next Steps](#14-recommendations--next-steps)

---

## 1. Project Overview

### What It Does

Journey Rentals is a **production-ready, full-stack vehicle rental platform** serving the Solapur (India) market. It enables end-users to browse, book, and pay for self-drive car and bike rentals through a modern web interface, while providing the business owner with a comprehensive admin dashboard for fleet management, booking oversight, and real-time notifications.

### Problem It Solves

Replaces manual, phone/WhatsApp-based booking workflows with:

- **Automated online booking** with integrated Razorpay payment processing
- **KYC document collection** (Aadhar + License) uploaded directly to Cloudinary
- **Real-time owner notifications** via email, WhatsApp Cloud API, and Web Push
- **Fleet management** through a dedicated owner admin panel
- **Customer self-service** for booking history, profile management, and account operations

### Current Status

| Aspect            | Status                                          |
|--------------------|------------------------------------------------|
| **Codebase**       | ✅ Complete — Production-ready                  |
| **Frontend**       | ✅ Fully functional SPA with dark/light themes  |
| **Backend API**    | ✅ All endpoints implemented with security middleware |
| **Authentication** | ✅ JWT + OAuth + OTP email verification          |
| **Payments**       | ✅ Razorpay integration with signature verification |
| **Deployment**     | ✅ Configured for Vercel (client) + Render (API) |
| **Testing**        | ⚠️ Minimal — only 1 test file exists             |

---

## 2. Tech Stack & Tools

### Languages

| Language    | Usage                          |
|-------------|-------------------------------|
| JavaScript  | 100% of application code (ES Modules throughout) |
| CSS         | Tailwind CSS v4 + custom design system |
| HTML        | JSX templates (React)          |

### Frontend

| Library / Tool              | Version   | Purpose                                         |
|------------------------------|-----------|------------------------------------------------|
| React                        | ^19.0.0   | UI component framework                          |
| React DOM                    | ^19.0.0   | DOM rendering engine                             |
| React Router DOM             | ^7.1.3    | Client-side routing & navigation                 |
| Vite                         | ^6.1.0    | Build tool & dev server                          |
| @vitejs/plugin-react         | ^4.3.4    | Vite React integration (Fast Refresh)            |
| Tailwind CSS (v4)            | ^4.0.6    | Utility-first CSS framework                     |
| @tailwindcss/vite            | ^4.0.6    | Vite plugin for Tailwind                         |
| Swiper                       | ^11.2.1   | Touch-enabled carousel/slider                   |
| @vercel/speed-insights       | ^1.2.0    | Production performance analytics                 |

### Backend

| Library / Tool              | Version     | Purpose                                         |
|------------------------------|-------------|------------------------------------------------|
| Node.js                     | ≥ 20.x      | Runtime (specified in `render.yaml`)             |
| Express                     | ^5.0.1       | HTTP framework (v5 — latest)                    |
| Mongoose                    | ^8.12.1      | MongoDB ODM                                     |
| jsonwebtoken                | ^9.0.2       | JWT signing & verification                       |
| bcryptjs                    | ^3.0.2       | Password + OTP hashing                           |
| passport                    | ^0.7.0       | Authentication middleware                        |
| passport-google-oauth20     | ^2.0.0       | Google OAuth 2.0 strategy                        |
| cloudinary                  | ^2.5.1       | Image/document cloud storage                    |
| razorpay                    | ^2.9.5       | Payment gateway SDK                              |
| nodemailer                  | ^6.10.0      | SMTP email delivery (Gmail)                      |
| web-push                    | ^3.6.7       | VAPID Web Push notifications                     |
| axios                       | ^1.7.9       | HTTP client for WhatsApp API                     |
| dotenv                      | ^16.4.7      | Environment variable management                  |
| cookie-parser               | ^1.4.7       | Cookie parsing middleware                        |
| cors                        | ^2.8.5       | Cross-Origin Resource Sharing                    |
| helmet                      | ^8.0.0       | HTTP security headers                            |
| express-rate-limit           | ^7.5.0       | Rate limiting middleware                         |
| express-validator            | ^7.2.1       | Request body/query validation                    |
| express-mongo-sanitize       | ^2.2.0       | NoSQL injection prevention                       |
| hpp                          | ^0.2.3       | HTTP Parameter Pollution protection              |
| multer                       | ^1.4.5-lts.2 | Multipart file upload handling                  |
| file-type                    | ^20.4.1      | Binary file magic-number validation              |
| uuid                         | ^11.0.5      | Unique request ID generation                     |

### Dev Dependencies

| Tool                        | Version   | Purpose                                         |
|------------------------------|-----------|------------------------------------------------|
| ESLint                       | ^9.19.0   | Code quality linting                             |
| @eslint/js                   | ^9.19.0   | ESLint core configuration                        |
| eslint-plugin-react-hooks    | ^5.0.0    | React Hooks linting rules                        |
| eslint-plugin-react-refresh  | ^0.4.18   | React Refresh linting rules                      |
| globals                      | ^15.14.0  | Global variable definitions for ESLint           |
| supertest                    | ^7.1.0    | HTTP assertion library (testing)                 |
| vitest                       | ^3.0.9    | Test runner (Vite-native)                        |
| concurrently                 | ^9.1.2    | Parallel npm script runner                       |

### External Services

| Service                     | Purpose                                          |
|------------------------------|------------------------------------------------|
| MongoDB Atlas               | Cloud database (production)                      |
| Cloudinary                  | Image & document CDN storage                     |
| Razorpay                    | Indian payment gateway (UPI, cards, wallets)     |
| Google Cloud (OAuth)        | Social login (Google Sign-In)                    |
| Gmail SMTP                  | Transactional emails (OTP, booking confirmations)|
| Meta WhatsApp Cloud API     | Owner booking notifications (optional)           |
| Web Push (VAPID)            | Browser push notifications to owner              |
| Vercel                      | Frontend hosting & CDN                           |
| Render                      | Backend hosting (Docker/Node)                    |

---

## 3. Project Structure

```
JourneyRentals/
├── README.md                          # Project overview & setup instructions
├── package.json                       # Root workspace — concurrently runs client + API
├── render.yaml                        # Render deployment blueprint for API
│
├── api/                               # ─── BACKEND (Express API) ──────────────
│   ├── package.json                   # API dependencies & scripts
│   ├── .env.example                   # Environment variable template (66 lines)
│   ├── _seed.js                       # Database seed script (11 vehicles)
│   │
│   ├── src/
│   │   ├── server.js                  # Entry point — DB connect, graceful shutdown
│   │   ├── app.js                     # Express app config, middleware, routes (256 lines)
│   │   │
│   │   ├── config/
│   │   │   ├── db.js                  # Mongoose connection with auto-reconnect
│   │   │   └── cloudinary.js          # Cloudinary SDK configuration
│   │   │
│   │   ├── models/
│   │   │   ├── User.js                # User schema (customer/owner roles)
│   │   │   ├── Vehicle.js             # Vehicle schema (car/bike with pricing)
│   │   │   ├── Booking.js             # Booking schema (Razorpay, KYC, TTL index)
│   │   │   ├── OTP.js                 # OTP schema (bcrypt-hashed, 10min TTL)
│   │   │   ├── FleetSection.js        # CMS-style fleet showcase data
│   │   │   └── PushSubscription.js    # Web Push subscription storage
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js     # Signup, login, OTP, OAuth, profile (476 lines)
│   │   │   ├── bookings.controller.js # Booking CRUD, Razorpay, notifications (311 lines)
│   │   │   ├── vehicles.controller.js # Public vehicle listing & detail (64 lines)
│   │   │   ├── owner.controller.js    # Admin dashboard, fleet CRUD (496 lines)
│   │   │   ├── upload.controller.js   # KYC document upload to Cloudinary (73 lines)
│   │   │   └── notifications.controller.js # Push subscription management (44 lines)
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.js                # Auth routes + Google OAuth strategy (159 lines)
│   │   │   ├── bookings.js            # Booking routes with validation (61 lines)
│   │   │   ├── vehicles.js            # Public vehicle routes (16 lines)
│   │   │   ├── owner.js               # Owner admin routes (52 lines)
│   │   │   ├── upload.js              # Document upload route (20 lines)
│   │   │   └── notifications.js       # Push notification routes (17 lines)
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js                # JWT, cookies, lockout, RBAC guards (212 lines)
│   │   │   ├── validators.js          # Email & password validation (84 lines)
│   │   │   └── errorTracker.js        # Structured JSON logging middleware (105 lines)
│   │   │
│   │   └── services/
│   │       ├── mailer.js              # Nodemailer transactional emails (278 lines)
│   │       ├── otp.js                 # OTP generation, hashing, verification (52 lines)
│   │       └── whatsapp.js            # Meta WhatsApp Cloud API integration (77 lines)
│   │
│   └── tests/
│       └── responses.test.js          # Data leak prevention test (34 lines)
│
├── client/                            # ─── FRONTEND (React SPA) ───────────────
│   ├── package.json                   # Client dependencies & scripts
│   ├── .env.example                   # Client env template (2 variables)
│   ├── vite.config.js                 # Vite config with chunk splitting & console dropping
│   ├── vercel.json                    # Vercel deployment config with SPA rewrites
│   ├── eslint.config.js               # ESLint configuration
│   ├── index.html                     # HTML entry point
│   │
│   ├── public/
│   │   ├── sw.js                      # Service Worker for push notifications
│   │   └── favicon.svg                # Application favicon
│   │
│   └── src/
│       ├── main.jsx                   # React entry point + SW registration
│       ├── App.jsx                    # Root component — routing, guards, ErrorBoundary
│       ├── index.css                  # Design system (1422 lines of CSS)
│       │
│       ├── context/
│       │   └── AuthContext.jsx        # Cookie-based auth state manager (162 lines)
│       │
│       ├── lib/
│       │   ├── api.js                 # Fetch-based API client with auto-refresh (159 lines)
│       │   └── utils.js               # Shared utilities (toBase64, statusConfig)
│       │
│       ├── utils/
│       │   └── themeToggle.js         # View Transition API theme animations (74 lines)
│       │
│       ├── assets/
│       │   └── assets.js              # Asset URLs & menu link definitions
│       │
│       ├── components/
│       │   ├── Navbar.jsx             # Main navigation with theme toggle (258 lines)
│       │   ├── Footer.jsx             # Site footer (24 lines)
│       │   └── Icons.jsx              # Reusable SVG icon components (68 lines)
│       │
│       └── features/
│           ├── home/
│           │   ├── Home.jsx           # Home page composition
│           │   ├── Hero.jsx           # Hero section with stats
│           │   ├── AboutSection.jsx   # Features & trust badges
│           │   ├── ReviewsSection.jsx # Auto-scrolling review marquee
│           │   ├── CTASection.jsx     # Call-to-action with animations
│           │   └── Background.jsx     # Ambient gradient background
│           │
│           ├── vehicles/
│           │   ├── Cars.jsx           # Vehicle listing page with filters (25.9 KB)
│           │   ├── CarDetails.jsx     # Vehicle detail + booking flow (51.7 KB)
│           │   ├── CarCard.jsx        # Vehicle card component
│           │   └── FleetSection.jsx   # Fleet carousel (Swiper-based, 18.2 KB)
│           │
│           ├── bookings/
│           │   └── MyBookings.jsx     # Customer booking history (15.5 KB)
│           │
│           ├── auth/
│           │   ├── Login.jsx          # Login + signup with tab toggle (15.9 KB)
│           │   └── OTPVerification.jsx # Email OTP verification (8.8 KB)
│           │
│           ├── profile/
│           │   └── Profile.jsx        # Customer profile management (9.7 KB)
│           │
│           ├── support/
│           │   └── HelpSupport.jsx    # Contact channels (WhatsApp, Phone, IG, Maps)
│           │
│           └── owner/
│               ├── Layout.jsx         # Admin layout with sidebar + navbar (14.4 KB)
│               ├── Dashboard.jsx      # Admin analytics dashboard (13.5 KB)
│               ├── AddCar.jsx         # Vehicle creation form (26.5 KB)
│               ├── ManageCars.jsx     # Vehicle CRUD management (18.0 KB)
│               ├── ManageBookings.jsx # Booking management + search (26.0 KB)
│               ├── FleetEditor.jsx    # CMS fleet section editor (24.7 KB)
│               ├── OwnerLogin.jsx     # Admin login page (8.2 KB)
│               ├── Profile.jsx        # Owner profile view (3.5 KB)
│               ├── BookingPhotoModal.jsx # Photo capture for bookings (13.0 KB)
│               ├── NotificationToggle.jsx # Push notification opt-in (5.8 KB)
│               ├── NavbarOwner.jsx    # Owner top navigation
│               ├── Sidebar.jsx        # Owner sidebar navigation
│               └── Title.jsx          # Page title component
```

**File Count:** ~65 source files (excluding `node_modules`)  
**Total Lines of Code (estimated):** ~6,500 (API) + ~5,000 (client components) + ~1,422 (CSS) ≈ **12,900 lines**

---

## 4. Architecture & Data Flow

### High-Level Architecture

```
┌─────────────────────────────┐          ┌──────────────────────────────────┐
│       FRONTEND (SPA)        │          │          BACKEND (API)           │
│   React 19 + Vite + TW4    │          │    Express 5 + Mongoose 8       │
│                             │          │                                  │
│  ┌─────────┐ ┌──────────┐  │  HTTP    │  ┌──────────────────────────┐   │
│  │ Navbar  │ │ AuthCtx  │  │──────────│  │  Security Middleware     │   │
│  └─────────┘ └──────────┘  │ cookies  │  │  Helmet│CORS│RateLimit  │   │
│                             │          │  │  MongoSanit│HPP│ReqID   │   │
│  ┌──────────────────────┐  │          │  └──────┬───────────────────┘   │
│  │   Feature Modules    │  │          │         ▼                        │
│  │  Home│Cars│Bookings  │  │          │  ┌──────────────────────────┐   │
│  │  Auth│Owner│Profile  │  │          │  │      Route Layer         │   │
│  └──────────────────────┘  │          │  │  auth│bookings│vehicles  │   │
│                             │          │  │  owner│upload│notifs    │   │
│  ┌──────────────────────┐  │          │  └──────┬───────────────────┘   │
│  │    API Client        │  │          │         ▼                        │
│  │  lib/api.js          │  │          │  ┌──────────────────────────┐   │
│  │  Auto-refresh on 401 │  │          │  │    Controller Layer      │   │
│  └──────────────────────┘  │          │  │  Business logic + I/O   │   │
│                             │          │  └──────┬───────────────────┘   │
│  ┌──────────────────────┐  │          │         ▼                        │
│  │    Service Worker    │  │          │  ┌──────────────────────────┐   │
│  │  Push Notifications  │  │          │  │    Service Layer         │   │
│  └──────────────────────┘  │          │  │  Mailer│OTP│WhatsApp    │   │
└─────────────────────────────┘          │  └──────────────────────────┘   │
        │                                │         │                        │
        │  Vercel CDN                    │         ▼                        │
        │                                │  ┌──────────────────────────┐   │
        │                                │  │    Data Layer            │   │
        │                                │  │  MongoDB (Mongoose ODM)  │   │
        │                                │  └──────────────────────────┘   │
        │                                │         │                        │
        │                                │         ▼                        │
        │                                │  ┌────────┬─────────┬────────┐ │
        │                                │  │Cloudi- │Razorpay │ Gmail  │ │
        │                                │  │nary    │Gateway  │ SMTP   │ │
        │                                │  └────────┴─────────┴────────┘ │
        │                                └──────────────────────────────────┘
        │                                           │
        │                                     Render.com
```

### Core Data Flow: Booking Lifecycle

```
Customer                    Frontend                      API                        External
   │                          │                            │                            │
   │── Browse vehicles ──────►│── GET /api/vehicles ──────►│── Vehicle.find() ────────►│
   │                          │◄── vehicle list ──────────│                            │
   │                          │                            │                            │
   │── Select vehicle ───────►│── GET /api/vehicles/:id ──►│── Vehicle.findById() ────►│
   │                          │◄── vehicle detail ────────│                            │
   │                          │                            │                            │
   │── Upload KYC docs ──────►│── POST /api/upload/doc ───►│── Cloudinary.upload() ───►│ Cloudinary
   │                          │◄── document URLs ─────────│◄── secure_url ────────────│
   │                          │                            │                            │
   │── Submit booking ───────►│── POST /bookings/create ──►│── Razorpay.orders.create()►│ Razorpay
   │                          │◄── razorpay_order_id ─────│◄── order object ──────────│
   │                          │                            │                            │
   │── Complete payment ─────►│── POST /bookings/verify ──►│── HMAC signature verify ─►│
   │                          │                            │── Booking.save(confirmed) │
   │                          │                            │── sendConfirmEmail() ────►│ Gmail SMTP
   │                          │                            │── sendOwnerEmail() ──────►│ Gmail SMTP
   │                          │                            │── sendOwnerWhatsApp() ───►│ Meta WA API
   │                          │                            │── webpush.sendNotif() ───►│ VAPID Push
   │                          │◄── booking confirmed ─────│                            │
```

---

## 5. Database Schema

### Collections

#### `users`

| Field          | Type     | Constraints                            | Description                        |
|----------------|----------|----------------------------------------|------------------------------------|
| `name`         | String   | Required, trimmed                      | Full name                          |
| `email`        | String   | Required, unique, lowercase            | Login identifier                   |
| `passwordHash` | String   | Default: `''`                          | Bcrypt hash (empty for OAuth)      |
| `phone`        | String   | Default: `''`                          | Contact number                     |
| `role`         | String   | Enum: `customer`, `owner`              | Access level                       |
| `provider`     | String   | Enum: `local`, `google`                | Auth provider                      |
| `googleId`     | String   | Sparse index                           | Google OAuth ID                    |
| `avatarUrl`    | String   | Default: `''`                          | Cloudinary profile picture URL     |
| `isVerified`   | Boolean  | Default: `false`                       | Email verification status          |
| `createdAt`    | Date     | Auto-generated                         | Registration timestamp             |

**Indexes:** `{ email: 1 }` (unique), `{ googleId: 1 }` (sparse)

#### `vehicles`

| Field             | Type     | Constraints                            | Description                        |
|-------------------|----------|----------------------------------------|------------------------------------|
| `type`            | String   | Enum: `car`, `bike`, required          | Vehicle category                   |
| `brand`           | String   | Required                               | Manufacturer                       |
| `model`           | String   | Required                               | Model name                         |
| `year`            | Number   | Required                               | Manufacturing year                 |
| `category`        | String   | Required                               | Sub-category (Hatchback, SUV, etc.)|
| `transmission`    | String   | Enum: `Manual`, `Automatic`            | Transmission type                  |
| `fuelType`        | String   | Required                               | Fuel type (Petrol, CNG, etc.)      |
| `sittingCapacity` | Number   | Required                               | Passenger capacity                 |
| `isAvailable`     | Boolean  | Default: `true`                        | Availability toggle                |
| `image`           | String   | Required                               | Primary image URL                  |
| `images`          | [String] |                                        | Gallery image URLs                 |
| `description`     | String   |                                        | Vehicle description                |
| `features`        | [String] |                                        | Feature list                       |
| `locations`       | [String] |                                        | Pickup/dropoff locations           |
| `pricePerDay`     | Number   |                                        | Daily rental rate (cars)           |
| `bikeSlots`       | Object   | `{price3hr, price6hr, price12hr}`      | Slot-based pricing (bikes)         |

**Indexes:** `{ type: 1, isAvailable: 1 }`

#### `bookings`

| Field              | Type     | Constraints                           | Description                        |
|--------------------|----------|---------------------------------------|------------------------------------|
| `userId`           | ObjectId | Ref: `User`, required                 | Customer reference                 |
| `vehicleId`        | ObjectId | Ref: `Vehicle`, required              | Vehicle reference                  |
| `bookingType`      | String   | Enum: `car`, `bike`                   | Rental type                        |
| `customerInfo`     | Object   | `{name, email, phone, pickupLocation}`| Customer snapshot                  |
| `startDate`        | Date     |                                       | Rental start                       |
| `endDate`          | Date     |                                       | Rental end                         |
| `bikeSlot`         | String   |                                       | Bike time slot                     |
| `totalPrice`       | Number   | Required                              | Total rental amount (INR)          |
| `securityDeposit`  | Number   | Default: `0`                          | Refundable deposit                 |
| `status`           | String   | Enum: `pending`, `confirmed`, `completed`, `cancelled` | Booking state |
| `razorpayOrderId`  | String   |                                       | Razorpay order reference           |
| `razorpayPaymentId`| String   |                                       | Razorpay payment reference         |
| `documents`        | Object   | `{aadhar: {url,publicId}, license: {url,publicId}}` | KYC documents |
| `bookingPhoto`     | String   |                                       | Owner-uploaded vehicle photo       |
| `refId`            | String   | Unique                                | Human-readable booking ID (JR-XXXX)|
| `expiresAt`        | Date     | TTL index (30 min)                    | Auto-cleanup for unpaid bookings   |

**Key Feature:** The `expiresAt` field uses a MongoDB TTL index to automatically delete pending bookings that are not paid within 30 minutes.

#### `otps`

| Field       | Type   | TTL           | Description                          |
|-------------|--------|---------------|--------------------------------------|
| `email`     | String | —             | User email (lowercase, indexed)      |
| `otp`       | String | —             | Bcrypt-hashed OTP                    |
| `createdAt` | Date   | 600s (10 min) | Auto-expires via MongoDB TTL index   |

#### `fleetsections`

Singleton CMS document for the homepage fleet showcase.

| Field        | Type          | Description                              |
|--------------|---------------|------------------------------------------|
| `heading`    | String        | Section heading text                     |
| `subheading` | String        | Section subheading text                  |
| `vehicles`   | [SubDocument] | Array of `{name, category, seats, fuel, transmission, pricePerDay, image, isFeatured, isVisible, order}` |

#### `pushsubscriptions`

| Field      | Type   | Description                              |
|------------|--------|------------------------------------------|
| `endpoint` | String | Unique push endpoint URL                 |
| `keys`     | Object | `{p256dh, auth}` — encryption keys      |

---

## 6. API Surface — Complete Endpoint Reference

### Authentication (`/api/auth`)

| Method | Path                    | Auth     | Rate Limit        | Description                          |
|--------|-------------------------|----------|-------------------|--------------------------------------|
| POST   | `/signup`               | Public   | 10/15min          | Register new customer (triggers OTP) |
| POST   | `/verify-otp`           | Public   | 5/15min           | Verify email OTP                     |
| POST   | `/resend-otp`           | Public   | 3/60min           | Resend OTP email                     |
| POST   | `/login`                | Public   | 10/15min          | Customer login (sets cookie)         |
| POST   | `/refresh`              | Cookie   | —                 | Refresh expired access token         |
| POST   | `/logout`               | Cookie   | —                 | Clear auth cookies                   |
| POST   | `/owner-login`          | Public   | 10/15min          | Owner dashboard login                |
| POST   | `/owner-logout`         | Cookie   | —                 | Clear owner auth cookies             |
| GET    | `/me`                   | Customer | —                 | Get current user profile             |
| PUT    | `/profile`              | Customer | —                 | Update name/email                    |
| PUT    | `/profile/avatar`       | Customer | —                 | Upload avatar (multipart, max 5MB)   |
| DELETE | `/profile`              | Customer | —                 | Delete account                       |
| GET    | `/google`               | Public   | —                 | Initiate Google OAuth                |
| GET    | `/google/callback`      | Public   | —                 | Google OAuth callback                |

### Vehicles (`/api/vehicles`)

| Method | Path                    | Auth     | Description                          |
|--------|-------------------------|----------|--------------------------------------|
| GET    | `/`                     | Public   | List available vehicles (filterable by `type`) |
| GET    | `/fleet-section`        | Public   | Get homepage fleet showcase data     |
| GET    | `/:id`                  | Public   | Get single vehicle details           |

### Bookings (`/api/bookings`)

| Method | Path                    | Auth     | Rate Limit        | Description                          |
|--------|-------------------------|----------|-------------------|--------------------------------------|
| POST   | `/create-order`         | Customer | 10/15min          | Create booking + Razorpay order      |
| POST   | `/verify-payment`       | Customer | —                 | Verify Razorpay payment signature    |
| GET    | `/mine`                 | Customer | —                 | Get customer's booking history       |
| PATCH  | `/cancel`               | Customer | —                 | Cancel a pending booking             |

### Uploads (`/api/upload`)

| Method | Path                    | Auth     | Rate Limit        | Description                          |
|--------|-------------------------|----------|-------------------|--------------------------------------|
| POST   | `/document`             | Customer | 15/15min          | Upload Aadhar + License (base64→Cloudinary) |

### Owner (`/api/owner`) — All routes require `requireOwner` middleware

| Method | Path                         | Description                          |
|--------|-------------------------------|--------------------------------------|
| GET    | `/dashboard`                  | Aggregate statistics                 |
| GET    | `/vehicles`                   | List all vehicles (including hidden) |
| POST   | `/vehicles`                   | Create new vehicle                   |
| PATCH  | `/vehicles-item/:id`          | Update vehicle details               |
| DELETE | `/vehicles-item/:id`          | Delete vehicle                       |
| PATCH  | `/vehicles-visibility/:id`    | Toggle vehicle visibility            |
| POST   | `/upload/images`              | Upload vehicle images (rate limited) |
| GET    | `/bookings`                   | List bookings (cursor pagination + status filter) |
| GET    | `/bookings/search/:refId`     | Search booking by reference ID       |
| GET    | `/bookings/:id`               | Get single booking detail            |
| PATCH  | `/bookings/:id`               | Update booking status                |
| POST   | `/bookings/:id/photo`         | Upload booking delivery photo        |
| DELETE | `/bookings/:id/photo`         | Delete booking delivery photo        |
| GET    | `/fleet-section`              | Get fleet section data (admin view)  |
| PUT    | `/fleet-section`              | Update fleet section CMS data        |

### Notifications (`/api/notifications`) — All routes require `requireOwner`

| Method | Path                    | Description                          |
|--------|-------------------------|--------------------------------------|
| POST   | `/subscribe`            | Register push notification subscription |
| DELETE | `/unsubscribe`          | Remove push notification subscription  |

### Health Check

| Method | Path        | Description                                   |
|--------|-------------|-----------------------------------------------|
| GET    | `/healthz`  | Returns `200 OK` (basic liveness probe)       |

---

## 7. Authentication & Security

### Authentication Flow

```
CUSTOMER FLOW                           OWNER FLOW
─────────────                           ──────────
1. POST /signup (name,email,pass)       1. POST /owner-login (email,pass)
2. Email OTP sent via Gmail SMTP        2. Compare against OWNER_EMAIL / OWNER_PASSWORD env vars
3. POST /verify-otp (email,otp)         3. Set httpOnly cookie: jr_token_owner
4. Set httpOnly cookies:                4. Role: 'owner' in JWT payload
   - jr_token (15min access)
   - jr_refresh (7-day refresh)
5. GET /me to restore session

GOOGLE OAUTH FLOW
─────────────────
1. GET /google → redirect to Google
2. Google callback → upsert User
3. Set jr_token + jr_refresh cookies
4. Redirect to frontend with user data
```

### Security Measures

| Layer              | Implementation                                            |
|--------------------|----------------------------------------------------------|
| **Cookies**        | `httpOnly: true`, `secure: true` (prod), `SameSite: None` (prod) / `Lax` (dev) |
| **JWT**            | `JWT_SECRET` minimum 32 characters enforced at boot       |
| **Token Rotation** | Refresh tokens have `jti` (unique ID) for rotation. Used tokens are invalidated in-memory. |
| **Account Lockout**| 5 failed logins → 15-minute lockout (in-memory `Map`)    |
| **Password Policy**| Min 8 chars, uppercase, lowercase, number, no name/email, no common passwords |
| **OTP Security**   | Cryptographic OTP (`crypto.randomInt`), bcrypt-hashed storage, 10-minute TTL |
| **Helmet**         | Full security headers (CSP, HSTS, X-Frame-Options, etc.) |
| **CORS**           | Strict origin whitelist from `FRONTEND_URL` env var       |
| **Rate Limiting**  | Per-route rate limits (auth: 10/15min, OTP: 5/15min, resend: 3/60min, orders: 10/15min, uploads: 15-20/15min) |
| **NoSQL Injection**| `express-mongo-sanitize` strips `$` and `.` from request bodies |
| **HPP**            | `hpp` middleware prevents HTTP Parameter Pollution        |
| **Request IDs**    | UUID v4 assigned to every request for tracing             |
| **File Validation**| Magic-number validation via `file-type` + MIME whitelist  |
| **Timing-Safe Comparison** | `crypto.timingSafeEqual` for credential checks   |
| **Input Validation**| `express-validator` on all mutation endpoints            |
| **Production Hardening** | `console` and `debugger` statements dropped from client build via esbuild |

### RBAC Guards

| Middleware       | Cookie               | Role Check            | Protects              |
|------------------|----------------------|-----------------------|-----------------------|
| `requireAuth`    | `jr_token`           | Any authenticated user| Customer routes       |
| `requireOwner`   | `jr_token_owner`     | `role === 'owner'`    | Admin routes          |
| `requireAdmin`   | Either cookie        | `owner` or `admin`    | Reserved for future   |

---

## 8. Frontend Architecture

### Design System (CSS Custom Properties)

```css
/* Dark Theme (Default) */
--bg: #0c0c0c;          --bg-soft: #111111;      --bg-card: #141414;
--text: #ffffff;         --text-muted: rgba(255,255,255,0.45);
--border: rgba(255,255,255,0.08);
--accent: #FFD200;       --accent-dim: rgba(255,210,0,0.08);
--font-display: 'Bebas Neue';   --font-body: 'Syne';

/* Light Theme (data-theme="light") */
--bg: #f4f3ef;           --bg-soft: #eae9e4;      --bg-card: #ffffff;
--text: #0c0c0c;         --accent: #e6b800;
```

### Routing Architecture

| Path                    | Component          | Guard           | Layout            |
|-------------------------|--------------------|-----------------|-------------------|
| `/`                     | `Home`             | Public          | Navbar + Footer   |
| `/cars`                 | `Cars`             | Public          | Navbar + Footer   |
| `/car-details/:id`      | `CarDetails`       | Public          | Navbar + Footer   |
| `/support`              | `HelpSupport`      | Public          | Navbar + Footer   |
| `/login`                | `Login`            | `GuestRoute`    | No chrome         |
| `/verify-otp`           | `OTPVerification`  | Public          | No chrome         |
| `/account`              | `MyBookings`       | `CustomerRoute` | Navbar + Footer   |
| `/owner-login`          | `OwnerLogin`       | `GuestOwnerRoute` | No chrome       |
| `/owner`                | `Layout > Dashboard`   | `OwnerRoute` | Owner Layout   |
| `/owner/add-car`        | `Layout > AddCar`      | `OwnerRoute` | Owner Layout   |
| `/owner/manage-cars`    | `Layout > ManageCars`  | `OwnerRoute` | Owner Layout   |
| `/owner/manage-bookings`| `Layout > ManageBookings` | `OwnerRoute` | Owner Layout |
| `/owner/fleet-editor`   | `Layout > FleetEditor` | `OwnerRoute` | Owner Layout   |
| `/owner/profile`        | `Layout > OwnerProfile` | `OwnerRoute` | Owner Layout  |
| `*`                     | Redirect → `/`     | —               | —                 |

### Key Frontend Features

1. **Lazy Loading:** All page components use `React.lazy()` for code splitting
2. **Error Boundary:** Global `ErrorBoundary` class component catches and displays crashes gracefully
3. **Auto Token Refresh:** `api.js` intercepts 401 responses and automatically refreshes via `POST /auth/refresh` before retrying
4. **View Transitions API:** Theme toggle uses native `document.startViewTransition()` with circle-reveal animation
5. **Service Worker:** Registered at boot for VAPID Web Push notification delivery
6. **Intersection Observer:** Multiple sections use `IntersectionObserver` for scroll-triggered reveal animations
7. **Infinite Marquee:** Reviews section uses CSS animation for auto-scrolling testimonial cards
8. **Chunk Splitting:** Vite config manually splits `react`, `react-dom`, `react-router-dom`, and `swiper` into separate cached chunks
9. **Vercel Speed Insights:** Production performance monitoring via `@vercel/speed-insights`

---

## 9. External Service Integrations

### Razorpay (Payments)

- **SDK:** `razorpay@^2.9.5`
- **Flow:** Server-side order creation → Client-side Razorpay Checkout → Server-side HMAC-SHA256 signature verification
- **Booking Amount:** The `totalPrice` sent from the client is used as the pre-tax order amount. Razorpay processes in paise (×100).
- **Security:** Payment signature is verified using `RAZORPAY_KEY_SECRET` with `crypto.createHmac('sha256')`.

### Cloudinary (Media)

- **SDK:** `cloudinary@^2.5.1`
- **Usage 1:** KYC documents (Aadhar + License) — uploaded as base64 → Cloudinary via `upload.controller.js`
- **Usage 2:** Vehicle images — uploaded by owner via `owner.controller.js`
- **Usage 3:** Booking delivery photos — uploaded by owner
- **Usage 4:** User avatars — uploaded via `auth.controller.js`
- **Folder Structure:** `journey-rentals/bookings/YYYY-MM-DD/`, `journey-rentals/vehicles/`, `journey-rentals/documents/`, `journey-rentals/avatars/`

### Gmail SMTP (Email)

- **SDK:** `nodemailer@^6.10.0`
- **Transport:** Gmail SMTP (smtp.gmail.com:587, STARTTLS)
- **Templates:** Branded HTML email templates for:
  - OTP verification emails
  - Customer booking confirmation (with WhatsApp link)
  - Owner booking notification (detailed table format)
- **Fallback:** In development, skips sending with a structured log warning. In production, throws if not configured.

### Meta WhatsApp Cloud API

- **SDK:** `axios@^1.7.9` (direct HTTP)
- **API Version:** v19.0 Graph API
- **Usage:** Sends formatted booking notification to owner's WhatsApp number
- **Behavior:** Fire-and-forget — errors are caught and logged but never block the HTTP response

### Web Push (VAPID)

- **SDK:** `web-push@^3.6.7`
- **Usage:** Sends push notifications to owner's browser when new bookings are confirmed
- **Client:** Service Worker (`sw.js`) handles `push` events and displays notifications with `showNotification()`
- **Storage:** Push subscriptions stored in MongoDB `pushsubscriptions` collection

---

## 10. Configuration & Environment Variables

### API Environment (`.env`)

| Variable                   | Required | Default                  | Description                          |
|----------------------------|----------|--------------------------|--------------------------------------|
| `NODE_ENV`                 | Yes      | `development`            | Runtime environment                  |
| `PORT`                     | No       | `5000`                   | API server port                      |
| `FRONTEND_URL`             | Yes      | `http://localhost:5173`  | CORS origin + OAuth redirects        |
| `BACKEND_URL`              | Yes      | `http://localhost:5000`  | OAuth callback base URL              |
| `MONGODB_URI`              | **Yes**  | —                        | MongoDB connection string            |
| `JWT_SECRET`               | **Yes**  | —                        | Token signing key (min 32 chars)     |
| `CLOUDINARY_CLOUD_NAME`    | **Yes**  | —                        | Cloudinary cloud name                |
| `CLOUDINARY_API_KEY`       | **Yes**  | —                        | Cloudinary API key                   |
| `CLOUDINARY_API_SECRET`    | **Yes**  | —                        | Cloudinary API secret                |
| `RAZORPAY_KEY_ID`          | **Yes**  | —                        | Razorpay key ID                      |
| `RAZORPAY_KEY_SECRET`      | **Yes**  | —                        | Razorpay key secret                  |
| `GOOGLE_CLIENT_ID`         | No       | —                        | Google OAuth client ID               |
| `GOOGLE_CLIENT_SECRET`     | No       | —                        | Google OAuth client secret           |
| `OWNER_EMAIL`              | **Yes**  | —                        | Owner login email                    |
| `OWNER_PASSWORD`           | **Yes**  | —                        | Owner login password                 |
| `GMAIL_USER`               | No       | —                        | Gmail SMTP sender address            |
| `GMAIL_APP_PASSWORD`       | No       | —                        | Gmail app-specific password          |
| `OWNER_WHATSAPP`           | No       | —                        | Click-to-chat WhatsApp number        |
| `VAPID_PUBLIC_KEY`         | No       | —                        | Web Push VAPID public key            |
| `VAPID_PRIVATE_KEY`        | No       | —                        | Web Push VAPID private key           |
| `VAPID_EMAIL`              | No       | —                        | VAPID contact email                  |
| `WHATSAPP_TOKEN`           | No       | —                        | Meta WhatsApp API bearer token       |
| `WHATSAPP_PHONE_NUMBER_ID` | No       | —                        | Meta WhatsApp phone number ID        |
| `OWNER_WHATSAPP_NUMBER`    | No       | —                        | Owner WhatsApp number for alerts     |
| `OWNER_NAME`               | No       | `Owner` / `Admin`        | Display name in notifications        |

### Client Environment (`.env`)

| Variable               | Required | Default | Description                          |
|------------------------|----------|---------|--------------------------------------|
| `VITE_API_URL`         | Yes      | —       | API base URL                         |
| `VITE_VAPID_PUBLIC_KEY`| No       | —       | VAPID public key for push subscription |

---

## 11. Deployment & DevOps

### Frontend — Vercel

- **Configuration file:** `client/vercel.json`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Framework preset:** `vite`
- **SPA routing:** All paths rewrite to `/index.html`
- **Performance:** Vercel Speed Insights integrated

### Backend — Render

- **Configuration file:** `render.yaml`
- **Service type:** `web`
- **Runtime:** Node.js 20
- **Region:** Oregon (US)
- **Build command:** `cd api && npm install`
- **Start command:** `cd api && node src/server.js`
- **Auto-deploy:** Enabled on push to `main`
- **Plan:** Free tier
- **Environment:** `NODE_ENV=production`, `PORT=5000`

### Development Workflow

```bash
# Root — run both services concurrently
npm run dev          # Runs: concurrently "npm run dev --prefix api" "npm run dev --prefix client"

# API only
cd api && npm run dev       # node --watch src/server.js (Node 20 native watch)

# Client only
cd client && npm run dev    # vite dev server with HMR
```

### Build Optimizations

| Optimization                     | Implementation                          |
|-----------------------------------|-----------------------------------------|
| Code splitting                   | Manual chunks for `vendor`, `router`, `swiper` |
| Tree shaking                     | Vite/esbuild default                    |
| Console stripping                | `esbuild.drop: ['console', 'debugger']` |
| Asset minification               | esbuild (ES2020 target)                 |
| API proxy (dev)                  | Vite proxy `/api` → `localhost:5000`    |
| Response caching                 | `Cache-Control: public, s-maxage=300` on vehicle endpoints |

---

## 12. Testing

### Current State

The project has **minimal test coverage**. Only one test file exists:

**`api/tests/responses.test.js`** — Data Leak Prevention Test

- **Runner:** Vitest (`npx vitest`)
- **HTTP client:** Supertest
- **Coverage:** Verifies that `GET /api/vehicles` does not leak sensitive fields (`password`, `passwordHash`, `__v`, `token`, `refreshToken`) in API responses
- **Scope:** Single endpoint, single assertion

### Testing Gaps

| Area                          | Status  | Risk Level |
|-------------------------------|---------|-----------|
| Auth flows (signup/login/OTP) | ❌ None | **High**  |
| Booking creation + payment    | ❌ None | **High**  |
| Owner CRUD operations         | ❌ None | Medium    |
| File upload validation        | ❌ None | Medium    |
| Rate limiting behavior        | ❌ None | Low       |
| Frontend component tests      | ❌ None | Medium    |
| E2E user flows                | ❌ None | **High**  |

---

## 13. Known Issues & Technical Debt

### Architecture

| Issue                                      | Severity | Location                     |
|--------------------------------------------|----------|------------------------------|
| Refresh token invalidation is **in-memory** (Set) — not shared across instances | ⚠️ Medium | `api/src/middleware/auth.js:35` |
| Account lockout tracking is **in-memory** (Map) — resets on restart | ⚠️ Medium | `api/src/middleware/auth.js:44` |
| Invalidated token set cleared every 24h regardless of actual expiry | ⚠️ Low | `api/src/middleware/auth.js:38` |
| Owner credentials stored as env vars — no database-backed admin management | ℹ️ Info | `api/.env.example` |
| No request body size limit on base64 document uploads | ⚠️ Medium | `api/src/controllers/upload.controller.js` |

### Frontend

| Issue                                      | Severity | Location                     |
|--------------------------------------------|----------|------------------------------|
| All assets use `placehold.co` placeholder URLs | ℹ️ Info | `client/src/assets/assets.js` |
| `CarDetails.jsx` is very large (51.7 KB) — candidate for splitting | ℹ️ Info | `client/src/features/vehicles/` |
| Hero title uses `clamp(86px, 12vw, 60px)` — min > max, likely a bug | ⚠️ Low | `client/src/index.css:462` |
| No explicit `<title>` or `<meta>` per page — limited SEO | ⚠️ Low | All pages |

### Dependencies

| Issue                                      | Severity |
|--------------------------------------------|----------|
| Express v5 is pre-release — may have breaking changes | ℹ️ Info |
| `npm audit` may flag vulnerabilities in transitive dependencies | ⚠️ Medium |

### Code Quality

| Finding                                    | Status |
|--------------------------------------------|--------|
| No `TODO`, `FIXME`, or `HACK` comments in codebase | ✅ Clean |
| Consistent ES Module syntax throughout      | ✅ Good  |
| Structured JSON error logging ready for aggregation | ✅ Good |
| Graceful shutdown with `SIGTERM`/`SIGINT` handlers | ✅ Good |
| Auto-reconnect logic for MongoDB connection | ✅ Good |

---

## 14. Recommendations & Next Steps

### Priority 1 — Critical

| Item                              | Action                                              |
|-----------------------------------|------------------------------------------------------|
| **Test coverage**                 | Add integration tests for auth flows, booking lifecycle, and payment verification using Vitest + Supertest |
| **Redis for token invalidation**  | Replace in-memory `Set` and `Map` with Redis for multi-instance deployment compatibility |
| **Request body size limit**       | Add `express.json({ limit: '10mb' })` explicitly in `app.js` for document upload routes |

### Priority 2 — Important

| Item                              | Action                                              |
|-----------------------------------|------------------------------------------------------|
| **SEO meta tags**                 | Add `react-helmet-async` for per-page `<title>` and `<meta>` tags |
| **Error monitoring**              | Integrate Sentry (`@sentry/node`) as documented in `errorTracker.js` comments |
| **Component splitting**           | Refactor `CarDetails.jsx` (51KB) and `Cars.jsx` (26KB) into smaller sub-components |
| **Replace placeholder assets**    | Replace `placehold.co` URLs in `assets.js` with actual brand assets |
| **CSS clamp bug**                 | Fix `clamp(86px, 12vw, 60px)` in `.hero__title` — minimum should be less than maximum |

### Priority 3 — Nice to Have

| Item                              | Action                                              |
|-----------------------------------|------------------------------------------------------|
| **Admin user management**         | Move owner credentials from env vars to database with proper hashing |
| **Pagination for vehicles**       | Add cursor/offset pagination to `GET /api/vehicles` for larger fleets |
| **Image optimization**            | Implement Cloudinary transformations (auto format, quality, resize) for faster loading |
| **Accessibility audit**           | Add ARIA labels, keyboard navigation, and screen reader support |
| **PWA manifest**                  | Add `manifest.json` for installable progressive web app experience |

---

*End of Report*
