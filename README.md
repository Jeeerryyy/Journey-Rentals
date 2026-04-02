<p align="center">
  <img src="favicon.svg" alt="Journey Rentals" width="80" height="80">
</p>

# 🚗 Journey Rentals

<p align="center">
  <img src="https://img.shields.io/badge/Stack-MERN-svg?style=for-the-badge&logo=mongodb&logoColor=white&color=47A248" alt="MERN Stack">
  <img src="https://img.shields.io/badge/Status-Live-svg?style=for-the-badge&logo=vercel&logoColor=white&color=000000" alt="Status">
  <img src="https://img.shields.io/badge/Location-Pune%2C%20India-svg?style=for-the-badge&logo=googlemaps&logoColor=white&color=EA4335" alt="Location">
</p>

<p align="center">
  <strong>A full-stack, decoupled vehicle rental platform architected for a real-world self-drive business.</strong>
</p>

---

## 💡 Developer's Note
*Journey Rentals* was engineered to solve a specific business problem: modernizing a brick-and-mortar local rental service. The goal was to replace manual ledgers and chaotic WhatsApp bookings with a scalable, automated web application. As the sole developer, I focused on building a secure, intuitive customer frontend while delivering a powerful internal tool for the business owner to manage their fleet and revenue efficiently.

---

## 🌟 The Application

The platform is split into two primary interfaces:

### 1. User-Facing Application (Client)
* **Dynamic Fleet Discovery:** Engineered a responsive UI for browsing cars and bikes, with real-time availability checking.
* **Complex Scheduling Logic:** Built custom date/time handling to support both multi-day car rentals and granular hourly slots (3hr, 6hr, 12hr) for bikes.
* **Secure KYC Portal:** Integrated a secure document upload system for Aadhar and Driving License verification during the checkout flow.
* **Frictionless Checkout:** Implemented a secure payment gateway integration for seamless, instant booking confirmations.

### 2. Admin Dashboard (Internal Tool)
* **Master Control Panel:** Developed a centralized hub for tracking active bookings, revenue metrics, and fleet health.
* **Dynamic Inventory Management:** Created full CRUD capabilities for vehicle listings, including custom pricing controls and a drag-and-drop interface for homepage ordering.
* **Digital Inspection Logs:** Built a feature to attach and store vehicle condition photos directly to pickup and drop-off records.
* **Event-Driven Notifications:** Integrated asynchronous webhooks to trigger automated alerts via WhatsApp, Email, and Web Push for critical business events.

---

## 💻 Technical Implementation

This project utilizes the **MERN** stack, chosen for its flexibility and ecosystem, allowing for rapid iteration and high performance.

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS |
| **Backend** | Node.js, Express |
| **Database** | MongoDB (NoSQL) |
| **Authentication** | JWT (httpOnly cookies), Google OAuth, Bcrypt Hashing |
| **External APIs** | Payment Gateway, Cloud Media Storage, Messaging Microservices |

---

## 🛡️ Architecture & Security Focus

* **Stateless Authentication:** Implemented robust session management using secure, `httpOnly` cookies to mitigate XSS attacks and ensure user data integrity.
* **Decoupled Architecture:** Separated the client and API layers to allow independent scaling, deployment, and future mobile app integration.
* **Data Privacy:** Ensured that sensitive user KYC documents and payment data are handled via encrypted, industry-standard protocols, never exposing PII in the client state.

---

## 📜 License

**Proprietary Software.** Copyright © 2026 Journey Rentals. All rights reserved.  
Unauthorized copying, modification, or distribution of this source code is strictly prohibited.

---

<p align="center">
  Engineered with ❤️ for the Self-Drive Industry
</p>