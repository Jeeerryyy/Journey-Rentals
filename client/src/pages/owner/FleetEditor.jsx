import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api.js'

const FleetEditor = () => {
  const [heading, setHeading]       = useState('Our Fleet')
  const [subheading, setSubheading] = useState('Best Self-Drive Rentals')
  const [vehicles, setVehicles]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState(null)
  const [success, setSuccess]       = useState(null)
  const [editingId, setEditingId]   = useState(null)
  const [showForm, setShowForm]     = useState(false)
  const dragItem    = useRef(null)
  const dragOverItem = useRef(null)

  const emptyVehicle = { name: '', category: '', seats: '', fuel: '', transmission: 'Manual', pricePerDay: 0, image: '', isFeatured: false, isVisible: true }
  const [form, setForm] = useState({ ...emptyVehicle })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const loadSection = async () => {
      try {
        const data = await api.owner.getFleetSection()
        if (data.section) {
          setHeading(data.section.heading || 'Our Fleet')
          setSubheading(data.section.subheading || 'Best Self-Drive Rentals')
          setVehicles(data.section.vehicles || [])
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadSection()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const ordered = vehicles.map((v, i) => ({ ...v, order: i }))
      await api.owner.updateFleetSection({ heading, subheading, vehicles: ordered })
      setSuccess('Fleet section saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Compress image on client side before uploading to Cloudinary
  const compressImage = (file, maxWidth = 800, quality = 0.75) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width, h = img.height
        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    setError(null)
    try {
      const compressed = await compressImage(file)
      const data = await api.owner.uploadImages({ images: [compressed] })
      if (data.urls?.[0]) {
        setForm(f => ({ ...f, image: data.urls[0] }))
      } else {
        setError('Upload succeeded but no URL returned.')
      }
    } catch (err) {
      setError('Image upload failed: ' + (err.message || 'Unknown error'))
    } finally {
      setUploading(false)
    }
  }

  const handleAddOrUpdate = () => {
    if (!form.name.trim()) { setError('Vehicle name is required.'); return }
    if (!form.image) { setError('Vehicle image is required.'); return }
    setError(null)

    if (editingId) {
      setVehicles(vs => vs.map(v => v._id === editingId || v.tempId === editingId ? { ...v, ...form } : v))
      setEditingId(null)
    } else {
      setVehicles(vs => [...vs, { ...form, tempId: `temp_${Date.now()}`, order: vs.length }])
    }
    setForm({ ...emptyVehicle })
    setShowForm(false)
  }

  const handleEdit = (vehicle) => {
    setForm({
      name: vehicle.name || '',
      category: vehicle.category || '',
      seats: vehicle.seats || '',
      fuel: vehicle.fuel || '',
      transmission: vehicle.transmission || 'Manual',
      pricePerDay: vehicle.pricePerDay || 0,
      image: vehicle.image || '',
      isFeatured: vehicle.isFeatured || false,
      isVisible: vehicle.isVisible !== false,
    })
    setEditingId(vehicle._id || vehicle.tempId)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    setVehicles(vs => vs.filter(v => (v._id || v.tempId) !== id))
  }

  const toggleFeatured = (id) => {
    setVehicles(vs => vs.map(v => (v._id || v.tempId) === id ? { ...v, isFeatured: !v.isFeatured } : v))
  }

  const toggleVisible = (id) => {
    setVehicles(vs => vs.map(v => (v._id || v.tempId) === id ? { ...v, isVisible: !v.isVisible } : v))
  }

  // Drag and drop
  const onDragStart = (idx) => { dragItem.current = idx }
  const onDragEnter = (idx) => { dragOverItem.current = idx }
  const onDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return
    const list = [...vehicles]
    const [dragged] = list.splice(dragItem.current, 1)
    list.splice(dragOverItem.current, 0, dragged)
    setVehicles(list)
    dragItem.current = null
    dragOverItem.current = null
  }

  // Touch drag-and-drop
  const touchState = useRef({ startIdx: null, startY: 0, clone: null, listEl: null })

  const onTouchStart = (idx, e) => {
    const touch = e.touches[0]
    const target = e.currentTarget
    touchState.current.startIdx = idx
    touchState.current.startY = touch.clientY
    touchState.current.listEl = target.parentElement
    target.style.opacity = '0.5'
  }

  const onTouchMove = (e) => {
    if (touchState.current.startIdx === null) return
    e.preventDefault()
  }

  const onTouchEnd = (idx, e) => {
    const el = e.currentTarget
    el.style.opacity = '1'
    const touch = e.changedTouches[0]
    const dy = touch.clientY - touchState.current.startY
    const itemHeight = el.offsetHeight + 8
    const moveBy = Math.round(dy / itemHeight)
    const fromIdx = touchState.current.startIdx
    const toIdx = Math.max(0, Math.min(vehicles.length - 1, fromIdx + moveBy))

    if (fromIdx !== toIdx) {
      const list = [...vehicles]
      const [dragged] = list.splice(fromIdx, 1)
      list.splice(toIdx, 0, dragged)
      setVehicles(list)
    }
    touchState.current.startIdx = null
  }

  return (
    <>
      <style>{`
        .fe-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .fe-title { font-family: var(--font-display); font-size: 36px; letter-spacing: 0.02em; color: var(--text); line-height: 1; }
        .fe-title span { color: var(--accent); }
        .fe-sub { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

        .fe-save-btn {
          padding: 12px 28px; background: var(--accent); color: #0c0c0c;
          font-weight: 800; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
          border: none; cursor: pointer; transition: background 0.2s, transform 0.2s;
          clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
        }
        .fe-save-btn:hover { background: #ffe44d; transform: translateY(-1px); }
        .fe-save-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .fe-alert { padding: 12px 16px; font-size: 13px; margin-bottom: 16px; border: 1px solid; }
        .fe-alert--error { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); color: #ef4444; }
        .fe-alert--success { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.3); color: #22c55e; }

        .fe-section { background: var(--bg-card); border: 1px solid var(--border); padding: 20px; margin-bottom: 16px; }
        .fe-section-label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; }
        .fe-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .fe-field { flex: 1; min-width: 200px; }
        .fe-field label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; }
        .fe-field input, .fe-field select {
          width: 100%; padding: 10px 12px; background: var(--bg-soft); border: 1px solid var(--border);
          color: var(--text); font-size: 13px; font-family: var(--font-body); outline: none;
          transition: border-color 0.2s;
        }
        .fe-field input:focus, .fe-field select:focus { border-color: var(--accent); }

        .fe-add-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 20px; background: var(--bg-card); border: 1px solid var(--border);
          color: var(--text); font-size: 12px; font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase; cursor: pointer; transition: all 0.2s;
        }
        .fe-add-btn:hover { border-color: var(--accent); color: var(--accent); }

        .fe-form { background: var(--bg-card); border: 1px solid var(--border); padding: 20px; margin-bottom: 16px; }
        .fe-form-title { font-family: var(--font-display); font-size: 22px; color: var(--text); margin-bottom: 16px; }

        .fe-img-upload { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .fe-img-preview { width: 120px; height: 80px; object-fit: cover; border: 1px solid var(--border); background: var(--bg-soft); }
        .fe-img-btn {
          padding: 8px 16px; background: var(--bg-soft); border: 1px solid var(--border);
          color: var(--text-muted); font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden;
        }
        .fe-img-btn:hover { border-color: var(--accent); color: var(--accent); }
        .fe-img-btn input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

        .fe-form-actions { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
        .fe-form-submit {
          padding: 10px 24px; background: var(--accent); color: #0c0c0c;
          font-weight: 800; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase;
          border: none; cursor: pointer; transition: background 0.2s;
        }
        .fe-form-submit:hover { background: #ffe44d; }
        .fe-form-cancel {
          padding: 10px 24px; background: transparent; border: 1px solid var(--border);
          color: var(--text-muted); font-weight: 700; font-size: 12px; letter-spacing: 0.06em;
          text-transform: uppercase; cursor: pointer; transition: all 0.2s;
        }
        .fe-form-cancel:hover { border-color: var(--text-muted); color: var(--text); }

        /* Vehicle list */
        .fe-list { display: flex; flex-direction: column; gap: 8px; }
        .fe-card {
          display: flex; align-items: center; gap: 14px;
          background: var(--bg-card); border: 1px solid var(--border);
          padding: 12px 16px; transition: border-color 0.2s, opacity 0.2s;
          cursor: grab; user-select: none;
        }
        .fe-card:active { cursor: grabbing; }
        .fe-card.dragging { opacity: 0.4; border-color: var(--accent); }
        .fe-card.not-visible { opacity: 0.45; }
        .fe-card__drag { color: var(--text-muted); flex-shrink: 0; display: flex; align-items: center; touch-action: none; }
        .fe-card__img { width: 70px; height: 48px; object-fit: cover; border: 1px solid var(--border); flex-shrink: 0; background: var(--bg-soft); }
        .fe-card__info { flex: 1; min-width: 0; }
        .fe-card__name { font-weight: 700; font-size: 14px; color: var(--text); display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .fe-card__badge {
          font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          padding: 2px 7px; border: 1px solid;
        }
        .fe-card__badge--featured { color: var(--accent); background: var(--accent-dim); border-color: rgba(255,210,0,0.2); }
        .fe-card__badge--hidden { color: var(--text-muted); background: var(--bg-soft); border-color: var(--border); }
        .fe-card__meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
        .fe-card__actions { display: flex; gap: 4px; flex-shrink: 0; flex-wrap: wrap; }
        .fe-icon-btn {
          width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
          background: var(--bg-soft); border: 1px solid var(--border); color: var(--text-muted);
          cursor: pointer; transition: all 0.2s; flex-shrink: 0;
        }
        .fe-icon-btn:hover { border-color: var(--accent); color: var(--accent); }
        .fe-icon-btn.active { color: var(--accent); border-color: rgba(255,210,0,0.3); background: var(--accent-dim); }
        .fe-icon-btn.danger:hover { border-color: #ef4444; color: #ef4444; }

        .fe-empty { text-align: center; padding: 40px; color: var(--text-muted); font-size: 14px; background: var(--bg-card); border: 1px solid var(--border); }

        .fe-loading { display: flex; align-items: center; justify-content: center; min-height: 300px; font-family: var(--font-display); font-size: 28px; color: var(--accent); }

        @media (max-width: 600px) {
          .fe-title { font-size: 26px; }
          .fe-card { flex-wrap: wrap; gap: 10px; padding: 10px 12px; }
          .fe-card__img { width: 56px; height: 40px; }
          .fe-card__actions { width: 100%; justify-content: flex-end; }
          .fe-field { min-width: 100%; }
          .fe-row { flex-direction: column; }
          .fe-header { flex-direction: column; align-items: stretch; }
          .fe-save-btn { width: 100%; text-align: center; }
        }
      `}</style>

      {/* Header */}
      <div className="fe-header">
        <div>
          <div className="fe-title">Fleet <span>Editor</span></div>
          <div className="fe-sub">Manage the fleet section displayed on your homepage.</div>
        </div>
        <button className="fe-save-btn" onClick={handleSave} disabled={saving || loading}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Alerts */}
      {error && <div className="fe-alert fe-alert--error">{error}</div>}
      {success && <div className="fe-alert fe-alert--success">{success}</div>}

      {loading ? (
        <div className="fe-loading">Loading…</div>
      ) : (
        <>
          {/* Heading / Subheading */}
          <div className="fe-section">
            <div className="fe-section-label">Section Heading</div>
            <div className="fe-row">
              <div className="fe-field">
                <label>Heading</label>
                <input value={heading} onChange={e => setHeading(e.target.value)} placeholder="Our Fleet" />
              </div>
              <div className="fe-field">
                <label>Subheading</label>
                <input value={subheading} onChange={e => setSubheading(e.target.value)} placeholder="Best Self-Drive Rentals" />
              </div>
            </div>
          </div>

          {/* Add Vehicle Button */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="fe-add-btn" onClick={() => { setForm({ ...emptyVehicle }); setEditingId(null); setShowForm(true) }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              Add Vehicle
            </button>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div className="fe-form">
              <div className="fe-form-title">{editingId ? 'Edit Vehicle' : 'Add New Vehicle'}</div>
              <div className="fe-row" style={{ marginBottom: 12 }}>
                <div className="fe-field">
                  <label>Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Swift" />
                </div>
                <div className="fe-field">
                  <label>Category</label>
                  <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Hatchback" />
                </div>
              </div>
              <div className="fe-row" style={{ marginBottom: 12 }}>
                <div className="fe-field">
                  <label>Seats</label>
                  <input value={form.seats} onChange={e => setForm(f => ({ ...f, seats: e.target.value }))} placeholder="5" />
                </div>
                <div className="fe-field">
                  <label>Fuel Type</label>
                  <input value={form.fuel} onChange={e => setForm(f => ({ ...f, fuel: e.target.value }))} placeholder="Petrol" />
                </div>
                <div className="fe-field">
                  <label>Transmission</label>
                  <select value={form.transmission} onChange={e => setForm(f => ({ ...f, transmission: e.target.value }))}>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>
              </div>
              <div className="fe-row" style={{ marginBottom: 12 }}>
                <div className="fe-field">
                  <label>Price Per Day (₹)</label>
                  <input type="number" value={form.pricePerDay} onChange={e => setForm(f => ({ ...f, pricePerDay: Number(e.target.value) }))} />
                </div>
                <div className="fe-field">
                  <label>Featured</label>
                  <select value={form.isFeatured ? 'yes' : 'no'} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.value === 'yes' }))}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div className="fe-field">
                  <label>Visible</label>
                  <select value={form.isVisible ? 'yes' : 'no'} onChange={e => setForm(f => ({ ...f, isVisible: e.target.value === 'yes' }))}>
                    <option value="yes">Yes (shown on site)</option>
                    <option value="no">No (hidden)</option>
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div className="fe-section-label" style={{ marginTop: 8 }}>Vehicle Image *</div>
              <div className="fe-img-upload">
                {form.image && <img src={form.image} alt="Preview" className="fe-img-preview" />}
                <label className="fe-img-btn">
                  {uploading ? 'Uploading…' : (form.image ? 'Replace Image' : 'Upload Image')}
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>

              <div className="fe-form-actions">
                <button className="fe-form-submit" onClick={handleAddOrUpdate} disabled={uploading}>
                  {editingId ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
                <button className="fe-form-cancel" onClick={() => { setShowForm(false); setEditingId(null); setForm({ ...emptyVehicle }) }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Vehicle List */}
          {vehicles.length === 0 ? (
            <div className="fe-empty">No vehicles added yet. Click "Add Vehicle" to get started.</div>
          ) : (
            <div className="fe-list">
              {vehicles.map((v, idx) => {
                const id = v._id || v.tempId
                return (
                  <div
                    key={id}
                    className={`fe-card ${!v.isVisible ? 'not-visible' : ''}`}
                    draggable
                    onDragStart={() => onDragStart(idx)}
                    onDragEnter={() => onDragEnter(idx)}
                    onDragEnd={onDragEnd}
                    onDragOver={e => e.preventDefault()}
                    onTouchStart={e => onTouchStart(idx, e)}
                    onTouchMove={onTouchMove}
                    onTouchEnd={e => onTouchEnd(idx, e)}
                  >
                    {/* Drag handle */}
                    <div className="fe-card__drag">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
                    </div>

                    {/* Image */}
                    {v.image && <img src={v.image} alt={v.name} className="fe-card__img" />}

                    {/* Info */}
                    <div className="fe-card__info">
                      <div className="fe-card__name">
                        {v.name}
                        {v.isFeatured && <span className="fe-card__badge fe-card__badge--featured">Featured</span>}
                        {!v.isVisible && <span className="fe-card__badge fe-card__badge--hidden">Hidden</span>}
                      </div>
                      <div className="fe-card__meta">
                        {[v.category, v.seats && `${v.seats} seats`, v.fuel, v.transmission, v.pricePerDay && `₹${v.pricePerDay}/day`].filter(Boolean).join(' · ')}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="fe-card__actions">
                      {/* Featured toggle */}
                      <button className={`fe-icon-btn ${v.isFeatured ? 'active' : ''}`} onClick={() => toggleFeatured(id)} title="Toggle Featured">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={v.isFeatured ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      </button>
                      {/* Visibility toggle */}
                      <button className={`fe-icon-btn ${!v.isVisible ? '' : 'active'}`} onClick={() => toggleVisible(id)} title="Toggle Visibility">
                        {v.isVisible ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        )}
                      </button>
                      {/* Edit */}
                      <button className="fe-icon-btn" onClick={() => handleEdit(v)} title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      {/* Delete */}
                      <button className="fe-icon-btn danger" onClick={() => handleDelete(id)} title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </>
  )
}

export default FleetEditor
