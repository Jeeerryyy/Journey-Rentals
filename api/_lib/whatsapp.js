import axios from 'axios'

/**
 * Send a WhatsApp message specifically to the owner when a booking is confirmed.
 * Uses Meta Graph API v19.0.
 *
 * @param {Object} data Booking data
 */
export async function sendOwnerWhatsAppNotification(data) {
  const { customerName, customerPhone, vehicleName, startDate, endDate, totalAmount, bookingId, pickupLocation } = data

  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
  const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
  const OWNER_WHATSAPP_NUMBER = process.env.OWNER_WHATSAPP_NUMBER
  
  // Default owner name or business name from environment if available
  const ownerName = process.env.OWNER_NAME || 'Admin'

  // If WhatsApp API credentials are not set, elegantly log and return
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !OWNER_WHATSAPP_NUMBER) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🚧 [DEV] WhatsApp notification skipped (Missing credentials)')
    }
    return
  }

  // Exact markdown format exactly as requested by user
  const messageText = `🔔 *New Booking Confirmed – JourneyRentals*

Hi ${ownerName},
You have received a new booking. Below are the booking details:

🆔 *Booking ID:* ${bookingId}
👤 *Customer Name:* ${customerName}
📞 *Customer Mobile:* ${customerPhone || 'NA'}
🚗 *Product Booked:* ${vehicleName}
📄 *RC Number:* NA
📅 *Booking Period:* From ${startDate} to ${endDate}
📍 *Pickup Location:* ${pickupLocation || 'NA'}
💰 *Rental Amount to Collect:* Rs. ${totalAmount} _(to be collected at pickup)_
🛣️ *KM Allowed:* NA
🎒 *Accessories:* NA

Please ensure the vehicle is prepared on time.

Regards,
Team *JourneyRentals*`

  try {
    const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`
    
    await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: OWNER_WHATSAPP_NUMBER,
        type: "text",
        text: {
          body: messageText
        }
      },
      {
        headers: {
          "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    )
    
  } catch (err) {
    // Catch errors gracefully, logging exactly what failed from Meta
    const errorMessage = err.response?.data?.error?.message || err.message
    console.error(`🚨 WhatsApp API Error: ${errorMessage}`)
    // Do not throw so it doesn't block the HTTP request 
  }
}
