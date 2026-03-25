# Changelog

All notable changes to Journey Rentals are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.4.0] — 2026-03-25
3
### Security & Quality Audit
- Added mandatory 10-digit phone number field to booking Step 1 — stored in userSnapshot for owner contact
- Added server-side phone validation on `POST /api/bookings/create-order`
- Fixed email uniqueness check on `PUT /api/auth/profile` — prevents account email collisions
- Tightened production error handler — internal messages never exposed in `NODE_ENV=production`
- Removed hardcoded ngrok `allowedHosts` from `vite.config.js`
- Added `lean()` to all read-only Mongoose queries (vehicles, bookings, fleet section)
- Added explicit `email` index to User schema
- Added `manualChunks` in Vite build config — splits vendor/router/swiper into separate cacheable chunks
- Fixed `GET /api/vehicles/:id` to use `lean()` and exclude `__v` field
- Removed unused `loading` state variable from `Profile.jsx`
- Standardized all frontend `api.js` imports to use `.js` extension
- Fixed booking success screen "View My Bookings" link — was pointing to non-existent `/my-bookings` route (now `/account`)
- Fixed bike slot prices — were hardcoded constants, now read from `vehicle.bikeSlots` database data
- Cleaned up `POST /api/bookings/verify-payment` — removed stale TODO comment, returns 501 with clear message

---

## [1.3.0] — 2026-03-23

### Payment & Booking Flow
- Added Cash as a payment option alongside Razorpay advance flow
- Non-refundable advance payment warning added to checkout step
- Mandatory Terms & Conditions checkbox required before payment proceeds
- Advance payment capped at ₹500 or total booking price (whichever is lower)

### Owner Dashboard
- Added paginated booking management with status filter
- Added booking status update (pending → confirmed → completed → cancelled)

---

## [1.2.0] — 2026-03-19

### Google OAuth Integration
- Integrated Google Sign-In via `passport-google-oauth20`
- OAuth callback redirects to frontend with JWT + user payload in URL params
- `AuthContext` reads OAuth params on mount and stores session to localStorage
- Existing accounts can link their Google ID on next login
- Error URL params mapped to friendly messages on the login page

### Vehicle Features
- Added `features` array field to Vehicle schema
- Added "Features & Amenities" section to `AddCar.jsx` with chip-based tag input
- Features displayed on `CarDetails.jsx` with checkmark grid

---

## [1.1.0] — 2026-03-18

### Fleet Editor
- Added `FleetSection` Mongoose model for CMS-driven home page fleet display
- `GET /api/vehicles/fleet-section` public endpoint (visible vehicles only, sorted by order)
- `GET/PUT /api/owner/fleet-section` owner endpoints with auto-seeding of 6 default vehicles
- Owner Fleet Editor page with drag-and-drop ordering, visibility toggle, and inline editing

### Code Quality Pass
- Removed all AI-generated placeholder comments and patterns
- Consolidated `statusConfig` badge colors into `client/src/lib/utils.js`
- Extracted `toBase64()` file reader utility into `utils.js`
- Standardized all async functions with proper try/catch error handling

---

## [1.0.1] — 2026-03-17

### UI Polish
- Testimonials section — replaced static grid with continuous right-to-left CSS animation (no JS)
- Fixed card grid inconsistency — all vehicle cards now fixed at 460px height with 220px image
- Skeleton loading cards on fleet page match final card dimensions exactly
- Hover carousel controls (prev/next) added to vehicle cards in `Cars.jsx`
- Mobile filter sidebar toggle added for screens below 900px

---

## [1.0.0] — 2026-03-15

### Full Stack Audit
- Comprehensive audit of all routes, components, and DB models
- Removed all duplicate logic and dead imports across the codebase
- Standardized entire project to ES Modules — no `require()` anywhere
- Added Helmet security headers, CORS locked to `FRONTEND_URL` env var
- Added rate limiting — auth routes: 10 req/15min; global: 300 req/15min

---

## [0.9.0] — 2026-03-12

### Owner Dashboard
- Built owner-only portal at `/owner` with Layout + sidebar navigation
- Dashboard stats: total/pending/confirmed/completed/cancelled bookings, total vehicles, revenue
- `ManageBookings.jsx` — paginated booking list with status update controls
- `ManageCars.jsx` — vehicle list with availability toggle and delete
- `AddCar.jsx` — full add vehicle form with multi-image upload via Cloudinary base64 API
- Owner login at `/owner-login` — credentials validated against `OWNER_EMAIL`/`OWNER_PASSWORD` env vars
- All owner routes protected by `requireOwner` middleware (JWT role check)

---

## [0.8.0] — 2026-03-10

### Booking System
- `POST /api/bookings/create-order` — creates booking with `userSnapshot`, `vehicleSnapshot`, advance calculation
- `GET /api/bookings/mine` — returns all bookings for authenticated customer
- `PATCH /api/bookings/cancel` — customer-initiated cancellation (ownership verified)
- Booking model: referenceId (JR + 6 digits), financial fields (totalPrice, advancePaid, balanceDue), TTL index on `expiresAt`
- `MyBookings.jsx` — account page with Profile and Bookings tabs, cancel confirmation modal
- Booking success screen on `CarDetails.jsx` with reference ID display

---

## [0.7.0] — 2026-03-08

### Document Upload
- `POST /api/upload/document` — validates and uploads Aadhar + Driving License to Cloudinary
- Mime type validation regex and 5MB size limit on base64 strings before upload
- `CarDetails.jsx` Step 2 — file upload UI with drag/hover state, supports JPG/PNG/PDF
- `toBase64()` utility converts `File` objects to data URLs for the upload API

---

## [0.6.0] — 2026-03-05

### Booking Flow UI
- Multi-step booking card on `CarDetails.jsx`: Step 1 (dates/slots) → Step 2 (docs) → Step 3 (terms/pay) → Step 4 (confirmation)
- Car booking: date range picker with 1/2/3 day quick-select presets, calculates total price
- Bike booking: time slots (3hr/6hr/12hr) with per-vehicle pricing from `bikeSlots` DB field
- Pickup location selector — shows vehicle's available locations as clickable options
- Full Terms & Conditions text in scrollable box with mandatory checkbox
- Image gallery carousel with auto-rotate every 4s and manual prev/next controls

---

## [0.5.0] — 2026-03-02

### Fleet Catalogue
- `Cars.jsx` — full vehicle listing with search, category/fuel/transmission filters, sort by price
- Vehicle type tabs: All / Cars / Bikes
- Skeleton loading cards with shimmer animation
- Module-level vehicle cache — survives navigation, refreshes every 60s
- Hover-based prefetch of vehicle detail on `CarCard` component
- `CarCard.jsx` — multi-image carousel with prev/next buttons, price badge, availability badge

---

## [0.4.0] — 2026-02-28

### Vehicle API & Data Model
- `Vehicle` Mongoose schema: type (car/bike), brand, model, year, category, transmission, fuelType, sittingCapacity, images, features, locations, pricePerDay, bikeSlots
- `GET /api/vehicles` — supports `?type=car|bike` filter, returns lean documents, 5-minute cache headers
- `GET /api/vehicles/:id` — single vehicle lookup
- Compound index on `{ type, isAvailable }` for fast fleet queries
- `seed.js` — database seeder with sample cars and bikes

---

## [0.3.0] — 2026-02-24

### Image Upload (Cloudinary)
- `cloudinary.js` lib — configured from env vars, reused across all upload calls
- `uploadToCloudinary()` stream-based upload for multipart buffers
- `PUT /api/auth/profile/avatar` — multer in-memory storage, 5MB limit, image-only filter, uploads to `journey-rentals/avatars/`
- Profile page avatar upload with hover overlay and loading state
- `POST /api/owner/upload/images` — bulk base64 image upload for vehicle gallery (max 10 images, 5MB each)

---

## [0.2.0] — 2026-02-20

### Authentication System
- `User` Mongoose model — email (unique), passwordHash (bcrypt), role, provider, googleId, avatarUrl
- `POST /api/auth/signup` — registration with bcrypt hashing, phone format validation (optional at signup)
- `POST /api/auth/login` — email + password, JWT response with user payload
- `POST /api/auth/owner-login` — hardcoded owner credential check, returns owner JWT
- `signToken()` / `verifyToken()` / `requireAuth()` / `requireOwner()` in `lib/auth.js`
- `AuthContext.jsx` — unified customer + owner session management via localStorage JWT
- Login page with login/signup tab switcher, Google OAuth button
- `CustomerRoute`, `OwnerRoute`, `GuestRoute` guard components in `App.jsx`

---

## [0.1.0] — 2026-02-16

### Project Foundation
- Initialized React + Vite client with Tailwind CSS v4 via `@tailwindcss/vite` plugin
- Initialized Express 5 server with ES Modules (`"type": "module"`)
- MongoDB Atlas connection singleton (`lib/mongodb.js`) with global connection cache for serverless reuse
- Helmet security headers, gzip compression, express-rate-limit (global 300 req/15min)
- CORS locked to `FRONTEND_URL` environment variable
- Vite dev proxy — all `/api` requests forwarded to `http://127.0.0.1:5000`
- Lazy-loaded routes via `React.lazy()` + `Suspense` in `App.jsx`
- Home page structure: Hero, About, FleetSection, CTA, Reviews, Footer
- Dark-mode design system in `index.css` — CSS custom properties for colors, typography (Bebas Neue + Syne)
- `.env.example` template with all required keys and descriptions
