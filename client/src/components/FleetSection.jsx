import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api.js'

const UsersIcon = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>)
const FuelIcon  = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 22V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M14 6h3l3 3v10a1 1 0 0 1-1 1h-2"/><line x1="3" y1="22" x2="14" y2="22"/></svg>)
const GearIcon  = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>)

// Level config — all offsets are from center (left: 50%)
// translateX already accounts for card own width via -50%
const LEVELS = {
  '-2': { x: -500, scale: 0.60, opacity: 0.38, z: 1, mt: 60 },
  '-1': { x: -280, scale: 0.78, opacity: 0.70, z: 2, mt: 28 },
   '0': { x:    0, scale: 1.00, opacity: 1.00, z: 5, mt:  0 },
   '1': { x:  280, scale: 0.78, opacity: 0.70, z: 2, mt: 28 },
   '2': { x:  500, scale: 0.60, opacity: 0.38, z: 1, mt: 60 },
}
const THRESHOLD = 52

const FleetSection = () => {
  const [cars, setCars]             = useState([])
  const [sectionHeading, setHeading] = useState('Our Fleet')
  const [sectionSub, setSub]        = useState('Best Self-Drive Rentals')
  const [active, setActive]         = useState(0)
  const [contentKey, setContentKey] = useState(0)
  const [dragPx, setDragPx]         = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const activeRef    = useRef(0)
  const autoRef      = useRef(null)
  const stageRef     = useRef(null)
  const dragStartX   = useRef(null)
  const dragStartY   = useRef(null)
  const axisLock     = useRef(null)
  const liveDrag     = useRef(0)
  const didDrag      = useRef(false)
  const mouseDown    = useRef(false)

  // Fetch real vehicle catalog data — single source of truth for both fleet and catalog
  useEffect(() => {
    const loadFleet = async () => {
      try {
        // Fetch from the real Vehicle catalog — same data the /cars page and owner dashboard use
        const data = await api.vehicles.getAll('car')
        const vehicles = (data.vehicles || []).map((v, i) => ({
          id: v._id,
          title: `${v.brand} ${v.model}`,
          category: v.category || '',
          seats: String(v.sittingCapacity || ''),
          fuel: v.fuelType || '',
          trans: v.transmission || '',
          price: v.pricePerDay || 0,
          img: v.images?.[0] || v.image || '',
          isFeatured: false,
        }))
        if (vehicles.length > 0) setCars(vehicles)
      } catch {
        // Silently fail — keep empty state
      }
    }
    loadFleet()
  }, [])

  // ── Auto-play ──
  const startAuto = () => {
    clearInterval(autoRef.current)
    if (cars.length > 1) {
      autoRef.current = setInterval(() => go(1), 3200)
    }
  }

  useEffect(() => {
    if (cars.length > 0) startAuto()
    return () => clearInterval(autoRef.current)
  }, [cars])

  // ── Navigate ──
  const go = (dir) => {
    if (cars.length === 0) return
    const next = (activeRef.current + dir + cars.length) % cars.length
    activeRef.current = next
    setActive(next)
    setContentKey(k => k + 1)
    setDragPx(0)
    liveDrag.current = 0
  }

  // ── Compute inline style for each card based on its level + live drag ──
  const cardStyle = (level, dragOffset) => {
    const cfg = LEVELS[String(level)]
    if (!cfg) return { display: 'none' }
    const dragFactor = level === 0 ? 1 : 0.65
    const tx = cfg.x + dragOffset * dragFactor
    return {
      position:  'absolute',
      left:      '50%',
      top:       '50%',
      transform: `translateX(calc(-50% + ${tx}px)) translateY(calc(-50% + ${cfg.mt}px)) scale(${cfg.scale})`,
      opacity:   cfg.opacity,
      zIndex:    cfg.z,
      transition: isDragging
        ? 'none'
        : 'transform 0.55s cubic-bezier(0.34,1.15,0.64,1), opacity 0.45s ease',
    }
  }

  // Build 5 visible items around active
  const getItems = () => {
    if (cars.length === 0) return []
    const items = []
    for (let offset = -2; offset <= 2; offset++) {
      const idx = (active + offset + cars.length) % cars.length
      items.push({ car: cars[idx], level: offset, idx })
    }
    return items
  }

  // ── Mouse drag ──
  const onMouseDown = e => {
    if (e.button !== 0) return
    dragStartX.current = e.clientX
    mouseDown.current  = true
    didDrag.current    = false
    liveDrag.current   = 0
    clearInterval(autoRef.current)
    setIsDragging(true)
  }

  useEffect(() => {
    const onMove = e => {
      if (!mouseDown.current) return
      const dx = e.clientX - dragStartX.current
      if (Math.abs(dx) > 5) didDrag.current = true
      const clamped = Math.sign(dx) * Math.min(Math.abs(dx), 300)
      liveDrag.current = clamped
      setDragPx(clamped)
    }
    const onUp = e => {
      if (!mouseDown.current) return
      mouseDown.current = false
      setIsDragging(false)
      const diff = dragStartX.current - e.clientX
      if (Math.abs(diff) >= THRESHOLD) {
        go(diff > 0 ? 1 : -1)
      } else {
        setDragPx(0)
        liveDrag.current = 0
      }
      startAuto()
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [cars])

  // ── Touch — non-passive ──
  useEffect(() => {
    const el = stageRef.current
    if (!el) return

    const onStart = e => {
      dragStartX.current = e.touches[0].clientX
      dragStartY.current = e.touches[0].clientY
      axisLock.current   = null
      didDrag.current    = false
      liveDrag.current   = 0
      clearInterval(autoRef.current)
    }

    const onMove = e => {
      if (dragStartX.current === null) return
      const dx = e.touches[0].clientX - dragStartX.current
      const dy = e.touches[0].clientY - dragStartY.current
      if (!axisLock.current && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        axisLock.current = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v'
      }
      if (axisLock.current !== 'h') return
      e.preventDefault()
      if (Math.abs(dx) > 5) didDrag.current = true
      const clamped = Math.sign(dx) * Math.min(Math.abs(dx), 300)
      liveDrag.current = clamped
      setIsDragging(true)
      setDragPx(clamped)
    }

    const onEnd = e => {
      if (dragStartX.current === null) return
      const diff = dragStartX.current - e.changedTouches[0].clientX
      dragStartX.current = null
      axisLock.current   = null
      setIsDragging(false)
      if (Math.abs(diff) >= THRESHOLD) {
        go(diff > 0 ? 1 : -1)
      } else {
        setDragPx(0)
        liveDrag.current = 0
      }
      startAuto()
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove',  onMove,  { passive: false })
    el.addEventListener('touchend',   onEnd,   { passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove',  onMove)
      el.removeEventListener('touchend',   onEnd)
    }
  }, [cars])

  // Parse heading into lines for display
  const headingParts = sectionSub.split(/\s+/)
  const subLine1 = headingParts.slice(0, -1).join(' ')
  const subLine2 = headingParts[headingParts.length - 1] || ''

  if (cars.length === 0) return null

  return (
    <section className="fleet" id="fleet">
      <style>{`
        /* ── Stage ── */
        .cr-stage {
          position: relative;
          height: 480px;
          width: 100%;
          overflow: hidden;
          user-select: none;
          -webkit-user-select: none;
          cursor: grab;
        }
        .cr-stage.grabbing { cursor: grabbing; }

        /* ── Card shell ── */
        .cr-card {
          width: 290px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          overflow: hidden;
          pointer-events: auto;
        }
        .cr-card.is-center {
          border-color: rgba(255,210,0,0.45);
          box-shadow: 0 0 0 1px rgba(255,210,0,0.12),
                      0 32px 72px rgba(0,0,0,0.65);
        }
        .cr-card.is-side { pointer-events: none; cursor: pointer; }
        .cr-card.is-side:hover { pointer-events: auto; }

        /* ── Image ── */
        .cr-img-wrap { position: relative; overflow: hidden; }
        .cr-img {
          width: 100%; height: 180px; object-fit: cover; display: block;
          transition: transform 0.55s ease;
        }
        .cr-card.is-center:hover .cr-img { transform: scale(1.05); }
        .cr-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%);
        }
        .cr-price {
          position: absolute; top: 10px; right: 10px;
          background: var(--accent); color: #0c0c0c;
          font-family: var(--font-display); font-size: 14px;
          letter-spacing: 0.04em; padding: 3px 10px;
          transition: transform 0.3s;
        }
        .cr-card.is-center:hover .cr-price { transform: translateY(-2px); }
        .cr-cat {
          position: absolute; bottom: 10px; left: 10px;
          font-size: 9px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(255,255,255,0.85);
          background: rgba(0,0,0,0.4); padding: 3px 8px;
        }
        .cr-featured-badge {
          position: absolute; top: 10px; left: 10px;
          font-size: 9px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: #0c0c0c;
          background: var(--accent); padding: 3px 8px;
          display: flex; align-items: center; gap: 4px;
        }

        /* ── Progress bar ── */
        .cr-progress { height: 2px; background: var(--border); overflow: hidden; }
        .cr-progress-fill {
          height: 100%; background: var(--accent); width: 0%;
          animation: crProg 3.2s linear forwards;
        }
        @keyframes crProg { to { width: 100%; } }

        /* ── Body ── */
        .cr-body { padding: 14px 16px 16px; }
        .cr-body-anim {
          animation: crBodyIn 0.42s cubic-bezier(0.34,1.2,0.64,1) both;
        }
        @keyframes crBodyIn {
          from { opacity: 0; transform: translateY(9px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cr-name {
          font-family: var(--font-display); font-size: 26px;
          color: var(--text); letter-spacing: 0.02em; line-height: 1; margin-bottom: 9px;
        }
        .cr-specs { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
        .cr-spec {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; color: var(--text-muted); font-weight: 600;
        }
        .cr-spec svg { color: var(--accent); }
        .cr-btn {
          display: block; width: 100%; padding: 11px; text-align: center;
          background: var(--accent); color: #0c0c0c; font-weight: 800;
          font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
          text-decoration: none; box-sizing: border-box;
          clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
          transition: background 0.2s, letter-spacing 0.2s;
          animation: crBtnIn 0.4s 0.08s cubic-bezier(0.34,1.4,0.64,1) both;
        }
        @keyframes crBtnIn {
          from { opacity: 0; transform: translateY(7px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cr-btn:hover { background: #ffe44d; letter-spacing: 0.12em; }

        /* ── Arrows ── */
        .cr-arrow {
          position: absolute; top: 50%; z-index: 20;
          width: 42px; height: 42px; border-radius: 50%;
          background: var(--bg-card); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-muted);
          transition: all 0.22s cubic-bezier(0.34,1.4,0.64,1);
          transform: translateY(-50%);
        }
        .cr-arrow:hover {
          border-color: var(--accent); color: var(--accent);
          transform: translateY(-50%) scale(1.12);
        }
        .cr-arrow:active { transform: translateY(-50%) scale(0.9); }
        .cr-arrow--l { left: 16px; }
        .cr-arrow--r { right: 16px; }

        /* ── Dots ── */
        .cr-dots {
          display: flex; gap: 7px; justify-content: center;
          align-items: center; margin-top: 20px;
        }
        .cr-dot {
          height: 5px; width: 5px; border-radius: 3px;
          background: var(--border); cursor: pointer;
          transition: all 0.32s cubic-bezier(0.34,1.4,0.64,1);
        }
        .cr-dot.on { background: var(--accent); width: 24px; }
        .cr-dot:hover:not(.on) { background: rgba(255,210,0,0.4); }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .cr-stage { height: 420px; }
          .cr-card { width: 250px; }
          .cr-img { height: 155px; }
          .cr-arrow { display: none; }
        }
        @media (max-width: 480px) {
          .cr-stage { height: 380px; }
          .cr-card { width: 220px; }
          .cr-img { height: 138px; }
          .cr-name { font-size: 22px; }
        }
      `}</style>

      {/* Header */}
      <div className="container">
        <div className="fleet__top">
          <div>
            <p className="section-label">{sectionHeading}</p>
            <h2 className="section-title">{subLine1}<br /><em>{subLine2}</em></h2>
          </div>
          
        </div>
      </div>

      {/* Stage */}
      <div
        ref={stageRef}
        className={`cr-stage ${isDragging ? 'grabbing' : ''}`}
        onMouseDown={onMouseDown}
      >
        {getItems().map(({ car, level, idx }) => {
          const isCenter = level === 0
          return (
            <div
              key={car.id + '-' + level}
              style={cardStyle(level, dragPx)}
              className={`cr-card ${isCenter ? 'is-center' : 'is-side'}`}
              onClick={() => {
                if (didDrag.current) return
                if (!isCenter) { go(level < 0 ? -1 : 1); startAuto() }
              }}
            >
              {/* Image */}
              <div className="cr-img-wrap">
                <img src={car.img} alt={car.title} className="cr-img" draggable={false} loading="lazy" />
                <div className="cr-overlay" />
                {car.price > 0 && <div className="cr-price">₹{car.price.toLocaleString()} / Day</div>}
                {car.category && <div className="cr-cat">{car.category}</div>}
                {car.isFeatured && (
                  <div className="cr-featured-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    Featured
                  </div>
                )}
              </div>

              {/* Progress bar — only center */}
              {isCenter && (
                <div className="cr-progress">
                  <div className="cr-progress-fill" key={contentKey} />
                </div>
              )}

              {/* Body */}
              <div className="cr-body">
                <div key={isCenter ? contentKey : level} className={isCenter ? 'cr-body-anim' : ''}>
                  <div className="cr-name">{car.title}</div>
                  <div className="cr-specs">
                    {car.seats && <div className="cr-spec"><UsersIcon />{car.seats} Seats</div>}
                    {car.fuel && <div className="cr-spec"><FuelIcon />{car.fuel}</div>}
                    {car.trans && <div className="cr-spec"><GearIcon />{car.trans}</div>}
                  </div>
                  {isCenter && (
                    <Link
                      to={`/car-details/${car.id}`}
                      className="cr-btn"
                      onClick={e => didDrag.current && e.preventDefault()}
                    >
                      Reserve Now
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Arrows */}
        <button className="cr-arrow cr-arrow--l" onClick={() => { go(-1); startAuto() }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <button className="cr-arrow cr-arrow--r" onClick={() => { go(1); startAuto() }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9,18 15,12 9,6"/></svg>
        </button>
      </div>

      {/* Dots */}
      <div className="cr-dots">
        {cars.map((_, i) => (
          <div
            key={i}
            className={`cr-dot ${i === active ? 'on' : ''}`}
            onClick={() => { activeRef.current = i; setActive(i); setContentKey(k=>k+1); setDragPx(0); startAuto() }}
          />
        ))}
      </div>

      {/* CTA */}
      <div style={{ display:'flex', justifyContent:'center', marginTop:'32px' }}>
        <Link to="/cars" className="btn btn--yellow">
          <span className="btn__label">
            <span className="btn__main">View All Cars</span>
            <span className="btn__alt">See Full Fleet →</span>
          </span>
        </Link>
      </div>
    </section>
  )
}

export default FleetSection