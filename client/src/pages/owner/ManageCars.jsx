import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api.js'

const ALL_LOCATIONS = ['Solapur Station', 'Hotgi Road', 'Vijapur Road', 'Akkalkot Road']

const ManageCars = () => {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [editPrice, setEditPrice] = useState('')
  const [editAvail, setEditAvail] = useState(true)
  const [editLocations, setEditLocations] = useState([])
  const [newLocation, setNewLocation] = useState('')

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    try {
      const data = await api.owner.getVehicles()
      setCars(data.vehicles)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.owner.deleteVehicle(id)
      setCars(prev => prev.filter(c => c._id !== id))
      setDeleteId(null)
    } catch (err) {
      alert(err.message)
    }
  }

  const openEdit = (car) => {
    setEditId(car._id)
    setEditPrice(car.pricePerDay)
    setEditAvail(car.isAvailable)
    setEditLocations(car.locations || [])
    setNewLocation('')
  }

  const toggleLocation = (loc) => {
    setEditLocations(prev =>
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    )
  }

  const addCustomLocation = () => {
    const trimmed = newLocation.trim()
    if (trimmed && !editLocations.includes(trimmed)) {
      setEditLocations(prev => [...prev, trimmed])
    }
    setNewLocation('')
  }

  const saveEdit = async () => {
    try {
      const payload = {
        pricePerDay: Number(editPrice),
        isAvailable: editAvail,
        locations: editLocations
      }
      await api.owner.updateVehicle(editId, payload)
      setCars(prev => prev.map(c => c._id === editId ? { ...c, ...payload } : c))
      setEditId(null)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <>
      <style>{`
        .mc-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
        .mc-title { font-family: var(--font-display); font-size: 40px; letter-spacing: 0.02em; color: var(--text); line-height: 1; }
        .mc-title span { color: var(--accent); }
        .mc-count { font-size: 13px; color: var(--text-muted); margin-top: 6px; }
        .mc-add-btn { padding: 11px 20px; background: var(--accent); color: #0c0c0c; font-weight: 800; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px)); transition: background 0.2s; white-space: nowrap; }
        .mc-add-btn:hover { background: #ffe44d; }

        .mc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
        .mc-card { background: var(--bg-card); border: 1px solid var(--border); overflow: hidden; transition: border-color 0.2s; }
        .mc-card:hover { border-color: rgba(255,210,0,0.2); }
        .mc-card__img { width: 100%; height: 160px; object-fit: cover; display: block; }
        .mc-card__body { padding: 16px; }
        .mc-card__name { font-family: var(--font-display); font-size: 24px; color: var(--text); line-height: 1; margin-bottom: 4px; }
        .mc-card__meta { font-size: 12px; color: var(--text-muted); margin-bottom: 12px; }
        .mc-card__row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .mc-card__price { font-family: var(--font-display); font-size: 22px; color: var(--accent); }
        .mc-card__avail { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 10px; border: 1px solid; }
        .mc-card__actions { display: flex; gap: 8px; }
        .mc-btn { flex: 1; padding: 9px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; border: 1px solid var(--border); background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
        .mc-btn:hover { color: var(--text); border-color: rgba(255,255,255,0.2); background: var(--bg-soft); }
        .mc-btn.danger:hover { color: #ef4444; border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.05); }

        /* Edit modal */
        .mc-modal-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .mc-modal { background: var(--bg-card); border: 1px solid var(--border); padding: 28px; width: 100%; max-width: 380px; }
        .mc-modal__title { font-family: var(--font-display); font-size: 28px; color: var(--text); margin-bottom: 20px; }
        .mc-modal__label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; display: block; }
        .mc-modal__input { width: 100%; padding: 11px 14px; background: var(--bg-soft); border: 1px solid var(--border); color: var(--text); font-family: var(--font-body); font-size: 14px; outline: none; box-sizing: border-box; margin-bottom: 16px; }
        .mc-modal__input:focus { border-color: rgba(255,210,0,0.4); }
        .mc-modal__toggle { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; cursor: pointer; }
        .mc-modal__track { width: 40px; height: 22px; border-radius: 11px; border: 1px solid var(--border); background: var(--bg-soft); position: relative; transition: all 0.2s; }
        .mc-modal__track.on { background: var(--accent); border-color: var(--accent); }
        .mc-modal__thumb { width: 16px; height: 16px; border-radius: 50%; background: rgba(255,255,255,0.4); position: absolute; top: 2px; left: 2px; transition: all 0.2s; }
        .mc-modal__track.on .mc-modal__thumb { left: 20px; background: #0c0c0c; }
        .mc-modal__actions { display: flex; gap: 10px; }
        .mc-save-btn { flex: 1; padding: 12px; background: var(--accent); color: #0c0c0c; font-weight: 800; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; border: none; cursor: pointer; }
        .mc-save-btn:hover { background: #ffe44d; }
        .mc-cancel-btn { flex: 1; padding: 12px; background: transparent; border: 1px solid var(--border); color: var(--text-muted); font-weight: 700; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }

        /* Locations */
        .mc-loc-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
        .mc-loc-chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; border: 1px solid; cursor: pointer; transition: all 0.15s; }
        .mc-loc-chip.on { background: var(--accent-dim); border-color: rgba(255,210,0,0.4); color: var(--accent); }
        .mc-loc-chip.off { background: transparent; border-color: var(--border); color: var(--text-muted); }
        .mc-loc-chip.off:hover { border-color: rgba(255,255,255,0.2); color: var(--text); }
        .mc-loc-add { display: flex; gap: 8px; margin-bottom: 16px; }
        .mc-loc-input { flex: 1; padding: 9px 12px; background: var(--bg-soft); border: 1px solid var(--border); color: var(--text); font-family: var(--font-body); font-size: 13px; outline: none; }
        .mc-loc-input:focus { border-color: rgba(255,210,0,0.4); }
        .mc-loc-add-btn { padding: 9px 14px; background: var(--accent); color: #0c0c0c; font-weight: 800; font-size: 12px; border: none; cursor: pointer; white-space: nowrap; }
        .mc-card__locs { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px; }
        .mc-card__loc { font-size: 10px; font-weight: 700; letter-spacing: 0.06em; padding: 3px 8px; background: var(--accent-dim); border: 1px solid rgba(255,210,0,0.15); color: var(--accent); }

        /* Delete modal */
        .mc-delete-modal { background: var(--bg-card); border: 1px solid rgba(239,68,68,0.3); padding: 28px; max-width: 360px; width: 100%; }
        .mc-delete-modal__title { font-family: var(--font-display); font-size: 28px; color: var(--text); margin-bottom: 8px; }
        .mc-delete-modal__sub { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; line-height: 1.6; }
        .mc-delete-btn { flex: 1; padding: 12px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; font-weight: 800; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
        .mc-delete-btn:hover { background: rgba(239,68,68,0.25); }

        @media (max-width: 600px) {
          .mc-title { font-size: 28px; }
          .mc-header { flex-direction: column; align-items: stretch; }
          .mc-add-btn { text-align: center; }
          .mc-grid { grid-template-columns: 1fr; }
          .mc-card__img { height: 140px; }
          .mc-card__name { font-size: 20px; }
          .mc-card__price { font-size: 18px; }
          .mc-card__actions { flex-direction: row; }
          .mc-btn { padding: 10px; font-size: 12px; min-height: 44px; }
          .mc-modal { padding: 20px; max-width: calc(100vw - 40px); }
          .mc-modal__title { font-size: 24px; }
          .mc-loc-chips { gap: 6px; }
          .mc-loc-chip { font-size: 11px; padding: 6px 10px; min-height: 36px; }
          .mc-save-btn, .mc-cancel-btn, .mc-delete-btn { min-height: 44px; font-size: 13px; }
        }
      `}</style>

      <div className="mc-header">
        <div>
          <div className="mc-title">Manage <span>Cars</span></div>
          <div className="mc-count">{loading ? 'Loading...' : `${cars.length} cars in your fleet`}</div>
        </div>
        <Link to="/owner/add-car" className="mc-add-btn">+ Add New Car</Link>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '16px', marginBottom: '24px', border: '1px solid rgba(239,68,68,0.3)' }}>{error}</div>}

      <div className="mc-grid">
        {cars.map(car => (
          <div className="mc-card" key={car._id}>
            <img src={car.image} alt={`${car.brand} ${car.model}`} className="mc-card__img" />
            <div className="mc-card__body">
              <div className="mc-card__name">{car.brand} {car.model}</div>
              <div className="mc-card__meta">{car.year} · {car.category} · {car.fuelType} · {car.transmission}</div>
              <div className="mc-card__row">
                <div className="mc-card__price">
                  {car.type === 'bike' && car.bikeSlots 
                    ? `₹${car.bikeSlots.price12hr.toLocaleString()}`
                    : `₹${(car.pricePerDay || 0).toLocaleString()}`}
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {car.type === 'bike' ? '/12hrs' : '/day'}
                  </span>
                </div>
                <div className="mc-card__avail" style={{ color: car.isAvailable ? '#22c55e' : 'rgba(255,255,255,0.3)', background: car.isAvailable ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)', borderColor: car.isAvailable ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)' }}>
                  {car.isAvailable ? 'Available' : 'Unavailable'}
                </div>
              </div>
              {car.locations && car.locations.length > 0 && (
                <div className="mc-card__locs">
                  {car.locations.map(l => <span key={l} className="mc-card__loc">📍 {l}</span>)}
                </div>
              )}
              <div className="mc-card__actions">
                <button className="mc-btn" onClick={() => openEdit(car)}>✏ Edit</button>
                <button className="mc-btn danger" onClick={() => setDeleteId(car._id)}>🗑 Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editId && (
        <div className="mc-modal-overlay" onClick={() => setEditId(null)}>
          <div className="mc-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="mc-modal__title">Edit Car</div>

            <label className="mc-modal__label">Price Per Day (₹)</label>
            <input className="mc-modal__input" type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} />

            <label className="mc-modal__label" style={{ marginBottom: '10px' }}>Pickup Locations</label>
            <div className="mc-loc-chips">
              {ALL_LOCATIONS.map(loc => (
                <div
                  key={loc}
                  className={`mc-loc-chip ${editLocations.includes(loc) ? 'on' : 'off'}`}
                  onClick={() => toggleLocation(loc)}
                >
                  {editLocations.includes(loc) ? '✓' : '+'} {loc}
                </div>
              ))}
            </div>

            <label className="mc-modal__label">Add Custom Location</label>
            <div className="mc-loc-add">
              <input
                className="mc-loc-input"
                placeholder="e.g. Siddheshwar Temple"
                value={newLocation}
                onChange={e => setNewLocation(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomLocation()}
              />
              <button className="mc-loc-add-btn" onClick={addCustomLocation}>+ Add</button>
            </div>

            {editLocations.filter(l => !ALL_LOCATIONS.includes(l)).length > 0 && (
              <>
                <label className="mc-modal__label">Custom Locations</label>
                <div className="mc-loc-chips" style={{ marginBottom: '16px' }}>
                  {editLocations.filter(l => !ALL_LOCATIONS.includes(l)).map(loc => (
                    <div key={loc} className="mc-loc-chip on" onClick={() => toggleLocation(loc)}>
                      ✕ {loc}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mc-modal__toggle" onClick={() => setEditAvail(v => !v)}>
              <div className={`mc-modal__track ${editAvail ? 'on' : ''}`}>
                <div className="mc-modal__thumb" />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                {editAvail ? 'Available for Booking' : 'Unavailable'}
              </span>
            </div>
            <div className="mc-modal__actions">
              <button className="mc-save-btn" onClick={saveEdit}>Save Changes</button>
              <button className="mc-cancel-btn" onClick={() => setEditId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="mc-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="mc-delete-modal" onClick={e => e.stopPropagation()}>
            <div className="mc-delete-modal__title">Delete Car?</div>
            <p className="mc-delete-modal__sub">This will permanently remove the car from your fleet. This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="mc-delete-btn" onClick={() => handleDelete(deleteId)}>Yes, Delete</button>
              <button className="mc-cancel-btn" onClick={() => setDeleteId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ManageCars