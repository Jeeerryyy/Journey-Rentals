# Deployment Guide — Journey Rentals

## Architecture

| Component | Platform | Purpose |
|-----------|----------|---------|
| Frontend | Vercel | React SPA (static build) |
| Backend | Render | Express 5 API server |
| Database | MongoDB Atlas | Document database |
| Images | Cloudinary | Vehicle photos, documents, avatars |
| Payments | Razorpay | Online payment processing |

---

## Required Environment Variables (Production)

Set these in your hosting platform's dashboard — never use a `.env` file in production.

### Backend (Render)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | No | Default: `5000` (Render assigns automatically) |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Min 32 chars. Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `FRONTEND_URL` | Yes | Full Vercel URL (e.g., `https://journeyrentals.vercel.app`) |
| `BACKEND_URL` | Yes | Full Render URL (e.g., `https://journey-rentals-api.onrender.com`) |
| `CLOUDINARY_CLOUD_NAME` | Yes | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Yes | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Yes | From Cloudinary dashboard |
| `RAZORPAY_KEY_ID` | Yes | Use `rzp_live_` key for production |
| `RAZORPAY_KEY_SECRET` | Yes | From Razorpay dashboard |
| `GOOGLE_CLIENT_ID` | No | For Google OAuth |
| `GOOGLE_CLIENT_SECRET` | No | For Google OAuth |
| `OWNER_EMAIL` | Yes | Owner dashboard login email |
| `OWNER_PASSWORD` | Yes | Owner dashboard login password (strong!) |
| `GMAIL_USER` | Yes | Gmail account for sending emails |
| `GMAIL_APP_PASSWORD` | Yes | Gmail App Password (16 chars) |
| `OWNER_WHATSAPP` | No | WhatsApp number for customer contact |
| `VAPID_PUBLIC_KEY` | No | For push notifications |
| `VAPID_PRIVATE_KEY` | No | For push notifications |
| `VAPID_EMAIL` | No | For push notifications |

### Frontend (Vercel)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Full Render backend URL |

---

## DNS Records for Email Deliverability

If using a custom domain for sending emails, add these DNS records:

### SPF Record
```
Type: TXT
Host: @
Value: v=spf1 include:_spf.google.com ~all
```

### DKIM Record
Set up via Google Workspace Admin → Apps → Gmail → Authenticate email.

### DMARC Record
```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@yourdomain.com; pct=100
```

---

## Database Migration

The app uses Mongoose with auto-creating collections. On fresh deployment:

1. Ensure the MongoDB Atlas cluster is accessible from Render's IP range (or allow all: `0.0.0.0/0`)
2. The database user must have `readWrite` permissions on the app database
3. Indexes are created automatically via Mongoose schema definitions
4. Seed data (vehicles) can be loaded via: `node api/_seed.js`

---

## Health Check

The backend exposes a health endpoint at:

```
GET /healthz
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 3600,
  "database": "connected",
  "timestamp": "2026-04-01T12:00:00.000Z"
}
```

Configure your monitoring service (UptimeRobot, Better Stack) to poll this endpoint every 60 seconds.

---

## Render Configuration

The `render.yaml` in the project root defines the backend service. Render auto-deploys from the `main` branch.

Build command: `cd api && npm install`
Start command: `cd api && node index.js`

---

## Vercel Configuration

The `vercel.json` in the project root handles the frontend:

Build command: `cd client && npm install && npm run build`
Output directory: `client/dist`

All routes are rewritten to `index.html` for SPA routing.

---

## Post-Deploy Checklist

- [ ] Verify `/healthz` returns `{"status": "healthy"}`
- [ ] Test signup → OTP email delivery → login flow
- [ ] Test Google OAuth redirect and callback
- [ ] Test Razorpay payment (use test keys first)
- [ ] Verify CORS only allows your frontend domain
- [ ] Check security headers at securityheaders.com
- [ ] Verify rate limiting is active (rapid-fire requests should get 429)
- [ ] Test owner dashboard login and booking management
