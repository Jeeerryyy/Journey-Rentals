/**
 * mailer.js — Gmail SMTP transporter via Nodemailer
 * Falls back to structured log in development if GMAIL_APP_PASSWORD is missing.
 */
import nodemailer from 'nodemailer'

const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD

let transporter = null

if (GMAIL_USER && GMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  })
}

/**
 * Send the OTP verification email.
 * @param {string} to - Recipient email
 * @param {string} otp - The raw 6-digit OTP (will be displayed in email)
 */
export async function sendOTPEmail(to, otp) {
  const subject = 'Your Journey Rentals verification code'

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #0c0c0c; color: #ffffff;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 28px; font-weight: 800; letter-spacing: 0.04em; margin: 0;">
          JOURNEY<span style="color: #ffd200;">RENTALS</span>
        </h1>
        <p style="font-size: 11px; color: rgba(255,255,255,0.5); letter-spacing: 0.15em; text-transform: uppercase; margin-top: 4px;">Email Verification</p>
      </div>
      
      <div style="background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08); padding: 32px; text-align: center; margin-bottom: 24px;">
        <p style="font-size: 14px; color: rgba(255,255,255,0.6); margin: 0 0 16px;">Your verification code is:</p>
        <div style="font-size: 42px; font-weight: 800; letter-spacing: 0.25em; color: #ffd200; margin: 0; font-family: 'Courier New', monospace;">
          ${otp}
        </div>
        <p style="font-size: 13px; color: rgba(255,255,255,0.4); margin: 16px 0 0;">
          This code expires in <strong style="color: rgba(255,255,255,0.7);">10 minutes</strong>. Do not share it with anyone.
        </p>
      </div>
      
      <p style="font-size: 12px; color: rgba(255,255,255,0.3); text-align: center; line-height: 1.6;">
        If you didn't create an account with Journey Rentals, you can safely ignore this email.
      </p>
    </div>
  `

  // If transporter is configured, send real email
  if (transporter) {
    await transporter.sendMail({
      from: `"Journey Rentals" <${GMAIL_USER}>`,
      to,
      subject,
      html,
    })
    return
  }

  // Fallback: acknowledge OTP was generated in dev without printing it
  if (process.env.NODE_ENV !== 'production') {
    console.error(JSON.stringify({ level: 'warn', message: 'OTP email skipped — transporter not configured', timestamp: new Date().toISOString() }))
    return
  }

  // In production without config, throw
  throw new Error('Email transporter not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD.')
}

/**
 * Send booking confirmation email to customer.
 */
export async function sendBookingConfirmationEmail(to, data) {
  const { customerName, vehicleName, startDate, endDate, totalAmount, bookingId, waLink } = data;
  const subject = 'Booking Confirmed — Journey Rentals 🎉';

  const html = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; background: #fafafa; padding: 20px;">
      <div style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.04); border: 1px solid #eaeaea;">
        
        <!-- Header -->
        <div style="background: #000000; padding: 32px 24px; text-align: center;">
          <img src="https://cdn.jsdelivr.net/gh/Jeeerryyy/Journey-Rentals@main/client/public/favicon.svg" alt="Journey Rentals" width="48" height="48" style="display: block; margin: 0 auto 16px auto;" />
          <h1 style="font-size: 24px; font-weight: 900; letter-spacing: 0.5px; margin: 0; color: #ffffff; white-space: nowrap;">
            JOURNEY<span style="color: #FFD200;">RENTALS</span>
          </h1>
          <p style="font-size: 11px; font-weight: 700; color: #FFD200; letter-spacing: 2px; text-transform: uppercase; margin: 8px 0 0 0;">
            Booking Confirmed
          </p>
        </div>
        
        <!-- Body Info -->
        <div style="padding: 40px 32px;">
          <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; color: #111111;">Hello, ${customerName}</h2>
          <p style="margin: 0 0 32px 0; font-size: 15px; line-height: 1.6; color: #555555;">
            Great news! Your reservation is fully confirmed. We have reserved the <strong>${vehicleName}</strong> for you. Below is a summary of your upcoming trip details.
          </p>
          
          <!-- Details Card -->
          <div style="background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
            <h3 style="margin: 0 0 20px 0; font-size: 12px; font-weight: 700; color: #9ca3af; letter-spacing: 1px; text-transform: uppercase;">
              Reservation Summary
            </h3>
            
            <table width="100%" cellPadding="0" cellSpacing="0" style="font-size: 15px;">
              <tr>
                <td style="padding-bottom: 16px; color: #6b7280; font-weight: 500; width: 40%;">Booking No.</td>
                <td style="padding-bottom: 16px; color: #111111; font-weight: 700; text-align: right;">${bookingId}</td>
              </tr>
              <tr>
                <td style="padding-bottom: 16px; color: #6b7280; font-weight: 500; border-top: 1px solid #f3f4f6; padding-top: 16px;">Vehicle</td>
                <td style="padding-bottom: 16px; color: #111111; font-weight: 600; text-align: right; border-top: 1px solid #f3f4f6; padding-top: 16px;">${vehicleName}</td>
              </tr>
              <tr>
                <td style="padding-bottom: 16px; color: #6b7280; font-weight: 500; border-top: 1px solid #f3f4f6; padding-top: 16px;">Pickup Date</td>
                <td style="padding-bottom: 16px; color: #111111; font-weight: 600; text-align: right; border-top: 1px solid #f3f4f6; padding-top: 16px;">${startDate}</td>
              </tr>
              <tr>
                <td style="padding-bottom: 16px; color: #6b7280; font-weight: 500; border-top: 1px solid #f3f4f6; padding-top: 16px;">Return Date</td>
                <td style="padding-bottom: 16px; color: #111111; font-weight: 600; text-align: right; border-top: 1px solid #f3f4f6; padding-top: 16px;">${endDate}</td>
              </tr>
              <tr>
                <td style="color: #6b7280; font-weight: 500; border-top: 1px solid #f3f4f6; padding-top: 16px;">Total Amount</td>
                <td style="color: #10b981; font-weight: 800; font-size: 16px; text-align: right; border-top: 1px solid #f3f4f6; padding-top: 16px;">₹ ${Number(totalAmount).toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>
          
          <!-- Direct Support / WA Action -->
          <div style="text-align: center; border-top: 1px solid #eaeaea; padding-top: 32px;">
            <p style="margin: 0 0 16px 0; font-size: 15px; color: #333333; font-weight: 600;">
              Need to coordinate pickup or have questions?
            </p>
            <a href="${waLink}" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 14px 28px; font-weight: 700; border-radius: 8px; font-size: 15px; box-shadow: 0 4px 6px rgba(37, 211, 102, 0.2);">
              Chat with Support on WhatsApp
            </a>
            <p style="margin: 16px 0 0 0; font-size: 13px; color: #888888;">
              Your booking details will be shared automatically to help us assist you faster.
            </p>
          </div>
        </div>
        
        <!-- Footer area inside card -->
        <div style="background: #fcfcfc; border-top: 1px solid #eaeaea; padding: 24px 32px; text-align: center;">
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #444444;">
            We look forward to serving you!
          </p>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #888888;">
            — Team Journey Rentals
          </p>
        </div>
        
      </div>
      
      <!-- Under Card -->
      <div style="text-align: center; padding-top: 24px;">
        <p style="margin: 0; font-size: 12px; color: #aaaaaa; line-height: 1.5;">
          This is an automated message generated from your confirmed booking.<br>
          Please do not reply directly to this email. Use the WhatsApp link above.
        </p>
      </div>
    </div>
  `;

  if (transporter) {
    await transporter.sendMail({
      from: `"Journey Rentals" <${GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(JSON.stringify({ level: 'warn', message: 'Booking confirmation email skipped — transporter not configured', timestamp: new Date().toISOString() }))
    return;
  }
}

/**
 * Send booking notification email to the platform owner.
 */
export async function sendOwnerBookingNotificationEmail(to, data) {
  const { customerName, vehicleName, startDate, endDate, totalAmount, bookingId, customerPhone, pickupLocation } = data;
  const ownerName = process.env.OWNER_NAME || 'Owner';
  const subject = 'New Booking Alert — Journey Rentals 🚀';

  const html = `
    <div style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #222222; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background: #000000; padding: 28px 24px; text-align: center;">
        <h1 style="font-size: 26px; font-weight: 800; letter-spacing: 0.05em; margin: 0; color: #ffffff;">
          JOURNEY<span style="color: #ffd200;">RENTALS</span>
        </h1>
        <p style="font-size: 13px; color: #ffd200; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 8px; margin-bottom: 0;">New Booking Confirmation</p>
      </div>
      
      <div style="padding: 36px 28px;">
        <p style="font-size: 16px; line-height: 1.5; margin-top: 0; margin-bottom: 24px;">Hi <strong>${ownerName}</strong>,</p>
        <p style="font-size: 16px; line-height: 1.5; margin-top: 0; margin-bottom: 28px;">You have received a new booking. Below are the verified details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 15px; border-radius: 6px; overflow: hidden; border-style: hidden; box-shadow: 0 0 0 1px #e0e0e0;">
          <tbody>
            <tr>
              <td style="padding: 14px 16px; border: 1px solid #e0e0e0; font-weight: 600; width: 35%; background: #f7f7f7; color: #555; text-align: left; vertical-align: top;">Booking ID</td>
              <td style="padding: 14px 16px; border: 1px solid #e0e0e0; background: #ffffff; text-align: left; vertical-align: top;">${bookingId}</td>
            </tr>
            <tr>
              <td style="padding: 14px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f7f7f7; color: #555; text-align: left; vertical-align: top;">Customer Name</td>
              <td style="padding: 14px 16px; border: 1px solid #e0e0e0; background: #ffffff; text-align: left; vertical-align: top;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding: 14px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f7f7f7; color: #555; text-align: left; vertical-align: top;">Customer Mobile</td>
              <td style="padding: 14px 16px; border: 1px solid #e0e0e0; background: #ffffff; text-align: left; vertical-align: top;">${customerPhone || 'NA'}</td>
            </tr>
            <tr>
              <td style="padding: 14px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f7f7f7; color: #555; text-align: left; vertical-align: top;">Product Booked</td>
              <td style="padding: 14px 16px; border: 1px solid #e0e0e0; background: #ffffff; text-align: left; vertical-align: top;">${vehicleName}</td>
            </tr>
            <tr>
              <td style="padding: 14px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f7f7f7; color: #555; text-align: left; vertical-align: top;">RC Number</td>
              <td style="padding: 14px 16px; border: 1px solid #e0e0e0; background: #ffffff; text-align: left; vertical-align: top;">NA</td>
            </tr>
            <tr>
              <td style="padding: 14px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f7f7f7; color: #555; text-align: left; vertical-align: top;">Booking Period</td>
              <td style="padding: 14px 16px; border: 1px solid #e0e0e0; background: #ffffff; text-align: left; vertical-align: top;">From <strong>${startDate}</strong><br>to <strong>${endDate}</strong></td>
            </tr>
            <tr>
              <td style="padding: 14px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f7f7f7; color: #555; text-align: left; vertical-align: top;">Pickup Location</td>
              <td style="padding: 14px 16px; border: 1px solid #e0e0e0; background: #ffffff; text-align: left; vertical-align: top;">${pickupLocation || 'NA'}</td>
            </tr>
            <tr>
              <td style="padding: 14px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f7f7f7; color: #555; text-align: left; vertical-align: top;">Rental Amount<br>to Collect</td>
              <td style="padding: 14px 16px; border: 1px solid #e0e0e0; background: #ffffff; text-align: left; font-weight: 600; vertical-align: top;">Rs. ${totalAmount}<br><em style="color: #666; font-size: 13px; font-weight: normal;">(to be collected at pickup)</em></td>
            </tr>
            <tr>
              <td style="padding: 14px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f7f7f7; color: #555; text-align: left; vertical-align: top;">KM Allowed</td>
              <td style="padding: 14px 16px; border: 1px solid #e0e0e0; background: #ffffff; text-align: left; vertical-align: top;">NA</td>
            </tr>
            <tr>
              <td style="padding: 14px 16px; border: 1px solid #e0e0e0; font-weight: 600; background: #f7f7f7; color: #555; text-align: left; vertical-align: top;">Accessories</td>
              <td style="padding: 14px 16px; border: 1px solid #e0e0e0; background: #ffffff; text-align: left; vertical-align: top;">NA</td>
            </tr>
          </tbody>
        </table>

        <p style="font-size: 16px; line-height: 1.5; margin-top: 0; margin-bottom: 24px;">Please ensure the vehicle is clean, fueled, and prepared on time.</p>
        
        <p style="font-size: 16px; margin-top: 0; margin-bottom: 4px; color: #444;">Regards,</p>
        <p style="font-size: 16px; font-weight: 700; margin-top: 0; margin-bottom: 0; color: #000;">Team JourneyRentals</p>
      </div>
    </div>
  `;

  if (transporter) {
    await transporter.sendMail({
      from: `"Journey Rentals System" <${GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(JSON.stringify({ level: 'warn', message: 'Owner notification email skipped — transporter not configured', timestamp: new Date().toISOString() }))
    return;
  }
}
