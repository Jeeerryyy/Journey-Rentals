/**
 * Journey Rentals — Instant WhatsApp Notification & Dispatch Engine
 * Direct deep-linked WhatsApp protocol (https://wa.me/<phone>?text=<encoded_text>)
 * Zero-cost, resilient data extractor and template synthesizer.
 */

export const DEFAULT_COMPANY_NAME = 'Journey Rentals';
export const DEFAULT_FULL_COMPANY_NAME = 'Journey Rentals Solapur';
export const DEFAULT_HELPLINE_NUMBER = '+91 96044 37794';
export const DEFAULT_HELPLINE_CLEAN = '919604437794';
export const DEFAULT_PICKUP_HUB = 'Solapur Railway Station (Platform 1 Exit Gate) / Hotgi Road Hub';
export const DEFAULT_SECURITY_DEPOSIT = 0;

/**
 * Intelligent Indian & International Phone Number Sanitizer
 * Strips all special characters, handles leading zeros, auto-prefixes 91 for 10-digit Indian numbers.
 */
export function sanitizeWhatsAppPhone(phone) {
  if (!phone) return '';
  let clean = String(phone).replace(/[^0-9]/g, '');
  if (!clean) return '';
  // If 11 digits starting with 0 (e.g., 09604437794 -> 9604437794)
  if (clean.length === 11 && clean.startsWith('0')) {
    clean = clean.substring(1);
  }
  // Standard 10-digit Indian mobile number
  if (clean.length === 10) {
    clean = `91${clean}`;
  }
  return clean;
}

/**
 * Validates if the phone number is a usable mobile number for WhatsApp dispatch.
 */
export function isValidWhatsAppPhone(phone) {
  if (!phone) return false;
  const clean = sanitizeWhatsAppPhone(phone);
  return clean.length >= 10 && clean.length <= 15;
}

/**
 * Formats a clean display phone string (e.g., +91 96044 37794)
 */
export function formatDisplayPhone(phone) {
  if (!phone) return 'No Phone Provided';
  const clean = sanitizeWhatsAppPhone(phone);
  if (!clean) return String(phone);
  if (clean.startsWith('91') && clean.length === 12) {
    const main = clean.substring(2);
    return `+91 ${main.substring(0, 5)} ${main.substring(5)}`;
  }
  return `+${clean}`;
}

/**
 * Safe date formatter
 */
export function formatDateSafe(d) {
  if (!d) return 'Scheduled Date';
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return String(d);
  }
}

/**
 * Safe time extractor
 */
export function extractTime(dtStr, defaultFallback = '09:00 AM') {
  if (!dtStr) return defaultFallback;
  try {
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return defaultFallback;
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return defaultFallback;
  }
}

/**
 * Detects the service vertical (car, bike, or temple tour)
 */
export function getBookingVertical(raw) {
  if (!raw) return 'fleet';
  const typeStr = (
    raw.vehicleType ||
    raw.category ||
    raw.type ||
    raw._vertical ||
    raw.serviceType ||
    raw.service_type ||
    ''
  ).toLowerCase();

  const titleCheck = (
    raw.vehicleSnapshot?.brand ||
    raw.vehicleSnapshot?.model ||
    raw.vehicleName ||
    raw.packageName ||
    raw.title ||
    ''
  ).toLowerCase();

  if (
    typeStr.includes('bike') ||
    typeStr.includes('scooter') ||
    typeStr.includes('activa') ||
    titleCheck.includes('activa') ||
    titleCheck.includes('jupiter') ||
    titleCheck.includes('classic 350') ||
    titleCheck.includes('royal enfield') ||
    titleCheck.includes('splendor')
  ) {
    return 'bike';
  }

  if (
    typeStr.includes('temple') ||
    typeStr.includes('tour') ||
    typeStr.includes('yatra') ||
    typeStr.includes('darshan') ||
    titleCheck.includes('akkalkot') ||
    titleCheck.includes('pandharpur') ||
    titleCheck.includes('tuljapur') ||
    titleCheck.includes('gangapur')
  ) {
    return 'tour';
  }

  return 'fleet';
}

/**
 * Normalizes any MongoDB / state booking object into a clean structured payload.
 */
export function extractBookingDetails(raw) {
  const vertical = getBookingVertical(raw);
  const isBike = vertical === 'bike';
  const isTour = vertical === 'tour';

  if (!raw) {
    return {
      vertical: 'fleet',
      customer_name: 'Valued Customer',
      customer_phone: '',
      raw_customer_phone: '',
      display_phone: 'No Phone Provided',
      customer_email: '',
      booking_id: '#JR-0000',
      raw_code: 'JR-0000',
      vehicle_name: 'Swift / Ertiga / Activa 6G',
      vehicle_number: 'MH 13 AB 1234',
      service_type: 'Self-Drive Car Rental',
      pax_count: '4-5 Pax',
      pickup_date: 'Today',
      pickup_time: '09:00 AM',
      dropoff_date: 'Return Date',
      dropoff_time: '08:00 PM',
      pickup_location: DEFAULT_PICKUP_HUB,
      total_amount: '0',
      advance_paid: '0',
      balance_amount: '0',
      security_deposit: '0',
      driver_details: 'Self-Drive (No Driver Required)',
      company_name: DEFAULT_COMPANY_NAME,
      helpline_number: DEFAULT_HELPLINE_NUMBER,
      status: 'Confirmed',
      is_bike: false,
      is_tour: false,
      clean_phone: '',
      is_phone_valid: false,
    };
  }

  // Resilient Reference / Booking ID
  const rawCode =
    raw.referenceId ||
    raw.bookingCode ||
    raw.booking_code ||
    raw.id ||
    raw._id ||
    `JR-${Math.floor(1000 + Math.random() * 9000)}`;

  const bookingIdFormatted = String(rawCode).startsWith('#') ? rawCode : `#${rawCode}`;

  // Resilient Customer Name
  const customerName =
    raw.userSnapshot?.name ||
    raw.customerInfo?.name ||
    raw.customerName ||
    raw.customer_name ||
    raw.fullName ||
    raw.name ||
    'Valued Customer';

  // Resilient Phone Extraction
  const rawCustomerPhone =
    raw.userSnapshot?.phone ||
    raw.customerInfo?.phone ||
    raw.customerPhone ||
    raw.customer_phone ||
    raw.phone ||
    raw.mobile ||
    raw.contactNumber ||
    raw.contact_number ||
    raw.userPhone ||
    raw.guestPhone ||
    raw.customerDetails?.phone ||
    raw.customerDetails?.customerPhone ||
    raw.user?.phone ||
    '';

  const cleanPhone = sanitizeWhatsAppPhone(rawCustomerPhone);
  const displayPhone = formatDisplayPhone(rawCustomerPhone);
  const isPhoneValid = isValidWhatsAppPhone(rawCustomerPhone);

  // Resilient Email Extraction
  const customerEmail =
    raw.userSnapshot?.email ||
    raw.customerInfo?.email ||
    raw.customerEmail ||
    raw.customer_email ||
    raw.email ||
    raw.user?.email ||
    '';

  // Resilient Vehicle Name & Reg Number
  let vehicleName = 'Self-Drive Vehicle';
  if (raw.vehicleSnapshot) {
    const brand = raw.vehicleSnapshot.brand || '';
    const model = raw.vehicleSnapshot.model || '';
    vehicleName = `${brand} ${model}`.trim() || raw.vehicleSnapshot.name || 'Self-Drive Car';
  } else if (raw.vehicleId?.name) {
    vehicleName = raw.vehicleId.name;
  } else if (raw.vehicleName) {
    vehicleName = raw.vehicleName;
  } else if (isBike) {
    vehicleName = 'Honda Activa 6G / Classic 350';
  } else if (isTour) {
    vehicleName = 'Ertiga / Swift Dzire Tour Cab';
  }

  const vehicleNumber =
    raw.vehicleSnapshot?.registrationNumber ||
    raw.vehicleSnapshot?.regNumber ||
    raw.vehicleId?.registrationNumber ||
    raw.vehicleId?.regNumber ||
    raw.vehicleNumber ||
    raw.regNumber ||
    raw.reg_number ||
    'MH 13 JR 2026';

  // Service Type
  let serviceType = isBike
    ? 'Hourly / Daily Scooter Rental'
    : isTour
    ? 'Solapur Temple Pilgrimage Tour'
    : 'Self-Drive Car Rental';

  if (raw.serviceType || raw.service_type) {
    serviceType = raw.serviceType || raw.service_type;
  }

  // Pax count / seats
  const paxCountNum =
    raw.vehicleSnapshot?.seats ||
    raw.seats ||
    raw.paxCount ||
    (isBike ? 2 : 5);
  const paxCount = `${paxCountNum} Pax`;

  // Dates & Times
  const pickupRaw =
    raw.pickupDate ||
    raw.pickupDatetime ||
    raw.pickup_datetime ||
    raw.travelDate ||
    raw.startDate;

  const dropoffRaw =
    raw.dropoffDate ||
    raw.dropoffDatetime ||
    raw.dropoff_datetime ||
    raw.returnDate ||
    raw.endDate;

  const pickupDateFormatted = pickupRaw ? formatDateSafe(pickupRaw) : 'Scheduled Date';
  const pickupTimeFormatted = raw.pickupTime || extractTime(pickupRaw, '09:00 AM');

  const dropoffDateFormatted = dropoffRaw ? formatDateSafe(dropoffRaw) : (pickupRaw ? formatDateSafe(pickupRaw) : 'Return Date');
  const dropoffTimeFormatted = raw.dropoffTime || extractTime(dropoffRaw, '08:00 PM');

  // Pickup Location
  const pickupLocation =
    raw.pickupLocation ||
    raw.pickup_location ||
    raw.location ||
    DEFAULT_PICKUP_HUB;

  // Financials
  const totalNum = Number(
    raw.pricing?.totalPrice ??
    raw.pricing?.totalAmount ??
    raw.totalAmount ??
    raw.total_amount ??
    raw.totalPrice ??
    raw.totalRentalAmount ??
    raw.total_rental_amount ??
    0
  );

  const advanceNum = Number(
    raw.pricing?.advancePaid ??
    raw.pricing?.advanceAmount ??
    raw.advanceAmount ??
    raw.depositAmount ??
    raw.depositPaid ??
    raw.deposit_paid ??
    raw.advancePaid ??
    raw.paidAmount ??
    500
  );

  const balanceNum = Math.max(0, totalNum - advanceNum);

  const securityDepositNum = Number(
    raw.pricing?.securityDeposit ??
    raw.securityDepositAmount ??
    raw.security_deposit_amount ??
    raw.securityDeposit ??
    raw.security_deposit ??
    raw.vehicleSnapshot?.securityDeposit ??
    DEFAULT_SECURITY_DEPOSIT
  );

  let driverDetails =
    raw.driverDetails ||
    raw.driver_details ||
    (raw.driverName
      ? `${raw.driverName} (${raw.driverPhone || 'Contact assigned on dispatch'})`
      : isTour
      ? 'Chauffeur / Tour Coordinator (+91 96044 37794)'
      : 'Self-Drive (Hub Handover Executive: +91 96044 37794)');

  const companyName = DEFAULT_COMPANY_NAME;

  return {
    vertical,
    customer_name: customerName,
    customer_phone: rawCustomerPhone,
    raw_customer_phone: rawCustomerPhone,
    display_phone: displayPhone,
    customer_email: customerEmail,
    booking_id: bookingIdFormatted,
    raw_code: String(rawCode),
    vehicle_name: vehicleName,
    vehicle_number: vehicleNumber,
    service_type: serviceType,
    pax_count: paxCount,
    pickup_date: pickupDateFormatted,
    pickup_time: pickupTimeFormatted,
    dropoff_date: dropoffDateFormatted,
    dropoff_time: dropoffTimeFormatted,
    pickup_location: pickupLocation,
    total_amount: totalNum.toLocaleString('en-IN'),
    advance_paid: advanceNum.toLocaleString('en-IN'),
    balance_amount: balanceNum.toLocaleString('en-IN'),
    security_deposit: securityDepositNum.toLocaleString('en-IN'),
    driver_details: driverDetails,
    company_name: companyName,
    helpline_number: DEFAULT_HELPLINE_NUMBER,
    status: raw.status || 'Confirmed',
    is_bike: isBike,
    is_tour: isTour,
    clean_phone: cleanPhone,
    is_phone_valid: isPhoneValid,
  };
}

/**
 * Replaces all placeholder tags with actual booking values.
 */
export function renderBookingTemplate(templateBody, bookingData) {
  const details = extractBookingDetails(bookingData);

  return templateBody
    .replace(/\{customer_name\}/g, details.customer_name)
    .replace(/\{booking_id\}/g, details.booking_id)
    .replace(/\{vehicle_name\}/g, details.vehicle_name)
    .replace(/\{vehicle_number\}/g, details.vehicle_number)
    .replace(/\{service_type\}/g, details.service_type)
    .replace(/\{pax_count\}/g, details.pax_count)
    .replace(/\{pickup_date\}/g, details.pickup_date)
    .replace(/\{pickup_time\}/g, details.pickup_time)
    .replace(/\{dropoff_date\}/g, details.dropoff_date)
    .replace(/\{dropoff_time\}/g, details.dropoff_time)
    .replace(/\{pickup_location\}/g, details.pickup_location)
    .replace(/\{total_amount\}/g, details.total_amount)
    .replace(/\{advance_paid\}/g, details.advance_paid)
    .replace(/\{balance_amount\}/g, details.balance_amount)
    .replace(/\{security_deposit\}/g, details.security_deposit)
    .replace(/\{driver_details\}/g, details.driver_details)
    .replace(/\{company_name\}/g, details.company_name)
    .replace(/\{helpline_number\}/g, details.helpline_number);
}

/**
 * 10 Specialized Production Templates for Journey Rentals Solapur
 */
export const JOURNEY_RENTALS_TEMPLATES = [
  {
    id: 'self_drive_confirmation',
    title: 'Self-Drive Car Confirmation',
    icon: '🚗',
    vertical: 'fleet',
    description: 'Vehicle model, pickup dates, fare breakdown, advance receipt & KYC documents',
    template:
      'Namaste {customer_name} 🙏\n\nThank you for choosing *{company_name}*! Your self-drive car reservation has been confirmed. 🚗✨\n\n📋 *Reservation Summary:*\n• *Booking Reference:* {booking_id}\n• *Car Model:* {vehicle_name}\n• *Pickup Date & Time:* {pickup_date} at {pickup_time}\n• *Drop-off Date & Time:* {dropoff_date} at {dropoff_time}\n• *Pickup Location:* {pickup_location}\n\n💳 *Payment Summary:*\n• *Total Fare:* ₹{total_amount}\n• *Advance Paid:* ₹{advance_paid}\n• *Balance at Pickup:* ₹{balance_amount}\n\n📄 *Documents Required at Handover:*\n1. Original Valid Driving License\n2. Aadhaar Card / ID Proof\n\nFor questions or early pickup requests, call us at {helpline_number}.\n\nHave a pleasant drive! 🌿\n*{company_name}*',
  },
  {
    id: 'station_pickup_dispatch',
    title: 'Station Platform 1 / Hub Handover',
    icon: '🔑',
    vertical: 'fleet',
    description: 'Vehicle sanitized notice, number plate, platform pickup map & balance due',
    template:
      'Namaste {customer_name} 🙏\n\nYour self-drive vehicle is sanitized, fueled, and ready for dispatch in Solapur! 🚙💨\n\n• *Car Model:* {vehicle_name}\n• *Vehicle Plate Number:* {vehicle_number}\n• *Handover Point:* {pickup_location}\n• *Pickup Schedule:* {pickup_time} ({pickup_date})\n• *Balance Payable at Handover:* ₹{balance_amount}\n\nKindly have your Original Driving License ready for instant digital verification.\n\n📍 Hub Location: Solapur Railway Station / Hotgi Road\n📞 Dispatch Executive: {helpline_number}\n\nDrive safe!\n*{company_name}*',
  },
  {
    id: 'hourly_bike_handover',
    title: 'Hourly Bike / Scooter Handover',
    icon: '🛵',
    vertical: 'bike',
    description: 'Scooter/bike slot, included helmets, fuel notes & balance due',
    template:
      'Namaste {customer_name} 🙏\n\nYour two-wheeler rental with *{company_name}* is ready for pickup! 🛵💨\n\n• *Booking ID:* {booking_id}\n• *Bike / Scooter:* {vehicle_name}\n• *Plate Number:* {vehicle_number}\n• *Rental Slot:* {pickup_date} ({pickup_time}) to {dropoff_time}\n• *Pickup Point:* {pickup_location}\n• *Balance Due:* ₹{balance_amount}\n\n🪖 *Included with your ride:*\n• 1 Sanitized ISI-approved Helmet\n• Valid Insurance & PUC\n\nCarry your Original Driving License for handover.\n\nHelpline: {helpline_number}\nRide safely!\n*{company_name}*',
  },
  {
    id: 'temple_tour_confirmation',
    title: 'Temple Pilgrimage Tour (Akkalkot/Pandharpur)',
    icon: '🛕',
    vertical: 'tour',
    description: 'Temple route itinerary, reporting time, toll/parking guidelines & contact',
    template:
      'Namaste {customer_name} 🙏\n\nYour devotional pilgrimage trip with *{company_name}* is confirmed! 🌸🛕\n\n• *Booking Reference:* {booking_id}\n• *Pilgrimage Route:* {service_type}\n• *Assigned Vehicle:* {vehicle_name} ({vehicle_number})\n• *Departure Date:* {pickup_date} at {pickup_time}\n• *Pickup Point:* {pickup_location}\n\n💳 *Payment Summary:*\n• *Total Tour Fare:* ₹{total_amount}\n• *Advance Paid:* ₹{advance_paid}\n• *Balance Amount:* ₹{balance_amount}\n\n🚩 *Important Darshan Reminders:*\n1. Keep Aadhaar cards for all family members handy.\n2. Temple entry passes / VIP darshan slots are booked independently at respective temple counters.\n\nHelpline & Dispatch: {helpline_number}\nशुभ यात्रा! 🌸\n*{company_name}*',
  },
  {
    id: 'kyc_document_request',
    title: 'KYC & License Upload Reminder',
    icon: '📄',
    vertical: 'fleet',
    description: 'Request Aadhaar & Driving License submission for zero-wait handover',
    template:
      'Namaste {customer_name} 🙏\n\nTo ensure a zero-wait, 2-minute vehicle handover for your booking *{booking_id}*, please share your KYC documents: 📄✨\n\n1. Front & Back photo of your *Driving License*\n2. Photo of your *Aadhaar Card*\n\nYou can reply directly to this WhatsApp chat with the photos.\n\n• *Vehicle:* {vehicle_name}\n• *Pickup Date:* {pickup_date} ({pickup_time})\n\nThank you for choosing *{company_name}*!\nHelpline: {helpline_number}',
  },
  {
    id: 'payment_balance_reminder',
    title: 'Rental Balance Settlement Reminder',
    icon: '💰',
    vertical: 'fleet',
    description: 'Friendly balance settlement reminder prior to vehicle pickup',
    template:
      'Namaste {customer_name} 🙏\n\nThis is a gentle reminder regarding your upcoming rental booking *{booking_id}* with *{company_name}*.\n\n• *Vehicle:* {vehicle_name}\n• *Pickup Date:* {pickup_date} ({pickup_time})\n• *Pending Balance Amount:* ₹{balance_amount}\n\nYou can pay the balance via UPI at handover or request a payment link.\n\nHelpline: {helpline_number}\nWarm regards,\n*{company_name}*',
  },
  {
    id: 'trip_extension_receipt',
    title: 'Trip Extension Confirmation',
    icon: '⏱️',
    vertical: 'fleet',
    description: 'On-road trip extension confirmation, revised return date & additional fare',
    template:
      'Namaste {customer_name} 🙏\n\nYour trip extension for booking *{booking_id}* has been approved! 🚗💨\n\n• *Vehicle:* {vehicle_name}\n• *New Drop-off Date:* {dropoff_date} at {dropoff_time}\n• *Revised Total Fare:* ₹{total_amount}\n• *Additional Balance to Settle:* ₹{balance_amount}\n\nPlease drive carefully and feel free to reach out if you need further assistance.\n\nHelpline: {helpline_number}\n*{company_name}*',
  },
  {
    id: 'driver_handover_allotment',
    title: 'Chauffeur / Driver Details Allotment',
    icon: '👨‍✈️',
    vertical: 'tour',
    description: 'Chauffeur name, contact number, cab plate & reporting time',
    template:
      'Namaste {customer_name} 🙏\n\nYour chauffeur details for booking *{booking_id}* have been assigned! 🚖\n\n• *Assigned Vehicle:* {vehicle_name} ({vehicle_number})\n• *Reporting Time:* {pickup_time} on {pickup_date}\n• *Pickup Point:* {pickup_location}\n\n👨✈️ *Chauffeur / Driver:*\n• {driver_details}\n\nOur driver will connect with you 30 minutes before the scheduled pickup.\n\nHelpline: {helpline_number}\n*{company_name}*',
  },
  {
    id: 'rental_completed_thanks',
    title: 'Trip Completed & Feedback / Review',
    icon: '🌟',
    vertical: 'fleet',
    description: 'Vehicle returned notice, deposit refund status & Google Review request',
    template:
      'Namaste {customer_name} 🙏\n\nThank you for choosing *{company_name}*! We hope you enjoyed your self-drive experience in Solapur with our {vehicle_name}. 🌟\n\n• *Booking Reference:* {booking_id}\n• *Vehicle Returned On:* {dropoff_date}\n• *Security Deposit Status:* Settled / Closed\n\nIf you had a 5-star experience, we would be grateful if you could leave us a quick Google review!\n\nWe look forward to serving you again soon.\n\nWarm regards,\n*{company_name}*',
  },
  {
    id: 'cancellation_refund_notice',
    title: 'Booking Cancellation & Refund Notice',
    icon: '❌',
    vertical: 'fleet',
    description: 'Cancellation acknowledgment, token refund status & support contact',
    template:
      'Namaste {customer_name} 🙏\n\nYour booking *{booking_id}* for {vehicle_name} has been cancelled as requested.\n\n• *Advance Paid:* ₹{advance_paid}\n• *Refund Status:* Processed back to original payment source (3-5 business days)\n\nIf you have any questions regarding your refund, please connect with us at {helpline_number}.\n\nWarm regards,\n*{company_name}*',
  },
];

/**
 * Returns available templates for a booking.
 */
export function getTemplatesForBooking(booking) {
  const vertical = getBookingVertical(booking);
  if (vertical === 'bike') {
    // Put hourly bike first
    return [
      ...JOURNEY_RENTALS_TEMPLATES.filter((t) => t.id === 'hourly_bike_handover'),
      ...JOURNEY_RENTALS_TEMPLATES.filter((t) => t.id !== 'hourly_bike_handover'),
    ];
  }
  if (vertical === 'tour') {
    return [
      ...JOURNEY_RENTALS_TEMPLATES.filter((t) => t.id === 'temple_tour_confirmation' || t.id === 'driver_handover_allotment'),
      ...JOURNEY_RENTALS_TEMPLATES.filter((t) => t.id !== 'temple_tour_confirmation' && t.id !== 'driver_handover_allotment'),
    ];
  }
  return JOURNEY_RENTALS_TEMPLATES;
}

/**
 * All insertable dynamic variable chips
 */
export const INSERTABLE_VARIABLES = [
  { tag: '{customer_name}', label: 'Customer Name' },
  { tag: '{booking_id}', label: 'Booking ID' },
  { tag: '{vehicle_name}', label: 'Vehicle Model' },
  { tag: '{vehicle_number}', label: 'Plate Number' },
  { tag: '{pickup_date}', label: 'Pickup Date' },
  { tag: '{pickup_time}', label: 'Pickup Time' },
  { tag: '{dropoff_date}', label: 'Drop Date' },
  { tag: '{dropoff_time}', label: 'Drop Time' },
  { tag: '{pickup_location}', label: 'Pickup Point' },
  { tag: '{total_amount}', label: 'Total Fare' },
  { tag: '{advance_paid}', label: 'Advance Paid' },
  { tag: '{balance_amount}', label: 'Balance Due' },
  { tag: '{helpline_number}', label: 'Helpline' },
  { tag: '{driver_details}', label: 'Driver Details' },
];

/**
 * Recommends the smartest template ID based on booking vertical & lifecycle status.
 */
export function getRecommendedTemplateId(booking) {
  const vertical = getBookingVertical(booking);
  const status = (booking?.status || '').toLowerCase();

  if (status.includes('cancel')) return 'cancellation_refund_notice';
  if (status.includes('complete') || status.includes('return')) return 'rental_completed_thanks';
  if (status.includes('handover') || status.includes('active') || status.includes('dispatch') || status.includes('pickup')) {
    if (vertical === 'bike') return 'hourly_bike_handover';
    if (vertical === 'tour') return 'driver_handover_allotment';
    return 'station_pickup_dispatch';
  }
  if (status.includes('pending') || status.includes('partial') || status.includes('unpaid')) {
    return 'payment_balance_reminder';
  }

  if (vertical === 'bike') return 'hourly_bike_handover';
  if (vertical === 'tour') return 'temple_tour_confirmation';
  return 'self_drive_confirmation';
}

/**
 * Helper for customer-side "Send Booking Receipt to WhatsApp Dispatch"
 */
export function createCustomerBookingDispatchUrl(booking) {
  const details = extractBookingDetails(booking);
  const text =
    `*NEW SELF-DRIVE BOOKING CONFIRMATION*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🔖 *Booking Reference:* ${details.booking_id}\n` +
    `👤 *Customer Name:* ${details.customer_name}\n` +
    `📞 *Contact Number:* ${details.display_phone}\n` +
    `🚗 *Vehicle:* ${details.vehicle_name}\n` +
    `📅 *Pickup:* ${details.pickup_date} at ${details.pickup_time}\n` +
    `🏁 *Drop-off:* ${details.dropoff_date} at ${details.dropoff_time}\n` +
    `📍 *Pickup Point:* ${details.pickup_location}\n` +
    `💳 *Advance Paid:* ₹${details.advance_paid}\n` +
    `💰 *Balance at Pickup:* ₹${details.balance_amount}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `_Hello Journey Rentals team, I have confirmed my booking online. Please coordinate my vehicle handover._`;

  return `https://wa.me/${DEFAULT_HELPLINE_CLEAN}?text=${encodeURIComponent(text)}`;
}

/**
 * Customer Inquiry WhatsApp link generator
 */
export function createWhatsAppInquiryUrl({
  customerName = '',
  customerPhone = '',
  vehicleTitle = 'Self Drive Car / Bike',
  travelDate = '',
  notes = '',
}) {
  const text =
    `*NEW RENTAL INQUIRY — SOLAPUR*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 *Name:* ${customerName || 'Customer'}\n` +
    `📞 *Phone:* ${customerPhone || 'Direct'}\n` +
    `🚗 *Vehicle / Service:* ${vehicleTitle}\n` +
    `📅 *Preferred Dates:* ${travelDate || 'Flexible'}\n` +
    `📝 *Requirements:* ${notes || 'Please share available cars and daily tariff quote.'}\n` +
    `━━━━━━━━━━━━━━━━━━━━`;

  return `https://wa.me/${DEFAULT_HELPLINE_CLEAN}?text=${encodeURIComponent(text)}`;
}
