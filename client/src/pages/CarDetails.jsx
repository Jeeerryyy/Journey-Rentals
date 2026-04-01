import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api.js'
import { toBase64 } from '../lib/utils.js'
import { UsersIcon, FuelIcon, GearIcon, CheckIcon, UploadIcon, ClockIcon } from '../components/Icons'

const AlertTriangleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

// Bike hour slots — prices populated from vehicle.bikeSlots once loaded
const buildBikeSlots = (bikeSlots = {}) => [
  { id: '3hr',  label: '3 Hours',  hours: 3,  price: bikeSlots.price3hr  || 150 },
  { id: '6hr',  label: '6 Hours',  hours: 6,  price: bikeSlots.price6hr  || 200 },
  { id: '12hr', label: '12 Hours', hours: 12, price: bikeSlots.price12hr || 400 },
]

const CAR_DAY_PRESETS = [1, 2, 3]



const ADVANCE = 500

const CarDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { customer } = useAuth()
  const [vehicle, setVehicle]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [fetchError, setFetchError] = useState(null)

  // Car scheduling state
  const [pickupDate, setPickupDate]     = useState('')
  const [pickupTime, setPickupTime]     = useState('')
  const [returnDate, setReturnDate]     = useState('')
  const [returnTime, setReturnTime]     = useState('')
  const [selectedDays, setSelectedDays] = useState(null)
  const [totalDays, setTotalDays]       = useState(0)
  const [totalPrice, setTotalPrice]     = useState(0)

  // Bike scheduling state
  const [bikeDate, setBikeDate] = useState('')
  const [bikeSlot, setBikeSlot] = useState(null)
  const [bikePrice, setBikePrice] = useState(0)

  // Universal workflow state
  const [pickupLocation, setPickupLocation] = useState('')
  const [phone, setPhone]               = useState(customer?.phone || '')
  const [phoneError, setPhoneError]     = useState('')
  const [step, setStep]                 = useState(1)
  const [aadhar, setAadhar]             = useState(null)
  const [license, setLicense]           = useState(null)
  const [agreedTerms, setAgreedTerms]   = useState(false)
  const [payProcessing, setPayProcessing] = useState(false)
  const [payError, setPayError]         = useState(null)
  const [bookingRef, setBookingRef]     = useState(null)
  const [imgIdx, setImgIdx]             = useState(0)

  const today     = new Date().toISOString().split('T')[0]
  const isBike    = vehicle?.type === 'bike'
  const BIKE_SLOTS = buildBikeSlots(vehicle?.bikeSlots)
  const heroImages = vehicle?.images?.length > 0 ? vehicle.images : [vehicle?.image].filter(Boolean)

  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setImgIdx(i => (i + 1) % heroImages.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [heroImages.length])

  // Fetch remote vehicle data
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true)
        const data = await api.vehicles.getById(id)
        setVehicle(data.vehicle)
      } catch (err) {
        setFetchError(err.message)
        setVehicle(null)
      } finally {
        setLoading(false)
      }
      window.scrollTo(0, 0)
    }
    fetchVehicle()
  }, [id])

  // Car: sync days ↔ dates
  useEffect(() => {
    if (!vehicle || isBike) return
    if (pickupDate && returnDate) {
      const d = Math.max(0, Math.ceil((new Date(returnDate) - new Date(pickupDate)) / 86400000))
      setTotalDays(d)
      setTotalPrice(d * vehicle.pricePerDay)
    } else { setTotalDays(0); setTotalPrice(0) }
  }, [pickupDate, returnDate, vehicle, isBike])

  // Car: apply preset days
  const applyDayPreset = (days) => {
    setSelectedDays(days)
    const start = pickupDate || today
    setPickupDate(start)
    const end = new Date(start)
    end.setDate(end.getDate() + days)
    setReturnDate(end.toISOString().split('T')[0])
  }

  // Bike: slot select
  const selectBikeSlot = (slot) => {
    setBikeSlot(slot.id)
    setBikePrice(slot.price)
  }

  // Validate phone — must be a 10-digit mobile number
  const validatePhone = (val) => /^[6-9]\d{9}$/.test(val)

  // Step 1 valid? (includes phone validation)
  const step1Valid = isBike
    ? bikeDate && bikeSlot && validatePhone(phone) && (vehicle?.locations?.length > 0 ? pickupLocation : true)
    : pickupDate && pickupTime && returnDate && returnTime && totalDays > 0 && validatePhone(phone) && (vehicle?.locations?.length > 0 ? pickupLocation : true)

  const totalBookingPrice = isBike ? bikePrice : totalPrice

  // Handle transaction initiation — full Razorpay flow
  const handlePay = async () => {
    setPayProcessing(true)
    setPayError(null)

    try {
      // Step 1 — Convert documents to base64
      const [aadharB64, licenseB64] = await Promise.all([
        toBase64(aadhar),
        toBase64(license),
      ])

      // Step 2 — Upload documents to Cloudinary
      const uploadData = await api.upload.documents({
        aadhar:  aadharB64,
        license: licenseB64,
      })

      // Step 3 — Create booking + Razorpay order
      const orderData = await api.bookings.createOrder({
        customerInfo: {
          name:  customer?.name  || 'Customer',
          email: customer?.email || '',
          phone: phone.trim(),
        },
        vehicleId:      vehicle._id,
        bookingType:    isBike ? 'bike' : 'car',
        pickupLocation,
        pickupDate:     isBike ? bikeDate    : pickupDate,
        pickupTime:     isBike ? null        : pickupTime,
        returnDate:     isBike ? null        : returnDate,
        returnTime:     isBike ? null        : returnTime,
        totalDays:      isBike ? null        : totalDays,
        bikeDate:       isBike ? bikeDate    : null,
        bikeSlot:       isBike ? bikeSlot    : null,
        totalPrice:     totalBookingPrice,
        documents: {
          aadharUrl:  uploadData.files.aadhar.url,
          licenseUrl: uploadData.files.license.url,
        },
      })

      // Step 4 — Razorpay checkout (if configured)
      if (orderData.razorpay) {
        const { orderId, amount, currency, keyId } = orderData.razorpay

        // Load Razorpay script if not loaded
        if (!window.Razorpay) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = resolve
            script.onerror = () => reject(new Error('Failed to load payment gateway.'))
            document.body.appendChild(script)
          })
        }

        // Open Razorpay checkout modal
        const rzp = new window.Razorpay({
          key: keyId,
          amount,
          currency,
          name: 'Journey Rentals',
          description: `${vehicle.brand} ${vehicle.model} — Advance Payment`,
          order_id: orderId,
          prefill: {
            name:    customer?.name  || '',
            email:   customer?.email || '',
            contact: phone || '',
          },
          theme: { color: '#ffd200' },
          handler: async (response) => {
            // Step 5 — Verify payment on backend
            try {
              const verifyData = await api.bookings.verify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              })
              setBookingRef(verifyData.bookingDetails?.referenceId || orderData.bookingDetails?.referenceId)
              setStep(4)
            } catch (verifyErr) {
              setPayError(verifyErr.message || 'Payment verification failed. Please contact support.')
            }
            setPayProcessing(false)
          },
          modal: {
            ondismiss: () => {
              setPayError('Payment was cancelled. Your booking is still pending.')
              setPayProcessing(false)
            },
          },
        })
        rzp.open()
        return // Don't set payProcessing to false here — Razorpay modal handles it
      }

      // Fallback: No Razorpay configured — direct booking
      setBookingRef(orderData.bookingDetails?.referenceId || `JR${Date.now().toString().slice(-6)}`)
      setStep(4)
      setPayProcessing(false)

    } catch (err) {
      setPayError(err.message)
      setPayProcessing(false)
    }
  }


  const stepLabel = (n) => step > n ? '✓' : n

  // Show loading indicator early
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '48px', color: 'var(--accent)' }}>Loading...</div>
    </div>
  )

  // Handle empty or failed fetch
  if (!vehicle) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '60px', color: 'var(--text)', marginBottom: '12px' }}>
          {fetchError ? 'Error' : 'Not Found'}
        </div>
        {fetchError && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>{fetchError}</p>}
        <Link to="/cars" style={{ color: 'var(--accent)', fontSize: '14px', fontWeight: 700 }}>← Back to Fleet</Link>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        .cardetails-page { background: var(--bg); min-height: 100vh; padding-top: 80px; }
        .cardetails-hero { position: relative; height: clamp(260px, 40vw, 480px); overflow: hidden; background: #0c0c0c; }
        .hero-img-fade { width: 100%; height: 100%; object-fit: cover; opacity: 0.7; display: block; animation: imgFade 0.5s ease-in-out; }
        @keyframes imgFade { from { opacity: 0; transform: scale(1.02); } to { opacity: 0.7; transform: scale(1); } }
        .cardetails-hero__overlay { position: absolute; inset: 0; background: linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, transparent 100%); pointer-events: none; }
        .cardetails-hero__badge { position: absolute; top: 20px; left: 24px; background: var(--accent); color: #0c0c0c; font-family: var(--font-display); font-size: 13px; letter-spacing: 0.06em; padding: 4px 12px; z-index: 2; }
        .cardetails-hero__info { position: absolute; bottom: 28px; left: 28px; z-index: 2; }
        .cardetails-hero__name { font-family: var(--font-display); font-size: clamp(36px, 6vw, 72px); color: #fff; line-height: 0.9; letter-spacing: 0.02em; }
        .cardetails-hero__meta { font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 8px; font-weight: 600; letter-spacing: 0.06em; }
        
        .cardetails-hero__dots { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 2; }
        .hero-dot { width: 44px; height: 3px; background: rgba(255,255,255,0.2); cursor: pointer; transition: background 0.2s; }
        .hero-dot.active { background: var(--accent); }
        .hero-controls { position: absolute; top: 50%; width: 100%; display: flex; justify-content: space-between; padding: 0 20px; transform: translateY(-50%); z-index: 2; pointer-events: none; }
        .hero-btn { width: 40px; height: 40px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; pointer-events: auto; transition: all 0.2s; }
        .hero-btn:hover { background: var(--accent); color: #000; border-color: var(--accent); }

        .cardetails-layout { display: grid; grid-template-columns: 1fr 380px; gap: 32px; max-width: 1200px; margin: 0 auto; padding: 40px 48px; align-items: start; }
        @media (max-width: 900px) { .cardetails-layout { grid-template-columns: 1fr; padding: 20px; } .cardetails-layout > div { min-width: 0; } }

        .cardetails-specs-bar { display: flex; gap: 0; border: 1px solid var(--border); margin-bottom: 32px; }
        .cardetails-spec { flex: 1; display: flex; align-items: center; gap: 12px; padding: 16px; border-right: 1px solid var(--border); }
        .cardetails-spec:last-child { border-right: none; }
        .cardetails-spec svg { color: var(--accent); flex-shrink: 0; }
        .cardetails-spec-label { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); }
        .cardetails-spec-value { font-size: 13px; font-weight: 700; color: var(--text); margin-top: 2px; }
        @media (max-width: 600px) { .cardetails-specs-bar { flex-wrap: wrap; } .cardetails-spec { flex: 1 1 50%; border-bottom: 1px solid var(--border); } }

        .cardetails-section-title { font-family: var(--font-display); font-size: 28px; color: var(--text); margin-bottom: 14px; letter-spacing: 0.02em; }
        .cardetails-desc { font-size: 14px; color: var(--text-muted); line-height: 1.8; margin-bottom: 32px; }
        .cardetails-features { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; margin-bottom: 32px; }
        .cardetails-feature { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--bg-soft); border: 1px solid var(--border); font-size: 12px; font-weight: 600; color: var(--text-muted); }
        .cardetails-feature-check { width: 20px; height: 20px; background: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cardetails-feature-check svg { color: #0c0c0c; }

        .booking-card { background: var(--bg-card); border: 1px solid var(--border); padding: 24px; position: sticky; top: 100px; overflow: hidden; box-sizing: border-box; }
        .booking-steps { display: flex; align-items: center; margin-bottom: 20px; width: 100%; overflow: hidden; }
        .booking-step { display: flex; align-items: center; }
        .booking-step__num { width: 26px; height: 26px; border-radius: 50%; border: 1.5px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: var(--text-muted); flex-shrink: 0; transition: all 0.2s; }
        .booking-step.active .booking-step__num { background: var(--accent); border-color: var(--accent); color: #0c0c0c; }
        .booking-step.done .booking-step__num { background: #22c55e; border-color: #22c55e; color: #fff; font-size: 10px; }
        .booking-step__label { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); margin-left: 6px; white-space: nowrap; }
        .booking-step.active .booking-step__label { color: var(--text); }
        .booking-step__line { flex: 1; height: 1px; background: var(--border); margin: 0 8px; min-width: 12px; }
        .booking-step.done .booking-step__line { background: #22c55e; }

        .booking-card__divider { height: 1px; background: var(--border); margin: 0 -24px 20px; }
        .booking-card label { display: block; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 7px; }
        .booking-card input[type="date"] { width: 100%; padding: 12px 14px; background: var(--bg-soft); border: 1px solid var(--border); color: var(--text); font-family: var(--font-body); font-size: 16px; outline: none; margin-bottom: 16px; box-sizing: border-box; transition: border-color 0.2s; }
        .booking-card input[type="date"]:focus { border-color: rgba(255,210,0,0.4); }

        .day-presets { display: flex; gap: 8px; margin-bottom: 12px; }
        .day-preset { flex: 1; padding: 10px 6px; text-align: center; border: 1px solid var(--border); background: var(--bg-soft); cursor: pointer; transition: all 0.15s; }
        .day-preset__num { font-family: var(--font-display); font-size: 22px; color: var(--text); line-height: 1; }
        .day-preset__label { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); margin-top: 3px; }
        .day-preset:hover { border-color: rgba(255,210,0,0.3); }
        .day-preset.active { border-color: var(--accent); background: var(--accent-dim); }
        .day-preset.active .day-preset__num { color: var(--accent); }
        .day-preset.active .day-preset__label { color: var(--accent); }
        .day-preset__or { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .day-preset__or span { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); }
        .day-preset__or::before, .day-preset__or::after { content: ''; flex: 1; height: 1px; background: var(--border); }

        .bike-slots { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
        .bike-slot { display: flex; align-items: center; padding: 14px 16px; border: 1px solid var(--border); background: var(--bg-soft); cursor: pointer; transition: all 0.15s; gap: 14px; }
        .bike-slot:hover { border-color: rgba(255,210,0,0.3); }
        .bike-slot.active { border-color: var(--accent); background: var(--accent-dim); }
        .bike-slot__radio { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid var(--border); flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .bike-slot.active .bike-slot__radio { border-color: var(--accent); background: var(--accent); }
        .bike-slot.active .bike-slot__radio::after { content: ''; width: 7px; height: 7px; border-radius: 50%; background: #0c0c0c; }
        .bike-slot__info { flex: 1; }
        .bike-slot__time { font-size: 14px; font-weight: 800; color: var(--text); }
        .bike-slot.active .bike-slot__time { color: var(--accent); }
        .bike-slot__sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
        .bike-slot__price { font-family: var(--font-display); font-size: 24px; color: var(--text); letter-spacing: 0.02em; }
        .bike-slot.active .bike-slot__price { color: var(--accent); }

        .location-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .location-option { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border: 1px solid var(--border); background: var(--bg-soft); cursor: pointer; transition: all 0.15s; }
        .location-option:hover { border-color: rgba(255,210,0,0.3); }
        .location-option.selected { border-color: var(--accent); background: var(--accent-dim); }
        .location-option__dot { width: 16px; height: 16px; border-radius: 50%; border: 1px solid var(--border); flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .location-option.selected .location-option__dot { background: var(--accent); border-color: var(--accent); }
        .location-option.selected .location-option__dot::after { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #0c0c0c; display: block; }
        .location-option__text { font-size: 13px; font-weight: 600; color: var(--text); }
        .location-option__pin { margin-left: auto; font-size: 12px; }

        .booking-summary { background: var(--bg-soft); border: 1px solid var(--border); padding: 14px; margin-bottom: 16px; }
        .booking-summary-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-bottom: 8px; font-weight: 600; }
        .booking-summary-total { display: flex; justify-content: space-between; font-size: 15px; font-weight: 800; color: var(--accent); padding-top: 10px; border-top: 1px solid var(--border); margin-top: 4px; }

        .booking-cta { width: 100%; padding: 15px; background: var(--accent); color: #0c0c0c; font-family: var(--font-body); font-weight: 800; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; border: none; cursor: pointer; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px)); transition: background 0.2s; }
        .booking-cta:hover:not(:disabled) { background: #ffe44d; }
        .booking-cta:disabled { background: var(--border); color: var(--text-muted); cursor: not-allowed; clip-path: none; }

        .booking-back-btn { background: none; border: none; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); cursor: pointer; padding: 0; margin-top: 10px; display: flex; align-items: center; gap: 6px; transition: color 0.2s; }
        .booking-back-btn:hover { color: var(--text); }

        .upload-box { border: 1.5px dashed var(--border); background: var(--bg-soft); padding: 24px; text-align: center; cursor: pointer; transition: all 0.2s; margin-bottom: 16px; position: relative; overflow: hidden; }
        .upload-box:hover { border-color: rgba(255,210,0,0.4); background: var(--accent-dim); }
        .upload-box.uploaded { border-color: rgba(34,197,94,0.4); background: rgba(34,197,94,0.05); }
        .upload-box input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
        .upload-box__icon { color: var(--text-muted); margin-bottom: 8px; }
        .upload-box.uploaded .upload-box__icon { color: #22c55e; }
        .upload-box__text { font-size: 12px; font-weight: 700; color: var(--text-muted); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .upload-box.uploaded .upload-box__text { color: #22c55e; }

        .terms-box { background: var(--bg-soft); border: 1px solid var(--border); padding: 14px; font-size: 12px; color: var(--text-muted); line-height: 1.7; max-height: 200px; overflow-y: auto; margin-bottom: 16px; }
        .terms-check { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 20px; cursor: pointer; }
        .terms-check__box { width: 18px; height: 18px; border: 1px solid var(--border); background: var(--bg-soft); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; transition: all 0.15s; }
        .terms-check__box.checked { background: var(--accent); border-color: var(--accent); }
        .terms-check__box.checked svg { color: #0c0c0c; }
        .advance-box { background: var(--accent-dim); border: 1px solid rgba(255,210,0,0.25); padding: 14px; text-align: center; margin-bottom: 16px; }
        .advance-box__label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px; }
        .advance-box__amount { font-family: var(--font-display); font-size: 36px; color: var(--accent); letter-spacing: 0.02em; }
        .pay-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.2); border-top-color: #0c0c0c; border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 8px; vertical-align: middle; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pay-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); padding: 10px 12px; color: #ef4444; font-size: 12px; margin-bottom: 12px; }

        .booking-success { text-align: center; padding: 8px 0; }
        .booking-success__icon { width: 56px; height: 56px; border-radius: 50%; background: rgba(34,197,94,0.15); border: 1.5px solid rgba(34,197,94,0.3); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 22px; color: #22c55e; }
        .booking-success__title { font-family: var(--font-display); font-size: 32px; color: var(--text); margin-bottom: 6px; letter-spacing: 0.02em; }
        .booking-success__ref { font-size: 11px; font-weight: 700; letter-spacing: 0.15em; color: var(--accent); margin-bottom: 16px; }
        .booking-success__sub { font-size: 13px; color: var(--text-muted); line-height: 1.7; margin-bottom: 20px; }

        :root { --accent-dim: rgba(255,210,0,0.08); }
      `}</style>

      <div className="cardetails-page">

        {/* Hero image */}
        <div className="cardetails-hero">
          <img key={imgIdx} src={heroImages[imgIdx]} alt={`${vehicle.brand} ${vehicle.model}`} className="hero-img-fade" />
          
          {heroImages.length > 1 && (
            <>
              <div className="hero-controls">
                <button className="hero-btn" onClick={() => setImgIdx(i => (i - 1 + heroImages.length) % heroImages.length)}>‹</button>
                <button className="hero-btn" onClick={() => setImgIdx(i => (i + 1) % heroImages.length)}>›</button>
              </div>
              <div className="cardetails-hero__dots">
                {heroImages.map((_, i) => (
                  <div key={i} className={`hero-dot ${i === imgIdx ? 'active' : ''}`} onClick={() => setImgIdx(i)} />
                ))}
              </div>
            </>
          )}

          <div className="cardetails-hero__overlay" />
          <div className="cardetails-hero__badge">
            {vehicle.type === 'bike' ? '🏍 Bike' : '🚗 Car'} · {vehicle.category}
          </div>
          <div className="cardetails-hero__info">
            <div className="cardetails-hero__name">{vehicle.brand}<br />{vehicle.model}</div>
            <div className="cardetails-hero__meta">
              {vehicle.year} ·{' '}
              {vehicle.type === 'bike'
                ? `₹${BIKE_SLOTS[0].price} / 3hrs · ₹${BIKE_SLOTS[1].price} / 6hrs · ₹${BIKE_SLOTS[2].price} / 12hrs`
                : `₹${vehicle.pricePerDay?.toLocaleString()} / Day`}
            </div>
          </div>
        </div>

        <div className="cardetails-layout">

          {/* Left: specs + info */}
          <div>
            <div className="cardetails-specs-bar">
              {[
                { icon: <UsersIcon />, label: 'Capacity',     val: `${vehicle.sittingCapacity} Seats` },
                { icon: <FuelIcon />,  label: 'Fuel Type',    val: vehicle.fuelType },
                { icon: <GearIcon />,  label: 'Transmission', val: vehicle.transmission },
                { icon: <ClockIcon />, label: vehicle.type === 'bike' ? 'Min Rental' : 'Min Days', val: vehicle.type === 'bike' ? '3 Hours' : '1 Day' },
              ].map(({ icon, label, val }) => (
                <div className="cardetails-spec" key={label}>
                  {icon}
                  <div>
                    <div className="cardetails-spec-label">{label}</div>
                    <div className="cardetails-spec-value">{val}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cardetails-section-title">
              About this {vehicle.type === 'bike' ? 'bike' : 'car'}
            </div>
            <p className="cardetails-desc">{vehicle.description}</p>

            <div className="cardetails-section-title">Features & Amenities</div>
            <div className="cardetails-features">
              {vehicle.features?.map(f => (
                <div key={f} className="cardetails-feature">
                  <div className="cardetails-feature-check"><CheckIcon /></div>{f}
                </div>
              ))}
            </div>
          </div>

          {/* Right: booking card */}
          <div>
            {!customer ? (
              <div className="booking-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔒</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--text)', marginBottom: '8px', letterSpacing: '0.02em' }}>Login to Book</div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.6 }}>
                  You need an account to book this {vehicle.type}. It's free and takes 30 seconds.
                </p>
                <Link to="/login" state={{ from: `/car-details/${id}` }} className="booking-cta"
                  style={{ display: 'block', textDecoration: 'none', textAlign: 'center', padding: '15px', marginBottom: '10px' }}>
                  Login / Sign Up
                </Link>
              </div>
            ) : (
              <div className="booking-card">

                {/* Step indicator */}
                {step < 4 && (
                  <div className="booking-steps">
                    {[{ n: 1, label: isBike ? 'Slot' : 'Dates' }, { n: 2, label: 'Docs' }, { n: 3, label: 'Pay' }].map(({ n, label }, i) => (
                      <div key={n} className={`booking-step ${step === n ? 'active' : step > n ? 'done' : ''}`}
                        style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'initial' }}>
                        <div className="booking-step__num">{stepLabel(n)}</div>
                        <div className="booking-step__label" style={{ marginLeft: '6px' }}>{label}</div>
                        {i < 2 && <div className="booking-step__line" />}
                      </div>
                    ))}
                  </div>
                )}

                <div className="booking-card__divider" />

                {/* Date/Slot Selection Phase */}
                {step === 1 && (
                  <>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--text)', marginBottom: '18px', letterSpacing: '0.02em' }}>
                      {isBike ? 'Select Slot' : 'Select Days'}
                    </div>

                    {isBike && (
                      <>
                        <label>Booking Date</label>
                        <input type="date" min={today} value={bikeDate} onChange={e => setBikeDate(e.target.value)} />
                        <label>Choose Duration</label>
                        <div className="bike-slots">
                          {BIKE_SLOTS.map(slot => (
                            <div key={slot.id} className={`bike-slot ${bikeSlot === slot.id ? 'active' : ''}`}
                              onClick={() => selectBikeSlot(slot)}>
                              <div className="bike-slot__radio" />
                              <div className="bike-slot__info">
                                <div className="bike-slot__time">{slot.label}</div>
                                <div className="bike-slot__sub">Pickup to return window</div>
                              </div>
                              <div className="bike-slot__price">₹{slot.price}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {!isBike && (
                      <>
                        <label>Quick Select</label>
                        <div className="day-presets">
                          {CAR_DAY_PRESETS.map(d => (
                            <div key={d} className={`day-preset ${selectedDays === d ? 'active' : ''}`}
                              onClick={() => applyDayPreset(d)}>
                              <div className="day-preset__num">{d}</div>
                              <div className="day-preset__label">Day{d > 1 ? 's' : ''}</div>
                            </div>
                          ))}
                        </div>
                        <div className="day-preset__or"><span>or custom dates</span></div>
                        <label>Pickup Date</label>
                        <input type="date" min={today} value={pickupDate}
                          onChange={e => { setPickupDate(e.target.value); setSelectedDays(null); if (returnDate && e.target.value >= returnDate) setReturnDate('') }} />
                        <label>Pickup Time</label>
                        <input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)} style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '16px', outline: 'none', marginBottom: '16px', boxSizing: 'border-box' }} />
                        <label>Return Date</label>
                        <input type="date" min={pickupDate || today} value={returnDate}
                          onChange={e => { setReturnDate(e.target.value); setSelectedDays(null) }} />
                        <label>Return Time</label>
                        <input type="time" value={returnTime} onChange={e => setReturnTime(e.target.value)} style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '16px', outline: 'none', marginBottom: '16px', boxSizing: 'border-box' }} />
                      </>
                    )}

                    {vehicle.locations && vehicle.locations.length > 0 && (
                      <>
                        <label style={{ marginTop: '4px' }}>Pickup Location</label>
                        <div className="location-grid">
                          {vehicle.locations.map(loc => (
                            <div key={loc} className={`location-option ${pickupLocation === loc ? 'selected' : ''}`}
                              onClick={() => setPickupLocation(loc)}>
                              <div className="location-option__dot" />
                              <span className="location-option__text">{loc}</span>
                              <span className="location-option__pin">📍</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Phone number — collected for owner contact, not for verification */}
                    <label style={{ marginTop: '4px' }}>Contact Phone Number *</label>
                    <input
                      type="tel"
                      value={phone}
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      style={{
                        width: '100%', padding: '12px 14px',
                        background: 'var(--bg-soft)', border: `1px solid ${phoneError ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`,
                        color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '16px',
                        outline: 'none', marginBottom: '4px', boxSizing: 'border-box',
                      }}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '')
                        setPhone(val)
                        setPhoneError(val && !validatePhone(val) ? 'Enter a valid 10-digit mobile number starting with 6-9.' : '')
                      }}
                      onBlur={() => {
                        if (!phone || !validatePhone(phone)) {
                          setPhoneError('Enter a valid 10-digit mobile number starting with 6-9.')
                        } else {
                          setPhoneError('')
                        }
                      }}
                    />
                    {phoneError && <p style={{ fontSize: '11px', color: '#ef4444', margin: '0 0 8px' }}>{phoneError}</p>}
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                      📞 This number will be used to contact you regarding your booking.
                    </p>

                    {(isBike ? bikeSlot : totalDays > 0) && (
                      <div className="booking-summary">
                        {isBike ? (
                          <>
                            <div className="booking-summary-row"><span>Duration</span><span>{BIKE_SLOTS.find(s => s.id === bikeSlot)?.label}</span></div>
                            {bikeDate && <div className="booking-summary-row"><span>Date</span><span>{bikeDate}</span></div>}
                            {pickupLocation && <div className="booking-summary-row"><span>Pickup at</span><span>📍 {pickupLocation}</span></div>}
                            <div className="booking-summary-total"><span>Total</span><span>₹{bikePrice}</span></div>
                          </>
                        ) : (
                          <>
                            <div className="booking-summary-row"><span>Rate</span><span>₹{vehicle.pricePerDay?.toLocaleString()} / day</span></div>
                            <div className="booking-summary-row"><span>Duration</span><span>{totalDays} day{totalDays > 1 ? 's' : ''}</span></div>
                            {pickupTime && <div className="booking-summary-row"><span>Time</span><span>{pickupTime}</span></div>}
                            {pickupLocation && <div className="booking-summary-row"><span>Pickup at</span><span>📍 {pickupLocation}</span></div>}
                            <div className="booking-summary-total"><span>Total</span><span>₹{totalPrice.toLocaleString()}</span></div>
                          </>
                        )}
                      </div>
                    )}

                    <button className="booking-cta" disabled={!vehicle.isAvailable || !step1Valid} onClick={() => setStep(2)}>
                      Continue → Upload Documents
                    </button>
                    {!vehicle.isAvailable && <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '8px', textAlign: 'center' }}>This vehicle is currently unavailable</p>}
                  </>
                )}

                {/* Document Collection Phase */}
                {step === 2 && (
                  <>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--text)', marginBottom: '6px', letterSpacing: '0.02em' }}>Upload Documents</div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
                      Your documents are required for verification. Accepted: JPG, PNG, PDF (max 5MB each).
                    </p>

                    <label>Aadhar Card</label>
                    <div className={`upload-box ${aadhar ? 'uploaded' : ''}`}>
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setAadhar(e.target.files[0])} />
                      <div className="upload-box__icon">
                        {aadhar ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg> : <UploadIcon />}
                      </div>
                      <div className="upload-box__text">{aadhar ? aadhar.name : 'Click to upload Aadhar Card'}</div>
                    </div>

                    <label>Driving License</label>
                    <div className={`upload-box ${license ? 'uploaded' : ''}`}>
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setLicense(e.target.files[0])} />
                      <div className="upload-box__icon">
                        {license ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg> : <UploadIcon />}
                      </div>
                      <div className="upload-box__text">{license ? license.name : 'Click to upload Driving License'}</div>
                    </div>

                    <button className="booking-cta" disabled={!aadhar || !license} onClick={() => setStep(3)}>
                      Continue → Review & Pay
                    </button>
                    <button className="booking-back-btn" onClick={() => setStep(1)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
                      Back
                    </button>
                  </>
                )}

                {/* Checkout & Terms Phase */}
                {step === 3 && (
                  <>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--text)', marginBottom: '16px', letterSpacing: '0.02em' }}>
                      Terms & Payment
                    </div>

                    <div className="booking-summary" style={{ marginBottom: '16px' }}>
                      <div className="booking-summary-row"><span>{vehicle.brand} {vehicle.model}</span><span>{isBike ? BIKE_SLOTS.find(s => s.id === bikeSlot)?.label : `${totalDays} day${totalDays > 1 ? 's' : ''}`}</span></div>
                      {isBike
                        ? <div className="booking-summary-row"><span>Date</span><span style={{ color: 'var(--text)' }}>{bikeDate}</span></div>
                        : <>
                            <div className="booking-summary-row"><span>Pickup</span><span style={{ color: 'var(--text)' }}>{pickupDate} {pickupTime ? `at ${pickupTime}` : ''}</span></div>
                            <div className="booking-summary-row"><span>Return</span><span style={{ color: 'var(--text)' }}>{returnDate}</span></div>
                          </>
                      }
                      {pickupLocation && <div className="booking-summary-row"><span>Location</span><span style={{ color: 'var(--text)' }}>📍 {pickupLocation}</span></div>}
                      <div className="booking-summary-row"><span>Total Rental</span><span>₹{totalBookingPrice.toLocaleString()}</span></div>
                      {totalBookingPrice > ADVANCE && <div className="booking-summary-row"><span>Balance at pickup</span><span>₹{(totalBookingPrice - ADVANCE).toLocaleString()}</span></div>}
                      <div className="booking-summary-total"><span>Advance Now</span><span style={{ color: 'var(--accent)' }}>₹{Math.min(ADVANCE, totalBookingPrice)}</span></div>
                    </div>

                    <label style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--text)', marginBottom: '12px', display: 'block', letterSpacing: '0.02em' }}>Terms & Conditions</label>
                    <div style={{
                      maxHeight: '260px',
                      overflowY: 'auto',
                      background: 'var(--bg-soft)',
                      border: '1px solid var(--border)',
                      padding: '20px',
                      marginBottom: '16px',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      lineHeight: 1.8,
                    }}>
                      <div style={{ marginBottom: '16px' }}>
                        <strong style={{ color: 'var(--text)' }}>1. ADVANCE PAYMENT</strong><br />
                        A non-refundable advance is required to confirm your booking. This amount will be adjusted against your total rental charge at the time of vehicle pickup.
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <strong style={{ color: 'var(--text)' }}>2. NON-REFUNDABLE POLICY</strong><br />
                        The advance payment is strictly non-refundable under any circumstances, including cancellation by the customer, change of plans, or no-show.
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <strong style={{ color: 'var(--text)' }}>3. CANCELLATION</strong><br />
                        Cancellations must be made at least 24 hours before the scheduled pickup time. Late cancellations will forfeit the advance with no credit or rescheduling offered.
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <strong style={{ color: 'var(--text)' }}>4. VEHICLE PICKUP</strong><br />
                        The customer must present a valid government-issued photo ID and a valid driving licence at the time of pickup. Failure to produce these documents will result in cancellation of the booking with no refund of the advance.
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <strong style={{ color: 'var(--text)' }}>5. FUEL POLICY</strong><br />
                        All vehicles are provided with a full tank and must be returned with a full tank. Any fuel shortfall will be charged at actuals plus a service fee.
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <strong style={{ color: 'var(--text)' }}>6. DAMAGE POLICY</strong><br />
                        The customer is fully responsible for any damage to the vehicle during the rental period, including accidental, intentional, or negligence-related damage. Repair costs will be recovered from the customer.
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <strong style={{ color: 'var(--text)' }}>7. TRAFFIC VIOLATIONS</strong><br />
                        Any traffic fines, challans, or legal violations incurred during the rental period are the sole responsibility of the customer.
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <strong style={{ color: 'var(--text)' }}>8. RETURN TIME</strong><br />
                        The vehicle must be returned by the agreed drop-off time. Late returns will be charged at the hourly rate applicable to the vehicle category.
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <strong style={{ color: 'var(--text)' }}>9. PROHIBITED USE</strong><br />
                        The rented vehicle must not be used for illegal activities, sub-renting, racing, off-roading (unless explicitly permitted), or travel outside the permitted area agreed at the time of booking.
                      </div>
                      <div>
                        <strong style={{ color: 'var(--text)' }}>10. CONTACT & SUPPORT</strong><br />
                        For any assistance during the rental period, contact Journey Rentals directly on the number provided at the time of booking confirmation.
                      </div>
                    </div>

                    <div 
                      onClick={() => setAgreedTerms(v => !v)} 
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '20px', cursor: 'pointer' }}
                    >
                      <div style={{
                        width: '20px', height: '20px', border: '1px solid var(--border)',
                        background: agreedTerms ? 'var(--accent)' : 'var(--bg-soft)',
                        borderColor: agreedTerms ? 'var(--accent)' : 'var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: '1px', transition: 'all 0.15s',
                      }}>
                        {agreedTerms && <CheckIcon />}
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        I have read and agree to the Terms & Conditions and understand that the advance payment is non-refundable.
                      </span>
                    </div>

                    <div className="advance-box">
                      <div className="advance-box__label">Advance Payment</div>
                      <div className="advance-box__amount">₹{Math.min(ADVANCE, totalBookingPrice)}</div>
                    </div>

                    {/* Payment error */}
                    {payError && <div className="pay-error">❌ {payError}</div>}

                    <button className="booking-cta" disabled={!agreedTerms || payProcessing} onClick={handlePay}>
                      {payProcessing ? <><span className="pay-spinner" />Processing...</> : `Pay ₹${Math.min(ADVANCE, totalBookingPrice)} Advance`}
                    </button>
                    <button className="booking-back-btn" onClick={() => setStep(2)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
                      Back
                    </button>
                  </>
                )}

                {/* Confirmation Phase */}
                {step === 4 && (
                  <div className="booking-success">
                    <div className="booking-success__icon">✓</div>
                    <div className="booking-success__title">Booking Confirmed!</div>
                    <div className="booking-success__ref">REF# {bookingRef}</div>
                    <p className="booking-success__sub">
                      Your <strong style={{ color: 'var(--text)' }}>{vehicle.brand} {vehicle.model}</strong> is booked for{' '}
                      {isBike
                        ? <><strong style={{ color: 'var(--text)' }}>{BIKE_SLOTS.find(s => s.id === bikeSlot)?.label}</strong> on <strong style={{ color: 'var(--text)' }}>{bikeDate}</strong>.</>
                        : <>pickup on <strong style={{ color: 'var(--text)' }}>{pickupDate} {pickupTime ? `at ${pickupTime}` : ''}</strong>, return on <strong style={{ color: 'var(--text)' }}>{returnDate}</strong>.</>
                      }
                      {pickupLocation && <><br />Pickup at <strong style={{ color: 'var(--text)' }}>📍 {pickupLocation}</strong>.</>}
                      <br />Advance of <strong style={{ color: 'var(--accent)' }}>₹{Math.min(ADVANCE, totalBookingPrice)}</strong> paid successfully.
                    </p>
                    <div className="booking-card__divider" />
                    <Link to="/account" className="btn btn--yellow" style={{ width: '100%', justifyContent: 'center', fontSize: '12px', display: 'block', textAlign: 'center', textDecoration: 'none', padding: '14px' }}>
                      View My Bookings
                    </Link>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}

export default CarDetails