import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { api } from '../../lib/api.js'
import { statusConfig } from '../../lib/utils.js'
import { CalIcon, CarIcon } from '../../components/Icons'
import Profile from '../profile/Profile'

const MyBookings = () => {
  const [filter, setFilter]   = useState('profile')
  const [cancelId, setCancelId] = useState(null)
  const [extendingId, setExtendingId] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const filters = ['profile', 'bookings']

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await api.bookings.mine()
        setBookings(data.bookings)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [])

  const filtered = filter === 'profile' ? [] : bookings

  const getDays = (pickup, ret) => {
    if (!pickup || !ret) return 0
    const p = new Date(pickup), r = new Date(ret)
    return Math.ceil((r - p) / (1000 * 60 * 60 * 24))
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toISOString().split('T')[0]
  }

  const handleCancel = async (id) => {
    try {
      await api.bookings.cancel(id)
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b))
      setCancelId(null)
    } catch (err) {
      alert('Cancel failed: ' + err.message)
    }
  }

  const handleExtensionRequest = async (id) => {
    try {
      await api.bookings.requestExtension(id)
      setBookings(prev => prev.map(b => b._id === id ? { ...b, extensionRequested: true, extensionStatus: 'pending' } : b))
      alert('Extension requested successfully. We will review and contact you shortly.')
      setExtendingId(null)
    } catch (err) {
      alert('Extension request failed: ' + err.message)
    }
  }

  return (
    <>
      <Helmet>
        <title>My Account & Bookings | Journey Rentals</title>
        <meta name="description" content="View your Journey Rentals profile and booking history. Manage active reservations and track your rides." />
      </Helmet>
      <style>{`
        .mybookings-page {
          background: var(--bg);
          min-height: 100vh;
          padding-top: 88px;
          padding-bottom: 80px;
        }
        .mybookings-header {
          background: var(--bg-soft);
          border-bottom: 1px solid var(--border);
          padding: 40px 0 32px;
          margin-bottom: 40px;
        }
        .mybookings-header__eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--accent); margin-bottom: 10px;
        }
        .mybookings-header__eyebrow::before {
          content: ''; display: block;
          width: 28px; height: 1px; background: var(--accent);
        }
        .mybookings-header__title {
          font-family: var(--font-display);
          font-size: clamp(40px, 6vw, 72px);
          line-height: 0.9; color: var(--text);
          letter-spacing: 0.01em;
        }
        .mybookings-header__title span { color: var(--accent); }
        .mybookings-filters {
          display: flex; gap: 6px; flex-wrap: wrap;
          margin-bottom: 28px;
        }
        .mybookings-filter-btn {
          padding: 7px 16px;
          font-family: var(--font-body);
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s;
        }
        .mybookings-filter-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }
        .mybookings-filter-btn.active { background: var(--accent); color: #0c0c0c; border-color: var(--accent); }
        .booking-item {
          background: var(--bg-card);
          border: 1px solid var(--border);
          margin-bottom: 12px;
          display: grid;
          grid-template-columns: 140px 1fr auto;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .booking-item:hover { border-color: rgba(255,210,0,0.15); }
        .booking-item__img { height: 100%; min-height: 130px; object-fit: cover; display: block; width: 140px; }
        .booking-item__body { padding: 20px 24px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; }
        .booking-item__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .booking-item__name { font-family: var(--font-display); font-size: 28px; letter-spacing: 0.02em; color: var(--text); line-height: 1; }
        .booking-item__category { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); margin-top: 2px; }
        .booking-item__status { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 10px; flex-shrink: 0; }
        .booking-item__meta { display: flex; gap: 20px; flex-wrap: wrap; }
        .booking-item__meta-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); }
        .booking-item__meta-item svg { color: var(--accent); }
        .booking-item__right { padding: 20px 24px; display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; border-left: 1px solid var(--border); min-width: 140px; }
        .booking-item__price { font-family: var(--font-display); font-size: 32px; color: var(--text); letter-spacing: 0.02em; line-height: 1; }
        .booking-item__price-sub { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); margin-top: 2px; }
        .booking-item__ref { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: var(--accent); margin-bottom: 4px; }
        .booking-item__cancel-btn { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); background: none; border: none; cursor: pointer; padding: 0; transition: color 0.2s; }
        .booking-item__cancel-btn:hover { color: #ef4444; }
        @media (max-width: 700px) {
          .booking-item { grid-template-columns: 100px 1fr; grid-template-rows: auto auto; }
          .booking-item__img { width: 100px; min-height: 100px; grid-row: 1 / 3; }
          .booking-item__right { grid-column: 2; border-left: none; border-top: 1px solid var(--border); flex-direction: row; align-items: center; padding: 12px 16px; min-width: 0; }
          .booking-item__body { padding: 14px 16px; }
          .booking-item__name { font-size: 22px; }
        }
        @media (max-width: 480px) {
          .booking-item { grid-template-columns: 1fr; }
          .booking-item__img { width: 100%; height: 160px; grid-row: auto; }
          .booking-item__right { border-left: none; flex-direction: row; }
        }
        .mybookings-empty { text-align: center; padding: 80px 24px; color: var(--text-muted); }
        .mybookings-empty__icon { font-size: 48px; margin-bottom: 16px; }
        .mybookings-empty__title { font-family: var(--font-display); font-size: 40px; color: var(--text); margin-bottom: 8px; }
        .mybookings-loading { text-align: center; padding: 80px 24px; font-family: var(--font-display); font-size: 32px; color: var(--accent); }
        .cancel-overlay { position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .cancel-modal { background: var(--bg-card); border: 1px solid var(--border); padding: 32px; max-width: 400px; width: 100%; }
        .cancel-modal__title { font-family: var(--font-display); font-size: 32px; color: var(--text); margin-bottom: 10px; }
        .cancel-modal__desc { font-size: 14px; color: var(--text-muted); margin-bottom: 24px; line-height: 1.6; }
        .cancel-modal__actions { display: flex; gap: 10px; }
      `}</style>

      <div className="mybookings-page">
        <div className="mybookings-header">
          <div className="container">
            <p className="mybookings-header__eyebrow">Journey Rentals</p>
            <h1 className="mybookings-header__title">
              My <span>Account</span>
            </h1>
          </div>
        </div>

        <div className="container">

          {/* Loading */}
          {loading && <div className="mybookings-loading">Loading Bookings...</div>}

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '16px', color: '#ef4444', fontSize: '14px', marginBottom: '24px' }}>
              Failed to load bookings: {error}
            </div>
          )}

          {/* Filter tabs */}
          {!loading && (
            <div className="mybookings-filters">
              {filters.map(f => (
                <button
                  key={f}
                  className={`mybookings-filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'profile' ? 'Profile' : 'Bookings'}
                </button>
              ))}
            </div>
          )}

          {/* Booking list */}
          {filter === 'profile' ? (
            <Profile />
          ) : !loading && filtered.length === 0 ? (
            <div className="mybookings-empty">
              <div className="mybookings-empty__icon">📋</div>
              <div className="mybookings-empty__title">No bookings found</div>
              <p style={{ marginBottom: '24px', fontSize: '14px' }}>
                You have no bookings yet.
              </p>
              <Link to="/cars" className="btn btn--yellow" style={{ fontSize: '12px' }}>Browse Fleet</Link>
            </div>
          ) : (
            filtered.map(booking => {
              const st   = statusConfig[booking.status] || statusConfig.pending
              const days = booking.bookingType === 'bike'
                ? null
                : getDays(booking.pickupDate, booking.returnDate)

              return (
                <div className="booking-item" key={booking._id}>
                  <img
                    src={booking.vehicleSnapshot?.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80'}
                    alt={`${booking.vehicleSnapshot?.brand} ${booking.vehicleSnapshot?.model}`}
                    className="booking-item__img"
                  />

                  <div className="booking-item__body">
                    <div>
                      <div className="booking-item__top">
                        <div>
                          <div className="booking-item__name">
                            {booking.vehicleSnapshot?.brand} {booking.vehicleSnapshot?.model}
                          </div>
                          <div className="booking-item__category">
                            {booking.bookingType?.toUpperCase()} · Booked {formatDate(booking.createdAt)}
                          </div>
                        </div>
                        <div className="booking-item__status"
                          style={{ color: st.color, background: st.bg, border: `1px solid ${st.border}` }}>
                          {st.label}
                        </div>
                      </div>
                    </div>

                    <div className="booking-item__meta">
                      {booking.bookingType === 'bike' ? (
                        <>
                          <div className="booking-item__meta-item">
                            <CalIcon />
                            Date: <strong style={{ color: 'var(--text)' }}>{formatDate(booking.bikeDate)}</strong>
                          </div>
                          <div className="booking-item__meta-item">
                            <CarIcon />
                            Slot: <strong style={{ color: 'var(--text)' }}>{booking.bikeSlot}</strong>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="booking-item__meta-item">
                            <CalIcon />
                            Pickup: <strong style={{ color: 'var(--text)' }}>{formatDate(booking.pickupDate)}</strong>
                          </div>
                          <div className="booking-item__meta-item">
                            <CalIcon />
                            Return: <strong style={{ color: 'var(--text)' }}>{formatDate(booking.returnDate)}</strong>
                          </div>
                          {days > 0 && (
                            <div className="booking-item__meta-item">
                              <CarIcon />
                              {days} day{days > 1 ? 's' : ''}
                            </div>
                          )}
                        </>
                      )}
                      {booking.pickupLocation && (
                        <div className="booking-item__meta-item">
                          📍 {booking.pickupLocation}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="booking-item__right">
                    <div>
                      <div className="booking-item__ref">{booking.referenceId}</div>
                      <div className="booking-item__price">₹{booking.totalPrice?.toLocaleString()}</div>
                      <div className="booking-item__price-sub">
                        {booking.bookingType === 'bike' ? booking.bikeSlot : `${days} day${days > 1 ? 's' : ''}`} total
                      </div>
                    </div>
                    {(booking.status === 'confirmed' || booking.status === 'pending') && (
                      <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                        {booking.status === 'confirmed' && (
                          booking.extensionRequested ? (
                            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                              Extend {booking.extensionStatus}
                            </span>
                          ) : (
                            <button className="booking-item__cancel-btn" style={{ color: 'var(--accent)' }} onClick={() => setExtendingId(booking._id)}>
                              Extend
                            </button>
                          )
                        )}
                        <button className="booking-item__cancel-btn" onClick={() => setCancelId(booking._id)}>
                          Cancel
                        </button>
                      </div>
                    )}
                    {booking.status === 'completed' && (
                      <Link to="/cars" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                        Book Again
                      </Link>
                    )}
                  </div>
                </div>
              )
            })
          )}

        </div>
      </div>

      {/* Cancel confirmation modal */}
      {cancelId && (
        <div className="cancel-overlay" onClick={() => setCancelId(null)}>
          <div className="cancel-modal" onClick={e => e.stopPropagation()}>
            <div className="cancel-modal__title">Cancel Booking?</div>
            <p className="cancel-modal__desc">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="cancel-modal__actions">
              <button className="btn btn--yellow" style={{ fontSize: '12px', flex: 1, justifyContent: 'center' }}
                onClick={() => handleCancel(cancelId)}>
                Yes, Cancel
              </button>
              <button className="btn btn--outline" style={{ fontSize: '12px', flex: 1, justifyContent: 'center' }}
                onClick={() => setCancelId(null)}>
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extension request modal */}
      {extendingId && (
        <div className="cancel-overlay" onClick={() => setExtendingId(null)}>
          <div className="cancel-modal" onClick={e => e.stopPropagation()}>
            <div className="cancel-modal__title">Request Extension?</div>
            <p className="cancel-modal__desc">
              Would you like to extend your rental duration? We will review your request and get in touch with the updated pricing.
            </p>
            <div className="cancel-modal__actions">
              <button className="btn btn--yellow" style={{ fontSize: '12px', flex: 1, justifyContent: 'center' }}
                onClick={() => handleExtensionRequest(extendingId)}>
                Request Extension
              </button>
              <button className="btn btn--outline" style={{ fontSize: '12px', flex: 1, justifyContent: 'center' }}
                onClick={() => setExtendingId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}

export default MyBookings