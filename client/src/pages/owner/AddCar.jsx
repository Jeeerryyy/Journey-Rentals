import { useState } from 'react'
import { api } from '../../lib/api.js'
import { toBase64 } from '../../lib/utils.js'

const CAR_FEATURES = [
  'Air Conditioning', 'Power Steering', 'Power Windows', 'Central Locking',
  'Music System', 'Touchscreen Infotainment', 'Reverse Camera', '360° Camera',
  'ABS', 'ABS + EBD', 'Airbags', 'Cruise Control', 'Sunroof', 'Panoramic Sunroof',
  'Rear AC Vents', 'USB Charging', 'Wireless Charging', 'Ventilated Seats',
  'Leather Seats', 'Hill Assist', 'Auto Headlamps', 'LED Headlamps',
  'Rear Defogger', 'CNG Kit', 'Bose Sound System', 'Keyless Entry',
  'Push Button Start', 'Rain Sensing Wipers', 'Fog Lamps', 'Alloy Wheels',
]

const BIKE_FEATURES = [
  'LED Headlamp', 'LED DRL', 'LED Tail Lamp', 'Digital Console',
  'USB Charging', 'Mobile Charging Port', 'Disc Brake', 'Dual Channel ABS',
  'CBS Braking', 'Tubeless Tyres', 'Alloy Wheels', 'Split Seat',
  'External Fuel Lid', 'Silent Start', 'Park Assist', 'Tripper Navigation',
  'Auto Headlamp On', 'Combi Brake System', 'Econometer', 'Body Balance Technology',
  'Honda Eco Technology', 'DTS-i Engine', 'Twin Spark Technology',
]

const AddCar = () => {
  const [form, setForm] = useState({
    type: 'car',
    brand: '', model: '', year: '', category: '', transmission: '',
    fuelType: '', sittingCapacity: '', pricePerDay: '', description: '', isAvailable: true,
  })
  const [images, setImages]           = useState([]) // Array of File objects
  const [previews, setPreviews]       = useState([]) // Array of base64 strings
  const [selectedFeatures, setSelectedFeatures] = useState([])
  const [customFeature, setCustomFeature]       = useState('')
  const [submitted, setSubmitted]     = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [errors, setErrors]           = useState({})
  const [apiError, setApiError]       = useState(null)

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    // Reset features when switching vehicle type
    if (key === 'type') setSelectedFeatures([])
  }

  const toggleFeature = (feat) => {
    setSelectedFeatures(prev =>
      prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]
    )
  }

  const addCustomFeature = () => {
    const trimmed = customFeature.trim()
    if (trimmed && !selectedFeatures.includes(trimmed)) {
      setSelectedFeatures(prev => [...prev, trimmed])
    }
    setCustomFeature('')
  }

  const handleImage = (e) => {
    const files = Array.from(e.target.files)
    if (!files || files.length === 0) return

    setImages(prev => [...prev, ...files])
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => setPreviews(prev => [...prev, reader.result])
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const validate = () => {
    const e = {}
    if (!form.brand.trim())                              e.brand          = 'Required'
    if (!form.model.trim())                              e.model          = 'Required'
    if (!form.year || form.year < 2000 || form.year > 2030) e.year        = 'Enter valid year'
    if (!form.category)                                  e.category       = 'Required'
    if (!form.transmission)                              e.transmission   = 'Required'
    if (!form.fuelType)                                  e.fuelType       = 'Required'
    if (!form.sittingCapacity)                           e.sittingCapacity = 'Required'
    if (form.type === 'car' && (!form.pricePerDay || form.pricePerDay <= 0)) e.pricePerDay = 'Enter valid price'
    if (images.length === 0)                                             e.images         = 'At least one vehicle image required'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setApiError(null)
    setSubmitting(true)

    try {
      // Convert images to base64 for upload

      const base64Images = await Promise.all(images.map(img => toBase64(img)))

      // Upload multi images to Cloudinary via new endpoint
      const uploadData = await api.owner.uploadImages({ images: base64Images })
      const imageUrls = uploadData.urls

      // Build vehicle payload
      const payload = {
        type:            form.type,
        brand:           form.brand.trim(),
        model:           form.model.trim(),
        year:            Number(form.year),
        category:        form.category,
        transmission:    form.transmission,
        fuelType:        form.fuelType,
        sittingCapacity: Number(form.sittingCapacity),
        description:     form.description,
        isAvailable:     form.isAvailable,
        images:          imageUrls, // Send array of images
        features:        selectedFeatures,
        locations:       ['Solapur Station', 'Hotgi Road', 'Vijapur Road', 'Akkalkot Road'],
      }

      // Add pricing based on type
      if (form.type === 'car') {
        payload.pricePerDay = Number(form.pricePerDay)
      } else {
        payload.bikeSlots = { price3hr: 150, price6hr: 200, price12hr: 400 }
      }

      await api.owner.addVehicle(payload)
      setSubmitted(true)

    } catch (err) {
      setApiError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setForm({ type: 'car', brand: '', model: '', year: '', category: '', transmission: '', fuelType: '', sittingCapacity: '', pricePerDay: '', description: '', isAvailable: true })
    setImages([])
    setPreviews([])
    setSelectedFeatures([])
    setCustomFeature('')
    setSubmitted(false)
    setErrors({})
    setApiError(null)
  }

  const FieldError = ({ field }) => errors[field]
    ? <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', display: 'block' }}>{errors[field]}</span>
    : null

  return (
    <>
      <style>{`
        .addcar-header { margin-bottom: 28px; }
        .addcar-title { font-family: var(--font-display); font-size: 40px; letter-spacing: 0.02em; color: var(--text); line-height: 1; }
        .addcar-title span { color: var(--accent); }
        .addcar-sub { font-size: 13px; color: var(--text-muted); margin-top: 6px; }

        .addcar-form { background: var(--bg-card); border: 1px solid var(--border); padding: 32px; max-width: 800px; }
        .addcar-section { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
        .addcar-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .addcar-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        @media (max-width: 600px) {
          .addcar-grid, .addcar-grid-3 { grid-template-columns: 1fr; }
          .addcar-title { font-size: 28px; }
          .addcar-form { padding: 16px; }
          .addcar-submit { width: 100%; text-align: center; padding: 15px 20px; }
          .addcar-image-upload { padding: 24px 16px; }
          .addcar-previews-grid { grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 8px; }
          .addcar-feature-custom { flex-direction: column; }
          .addcar-type-tab { min-height: 44px; }
          .addcar-input, .addcar-select, .addcar-textarea { font-size: 16px; }
          .addcar-success { padding: 24px 16px; }
          .addcar-success__title { font-size: 28px; }
        }

        .addcar-field { display: flex; flex-direction: column; gap: 6px; }
        .addcar-label { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); }
        .addcar-input, .addcar-select, .addcar-textarea {
          padding: 11px 14px; background: var(--bg-soft); border: 1px solid var(--border);
          color: var(--text); font-family: var(--font-body); font-size: 14px; outline: none;
          transition: border-color 0.2s; width: 100%; box-sizing: border-box;
        }
        .addcar-input:focus, .addcar-select:focus, .addcar-textarea:focus { border-color: rgba(255,210,0,0.4); }
        .addcar-input.error, .addcar-select.error { border-color: rgba(239,68,68,0.5); }
        .addcar-select { appearance: none; cursor: pointer; }
        .addcar-textarea { resize: vertical; min-height: 90px; }

        .addcar-type-tabs { display: flex; gap: 0; margin-bottom: 20px; }
        .addcar-type-tab { flex: 1; padding: 12px; text-align: center; font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; border: 1px solid var(--border); background: var(--bg-soft); color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
        .addcar-type-tab.active { background: var(--accent); color: #0c0c0c; border-color: var(--accent); }

        .addcar-image-upload { border: 1px dashed var(--border); padding: 32px 20px; text-align: center; cursor: pointer; position: relative; transition: border-color 0.2s, background 0.2s; margin-bottom: 20px; }
        .addcar-image-upload:hover { border-color: rgba(255,210,0,0.4); background: var(--accent-dim); }
        .addcar-image-upload input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
        .addcar-previews-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; margin-top: 16px; margin-bottom: 8px; }
        .addcar-preview-item { position: relative; border-radius: 8px; overflow: hidden; height: 90px; border: 1px solid var(--border); }
        .addcar-preview-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .addcar-preview-remove { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.7); color: #fff; border: none; width: 20px; height: 20px; border-radius: 50%; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .addcar-preview-remove:hover { background: #ef4444; }

        .addcar-features-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
        .addcar-feature-chip {
          padding: 8px 14px; font-size: 12px; font-weight: 600; border: 1px solid var(--border);
          background: var(--bg-soft); color: var(--text-muted); cursor: pointer; transition: all 0.2s;
          user-select: none; white-space: nowrap;
        }
        .addcar-feature-chip:hover { border-color: rgba(255,210,0,0.4); color: var(--text); }
        .addcar-feature-chip.selected { background: var(--accent); color: #0c0c0c; border-color: var(--accent); font-weight: 700; }
        .addcar-feature-custom { display: flex; gap: 8px; margin-top: 12px; }
        .addcar-feature-custom input { flex: 1; }
        .addcar-feature-add-btn {
          padding: 10px 18px; background: var(--bg-soft); border: 1px solid var(--border);
          color: var(--text); font-size: 12px; font-weight: 700; letter-spacing: 0.06em;
          text-transform: uppercase; cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .addcar-feature-add-btn:hover { border-color: var(--accent); color: var(--accent); }
        .addcar-selected-count { font-size: 11px; color: var(--text-muted); margin-bottom: 12px; }

        .addcar-toggle { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .addcar-toggle-track { width: 44px; height: 24px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-soft); position: relative; cursor: pointer; transition: all 0.2s; }
        .addcar-toggle-track.on { background: var(--accent); border-color: var(--accent); }
        .addcar-toggle-thumb { width: 18px; height: 18px; border-radius: 50%; background: rgba(255,255,255,0.4); position: absolute; top: 2px; left: 2px; transition: all 0.2s; }
        .addcar-toggle-track.on .addcar-toggle-thumb { left: 22px; background: #0c0c0c; }
        .addcar-toggle-label { font-size: 13px; font-weight: 700; color: var(--text); }

        .addcar-submit { padding: 15px 40px; background: var(--accent); color: #0c0c0c; font-family: var(--font-body); font-weight: 800; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; border: none; cursor: pointer; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px)); transition: background 0.2s; }
        .addcar-submit:hover:not(:disabled) { background: #ffe44d; }
        .addcar-submit:disabled { background: var(--border); color: var(--text-muted); cursor: not-allowed; clip-path: none; }

        .addcar-success { background: var(--bg-card); border: 1px solid rgba(34,197,94,0.3); padding: 40px; text-align: center; max-width: 480px; }
        .addcar-success__icon { font-size: 48px; margin-bottom: 16px; }
        .addcar-success__title { font-family: var(--font-display); font-size: 36px; color: var(--text); margin-bottom: 8px; }
        .addcar-success__sub { font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px; }
        .addcar-success__btns { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

        .addcar-api-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); padding: 14px 16px; color: #ef4444; font-size: 13px; margin-bottom: 20px; }
        :root { --accent-dim: rgba(255,210,0,0.08); }
      `}</style>

      <div className="addcar-header">
        <div className="addcar-title">Add <span>New Vehicle</span></div>
        <div className="addcar-sub">Fill in the details below to list a new vehicle in your fleet.</div>
      </div>

      {!submitted ? (
        <div className="addcar-form">

          {/* Vehicle type tabs */}
          <div className="addcar-section">Vehicle Type</div>
          <div className="addcar-type-tabs" style={{ marginBottom: '20px' }}>
            <div className={`addcar-type-tab ${form.type === 'car' ? 'active' : ''}`} onClick={() => set('type', 'car')}>🚗 Car</div>
            <div className={`addcar-type-tab ${form.type === 'bike' ? 'active' : ''}`} onClick={() => set('type', 'bike')}>🏍 Bike</div>
          </div>

          {/* API Error */}
          {apiError && <div className="addcar-api-error">❌ {apiError}</div>}

          {/* Basic info */}
          <div className="addcar-section">Basic Information</div>
          <div className="addcar-grid">
            <div className="addcar-field">
              <label className="addcar-label">Brand *</label>
              <input className={`addcar-input ${errors.brand ? 'error' : ''}`} placeholder="e.g. Maruti, Honda" value={form.brand} onChange={e => set('brand', e.target.value)} />
              <FieldError field="brand" />
            </div>
            <div className="addcar-field">
              <label className="addcar-label">Model *</label>
              <input className={`addcar-input ${errors.model ? 'error' : ''}`} placeholder="e.g. Swift, Activa" value={form.model} onChange={e => set('model', e.target.value)} />
              <FieldError field="model" />
            </div>
          </div>

          <div className="addcar-grid-3">
            <div className="addcar-field">
              <label className="addcar-label">Year *</label>
              <input type="number" className={`addcar-input ${errors.year ? 'error' : ''}`} placeholder="2023" min="2000" max="2030" value={form.year} onChange={e => set('year', e.target.value)} />
              <FieldError field="year" />
            </div>
            <div className="addcar-field">
              <label className="addcar-label">Category *</label>
              <select className={`addcar-select ${errors.category ? 'error' : ''}`} value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select</option>
                {form.type === 'car'
                  ? ['Hatchback', 'Sedan', 'SUV', 'MPV', 'Crossover'].map(c => <option key={c}>{c}</option>)
                  : ['Scooter', 'Commuter', 'Sports', 'Cruiser'].map(c => <option key={c}>{c}</option>)
                }
              </select>
              <FieldError field="category" />
            </div>
            <div className="addcar-field">
              <label className="addcar-label">Seats *</label>
              <select className={`addcar-select ${errors.sittingCapacity ? 'error' : ''}`} value={form.sittingCapacity} onChange={e => set('sittingCapacity', e.target.value)}>
                <option value="">Select</option>
                {[2, 4, 5, 6, 7, 8].map(n => <option key={n}>{n}</option>)}
              </select>
              <FieldError field="sittingCapacity" />
            </div>
          </div>

          {/* Specs */}
          <div className="addcar-section">Vehicle Specs</div>
          <div className="addcar-grid">
            <div className="addcar-field">
              <label className="addcar-label">Transmission *</label>
              <select className={`addcar-select ${errors.transmission ? 'error' : ''}`} value={form.transmission} onChange={e => set('transmission', e.target.value)}>
                <option value="">Select</option>
                {['Manual', 'Automatic'].map(t => <option key={t}>{t}</option>)}
              </select>
              <FieldError field="transmission" />
            </div>
            <div className="addcar-field">
              <label className="addcar-label">Fuel Type *</label>
              <select className={`addcar-select ${errors.fuelType ? 'error' : ''}`} value={form.fuelType} onChange={e => set('fuelType', e.target.value)}>
                <option value="">Select</option>
                {['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'].map(f => <option key={f}>{f}</option>)}
              </select>
              <FieldError field="fuelType" />
            </div>
          </div>

          {/* Pricing */}
          <div className="addcar-section">Pricing</div>
          {form.type === 'car' ? (
            <div style={{ maxWidth: '280px', marginBottom: '20px' }}>
              <div className="addcar-field">
                <label className="addcar-label">Price Per Day (₹) *</label>
                <input type="number" className={`addcar-input ${errors.pricePerDay ? 'error' : ''}`} placeholder="1500" min="0" value={form.pricePerDay} onChange={e => set('pricePerDay', e.target.value)} />
                <FieldError field="pricePerDay" />
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '20px', background: 'var(--bg-soft)', border: '1px solid var(--border)', padding: '14px', fontSize: '13px', color: 'var(--text-muted)' }}>
              Bike pricing is fixed: <strong style={{ color: 'var(--accent)' }}>₹150 / 3hrs · ₹200 / 6hrs · ₹400 / 12hrs</strong>
            </div>
          )}

          {/* Description */}
          <div className="addcar-section">Description</div>
          <div style={{ marginBottom: '20px' }}>
            <textarea className="addcar-textarea" placeholder="Describe the vehicle — features, condition, best use..." value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          {/* Features & Amenities */}
          <div className="addcar-section">Features &amp; Amenities</div>
          {selectedFeatures.length > 0 && (
            <div className="addcar-selected-count">{selectedFeatures.length} feature{selectedFeatures.length !== 1 ? 's' : ''} selected</div>
          )}
          <div className="addcar-features-grid">
            {(form.type === 'car' ? CAR_FEATURES : BIKE_FEATURES).map(feat => (
              <div
                key={feat}
                className={`addcar-feature-chip ${selectedFeatures.includes(feat) ? 'selected' : ''}`}
                onClick={() => toggleFeature(feat)}
              >
                {selectedFeatures.includes(feat) ? '✓ ' : ''}{feat}
              </div>
            ))}
          </div>
          <div className="addcar-feature-custom">
            <input
              className="addcar-input"
              placeholder="Add a custom feature..."
              value={customFeature}
              onChange={e => setCustomFeature(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
            />
            <button type="button" className="addcar-feature-add-btn" onClick={addCustomFeature}>+ Add</button>
          </div>
          {selectedFeatures.filter(f => ![...CAR_FEATURES, ...BIKE_FEATURES].includes(f)).length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Custom Features</div>
              <div className="addcar-features-grid">
                {selectedFeatures.filter(f => ![...CAR_FEATURES, ...BIKE_FEATURES].includes(f)).map(feat => (
                  <div
                    key={feat}
                    className="addcar-feature-chip selected"
                    onClick={() => toggleFeature(feat)}
                  >
                    ✓ {feat} ✕
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ marginBottom: '20px' }} />

          {/* Images */}
          <div className="addcar-section">Vehicle Images *</div>
          <div className="addcar-image-upload" style={{ borderColor: errors.images ? 'rgba(239,68,68,0.5)' : '' }}>
            <input type="file" accept="image/*" multiple onChange={handleImage} title="Upload Multiple Images" />
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>Click to upload multiple vehicle images</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', opacity: 0.6 }}>JPG, PNG up to 5MB (Select multiple files at once or add more)</div>
          </div>
          
          {previews.length > 0 && (
            <div className="addcar-previews-grid">
              {previews.map((src, idx) => (
                <div key={idx} className="addcar-preview-item">
                  <img src={src} alt={`Preview ${idx + 1}`} className="addcar-preview-img" />
                  <button className="addcar-preview-remove" onClick={() => removeImage(idx)}>✕</button>
                </div>
              ))}
            </div>
          )}
          {errors.images && <span style={{ fontSize: '11px', color: '#ef4444', display: 'block', marginBottom: '16px' }}>{errors.images}</span>}

          {/* Availability */}
          <div className="addcar-section">Availability</div>
          <div className="addcar-toggle" onClick={() => set('isAvailable', !form.isAvailable)} style={{ cursor: 'pointer', marginBottom: '28px' }}>
            <div className={`addcar-toggle-track ${form.isAvailable ? 'on' : ''}`}>
              <div className="addcar-toggle-thumb" />
            </div>
            <div>
              <div className="addcar-toggle-label">{form.isAvailable ? 'Available for Booking' : 'Currently Unavailable'}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Toggle to change availability status</div>
            </div>
          </div>

          <button className="addcar-submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Uploading & Saving...' : `Add ${form.type === 'bike' ? 'Bike' : 'Car'} to Fleet`}
          </button>
        </div>
      ) : (
        <div className="addcar-success">
          <div className="addcar-success__icon">{form.type === 'bike' ? '🏍' : '🚗'}</div>
          <div className="addcar-success__title">Vehicle Added!</div>
          <p className="addcar-success__sub">
            <strong style={{ color: 'var(--text)' }}>{form.brand} {form.model} ({form.year})</strong> has been listed in your fleet
            {form.type === 'car' ? ` at ₹${parseInt(form.pricePerDay).toLocaleString()} / day` : ' with hourly slots'}.
          </p>
          <div className="addcar-success__btns">
            <button className="addcar-submit" onClick={handleReset}>Add Another</button>
          </div>
        </div>
      )}
    </>
  )
}

export default AddCar