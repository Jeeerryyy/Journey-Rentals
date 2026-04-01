import { useState, useEffect } from 'react'
import { api } from '../../lib/api.js'

const BookingPhotoModal = ({ isOpen, onClose, initialBooking = null, onUpdate = null }) => {
  const [booking, setBooking] = useState(null)
  const [bookings, setBookings] = useState([])
  const [pendingPhoto, setPendingPhoto] = useState(null) // Local preview before upload
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setPendingPhoto(null)
      if (initialBooking) {
        setBooking(initialBooking)
        setError(null)
      } else {
        setBooking(null)
        setError(null)
        fetchRecentBookings()
      }
    }
  }, [isOpen, initialBooking])

  const fetchRecentBookings = async () => {
    setLoading(true)
    setError(null)
    try {
      const [resC, resComp] = await Promise.all([
        api.owner.getBookings('confirmed'),
        api.owner.getBookings('completed')
      ])
      const combined = [...resC.bookings, ...resComp.bookings]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 50)
      setBookings(combined)
    } catch (err) {
      setError('Failed to load bookings.')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be under 5MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setPendingPhoto(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!pendingPhoto) return
    try {
      setUploading(true)
      const res = await api.owner.uploadBookingPhoto(booking._id, pendingPhoto)
      const updatedPhoto = res.url
      const updatedBooking = { ...booking, adminPhotoWithVehicleUrl: updatedPhoto, adminPhotoUrl: updatedPhoto }
      setBooking(updatedBooking)
      setPendingPhoto(null)
      if (onUpdate) onUpdate(updatedBooking)
      setBookings(prev => prev.map(b => b._id === updatedBooking._id ? updatedBooking : b))
    } catch (err) {
      alert(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handlePhotoDelete = async () => {
    if (!confirm('Are you sure you want to remove this photo?')) return
    try {
      setUploading(true)
      await api.owner.deleteBookingPhoto(booking._id)
      const updatedBooking = { ...booking, adminPhotoWithVehicleUrl: null, adminPhotoUrl: null }
      setBooking(updatedBooking)
      setPendingPhoto(null)
      if (onUpdate) onUpdate(updatedBooking)
      setBookings(prev => prev.map(b => b._id === updatedBooking._id ? updatedBooking : b))
    } catch (err) {
      alert(err.message)
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  const displayPhoto = pendingPhoto || (booking?.adminPhotoWithVehicleUrl || booking?.adminPhotoUrl)

  return (
    <>
      <style>{`
        .bp-overlay { position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .bp-modal { background: var(--bg-card); border: 1px solid var(--border); width: 100%; max-width: 500px; position: relative; display: flex; flex-direction: column; max-height: 85vh; border-radius: 4px; }
        .bp-head { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .bp-title { font-family: var(--font-display); font-size: 24px; color: var(--text); }
        .bp-close { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 20px; padding: 4px; transition: color 0.2s; }
        .bp-close:hover { color: var(--accent); }
        .bp-body { padding: 24px; overflow-y: auto; flex: 1; }

        .bp-list { display: flex; flex-direction: column; gap: 8px; }
        .bp-item { background: var(--bg-soft); border: 1px solid var(--border); padding: 12px 16px; cursor: pointer; transition: all 0.2s; border-radius: 4px; display: flex; align-items: center; justify-content: space-between; }
        .bp-item:hover { border-color: var(--accent); transform: translateX(4px); }
        .bp-item__info { flex: 1; }
        .bp-item__ref { font-weight: 800; color: var(--accent); font-size: 14px; margin-bottom: 2px; }
        .bp-item__meta { font-size: 12px; color: var(--text-muted); }
        .bp-item__status { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 6px; border: 1px solid; margin-left: 12px; opacity: 0.8; }

        .bp-back { display: flex; align-items: center; gap: 6px; background: none; border: none; color: var(--accent); font-size: 11px; font-weight: 700; text-transform: uppercase; cursor: pointer; margin-bottom: 16px; padding: 0; }
        .bp-back:hover { text-decoration: underline; }

        .bp-info { background: var(--bg-soft); border: 1px solid var(--border); padding: 16px; margin-bottom: 20px; border-radius: 4px; }
        .bp-info-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
        .bp-info-label { color: var(--text-muted); }
        .bp-info-val { color: var(--text); font-weight: 600; }

        .bp-photo-section { border-top: 1px solid var(--border); padding-top: 20px; }
        .bp-photo-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; display: block; }
        .bp-photo-desc { font-size: 12px; color: var(--text-muted); margin-bottom: 12px; }

        .bp-photo-wrap { position: relative; border-radius: 8px; overflow: hidden; border: 1px dashed var(--border); aspect-ratio: 16/9; background: var(--bg-soft); display: flex; align-items: center; justify-content: center; }
        .bp-photo-img { width: 100%; height: 100%; object-fit: cover; }
        .bp-photo-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--text-muted); cursor: pointer; padding: 20px; text-align: center; width: 100%; height: 100%; }
        .bp-photo-mini-btn { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); color: #fff; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; transition: all 0.2s; }
        .bp-photo-mini-btn:hover { background: var(--accent); color: #000; border-color: var(--accent); }
        .bp-photo-loading { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 800; z-index: 5; }
        
        .bp-save-btn { width: 100%; background: var(--accent); color: #000; border: none; padding: 12px; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; margin-top: 20px; cursor: pointer; transition: opacity 0.2s; }
        .bp-save-btn:hover { opacity: 0.9; }
        .bp-save-btn:disabled { background: var(--border); color: var(--text-muted); cursor: not-allowed; }
      `}</style>

      <div className="bp-overlay" onClick={onClose}>
        <div className="bp-modal" onClick={e => e.stopPropagation()}>
          <div className="bp-head">
            <div className="bp-title">{booking ? 'Manage Photo' : 'Select Booking'}</div>
            <button className="bp-close" onClick={onClose}>✕</button>
          </div>

          <div className="bp-body">
            {!booking && (
              <>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--accent)', fontWeight: 800 }}>Loading active bookings...</div>
                ) : error ? (
                  <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>{error}</div>
                ) : (
                  <div className="bp-list">
                    {bookings.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No confirmed or completed bookings found.</div>
                    ) : (
                      bookings.map(b => (
                        <div key={b._id} className="bp-item" onClick={() => setBooking(b)}>
                          <div className="bp-item__info">
                            <div className="bp-item__ref">#{b.referenceId}</div>
                            <div className="bp-item__meta">{b.userSnapshot?.name} · {b.vehicleSnapshot?.brand} {b.vehicleSnapshot?.model}</div>
                          </div>
                          {(b.adminPhotoWithVehicleUrl || b.adminPhotoUrl) && <div style={{ color: 'var(--accent)', fontSize: '18px' }}>📷</div>}
                          <div className="bp-item__status" style={{ borderColor: b.status === 'confirmed' ? '#22c55e' : '#60a5fa', color: b.status === 'confirmed' ? '#22c55e' : '#60a5fa' }}>{b.status}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}

            {booking && (
              <>
                {!initialBooking && (
                  <button className="bp-back" onClick={() => setBooking(null)}>← Back to list</button>
                )}
                
                <div className="bp-info">
                  <div className="bp-info-row">
                    <span className="bp-info-label">Reference ID</span>
                    <span className="bp-info-val" style={{ color: 'var(--accent)' }}>#{booking.referenceId}</span>
                  </div>
                  <div className="bp-info-row">
                    <span className="bp-info-label">Customer</span>
                    <span className="bp-info-val">{booking.userSnapshot?.name}</span>
                  </div>
                </div>

                <div className="bp-photo-section">
                  <span className="bp-photo-label">User Photo with Vehicle {pendingPhoto && '(Unsaved)'}</span>
                  <div className="bp-photo-wrap">
                    {uploading && <div className="bp-photo-loading">Processing...</div>}
                    {displayPhoto ? (
                      <>
                        <img src={displayPhoto} className="bp-photo-img" alt="User with Vehicle" />
                        <div style={{ position: 'absolute', bottom: '8px', right: '8px', display: 'flex', gap: '6px' }}>
                          <label className="bp-photo-mini-btn" title="Change Photo">
                            <input type="file" accept="image/*" hidden onChange={handlePhotoSelect} disabled={uploading} />
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L17 3z"/></svg>
                          </label>
                          {!pendingPhoto && (
                            <button className="bp-photo-mini-btn" title="Remove Photo" onClick={handlePhotoDelete} disabled={uploading}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <label className="bp-photo-empty">
                        <input type="file" accept="image/*" hidden onChange={handlePhotoSelect} disabled={uploading} />
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Pick User Photo</span>
                      </label>
                    )}
                  </div>
                  
                  {pendingPhoto ? (
                    <button className="bp-save-btn" onClick={handleSave} disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Save Changes'}
                    </button>
                  ) : (
                    <button className="bp-save-btn" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }} onClick={onClose}>
                      Done
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default BookingPhotoModal
