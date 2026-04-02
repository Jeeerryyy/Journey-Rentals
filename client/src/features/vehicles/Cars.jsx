import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api.js'

const carCategories = ['All', 'Hatchback', 'Sedan', 'SUV', 'MPV', 'Crossover']
const bikeCategories = ['All', 'Scooter', 'Cruiser', 'Sports', 'Commuter']
const fuelTypes = ['All', 'Petrol', 'CNG', 'Diesel', 'Electric']
const transmissions = ['All', 'Manual', 'Automatic']

import { UsersIcon, FuelIcon, GearIcon, SearchIcon } from '../../components/Icons'

// Module-level cache — survives navigation, cleared only on page reload
let _vehicleCache = null

const SkeletonCard = () => (
  <article className="car-card skeleton-card">
    <div className="skeleton-img" />
    <div className="car-card__body" style={{ gap: '12px' }}>
      <div className="skeleton-line" style={{ width: '70%', height: '22px' }} />
      <div style={{ display: 'flex', gap: '10px' }}>
        <div className="skeleton-line" style={{ width: '60px', height: '14px' }} />
        <div className="skeleton-line" style={{ width: '60px', height: '14px' }} />
        <div className="skeleton-line" style={{ width: '60px', height: '14px' }} />
      </div>
      <div className="skeleton-line" style={{ width: '100%', height: '36px', marginTop: 'auto' }} />
    </div>
  </article>
)

const CarCard = ({ v, prefetchVehicle }) => {
  const [imgIdx, setImgIdx] = useState(0)
  const images = v.images && v.images.length > 0 ? v.images : (v.image ? [v.image] : [])
  const slots = v.bikeSlots || {}

  const nextImg = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setImgIdx((prev) => (prev + 1) % images.length)
  }

  const prevImg = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setImgIdx((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <article className="car-card" onMouseEnter={() => prefetchVehicle(v._id)}>
      <div className="car-card__img-wrap">
        {images.length > 0 && (
          <img
            src={images[imgIdx]}
            alt={`${v.brand} ${v.model}`}
            className="car-card__image"
            loading="lazy"
            decoding="async"
            width="600"
            height="220"
          />
        )}

        {images.length > 1 && (
          <>
            <div className="car-card__carousel-controls">
              <button className="carousel-btn" onClick={prevImg} aria-label="Previous image">‹</button>
              <button className="carousel-btn" onClick={nextImg} aria-label="Next image">›</button>
            </div>
            <div className="carousel-dots">
              {images.slice(0, 6).map((_, i) => (
                <div key={i} className={`carousel-dot ${i === imgIdx ? 'active' : ''}`} />
              ))}
              {images.length > 6 && <div className="carousel-dot-more">+{images.length - 6}</div>}
            </div>
          </>
        )}

        <div className="car-card__overlay" />
        <div className="car-card__price-badge">
          {v.type === 'bike' ? `₹${slots.price3hr || 150}+ / 3hrs` : `₹${v.pricePerDay?.toLocaleString()} / Day`}
        </div>
        <div className="car-card__category">{v.type === 'bike' ? '🏍 ' : '🚗 '}{v.category}</div>
      </div>
      <div className="car-card__body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="car-card__name">{v.brand} {v.model}</div>
          <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 8px', flexShrink: 0, marginTop: '4px' }}
            className={v.isAvailable ? 'badge-available' : 'badge-unavailable'}>
            {v.isAvailable ? 'Available' : 'Booked'}
          </div>
        </div>
        <div className="car-card__specs">
          <div className="car-card__spec"><UsersIcon /> {v.sittingCapacity} Seats</div>
          <div className="car-card__spec"><FuelIcon /> {v.fuelType}</div>
          <div className="car-card__spec"><GearIcon /> {v.transmission}</div>
        </div>
        {v.type === 'bike' && (
          <div className="bike-prices">
            <div className="bike-price-chip"><div className="bike-price-chip__time">3 hrs</div><div className="bike-price-chip__amt">₹{slots.price3hr || 150}</div></div>
            <div className="bike-price-chip"><div className="bike-price-chip__time">6 hrs</div><div className="bike-price-chip__amt">₹{slots.price6hr || 200}</div></div>
            <div className="bike-price-chip"><div className="bike-price-chip__time">12 hrs</div><div className="bike-price-chip__amt">₹{slots.price12hr || 400}</div></div>
          </div>
        )}
        <Link to={`/car-details/${v._id}`} className="car-card__btn"
          style={!v.isAvailable ? { background: 'var(--border)', color: 'var(--text-muted)', cursor: 'not-allowed', clipPath: 'none' } : {}}
          onClick={e => !v.isAvailable && e.preventDefault()}>
          {v.isAvailable ? 'Reserve Now' : 'Unavailable'}
        </Link>
      </div>
    </article>
  )
}

const Cars = () => {
  const [allVehicles, setAllVehicles] = useState(_vehicleCache || [])
  const [loading, setLoading] = useState(!_vehicleCache)
  const [fetchError, setFetchError] = useState(null)
  const [vehicleType, setVehicleType] = useState('all')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [fuel, setFuel] = useState('All')
  const [transmission, setTransmission] = useState('All')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [sortBy, setSortBy] = useState('default')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const data = await api.vehicles.getAll()
        if (!cancelled) {
          _vehicleCache = data.vehicles
          setAllVehicles(data.vehicles)
        }
      } catch (err) {
        if (!cancelled && !_vehicleCache) setFetchError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()

    // Poll every 60 seconds — only poll when the tab is visible
    let syncInterval = null
    const startPolling = () => {
      syncInterval = setInterval(run, 60000)
    }
    const stopPolling = () => {
      if (syncInterval) clearInterval(syncInterval)
    }

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        run() // Fetch fresh data when tab becomes visible
        startPolling()
      }
    }

    startPolling()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelled = true
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  const switchType = useCallback((t) => { setVehicleType(t); setCategory('All') }, [])
  const categories = vehicleType === 'bike' ? bikeCategories : carCategories

  const filtered = useMemo(() => {
    let list = [...allVehicles]
    if (vehicleType !== 'all') list = list.filter(v => v.type === vehicleType)
    if (search) list = list.filter(v => `${v.brand} ${v.model}`.toLowerCase().includes(search.toLowerCase()))
    if (category !== 'All') list = list.filter(v => v.category === category)
    if (fuel !== 'All') list = list.filter(v => v.fuelType === fuel)
    if (transmission !== 'All') list = list.filter(v => v.transmission === transmission)
    if (availableOnly) list = list.filter(v => v.isAvailable)
    if (sortBy === 'price-asc') list.sort((a, b) => (a.pricePerDay || a.bikeSlots?.price3hr || 0) - (b.pricePerDay || b.bikeSlots?.price3hr || 0))
    if (sortBy === 'price-desc') list.sort((a, b) => (b.pricePerDay || b.bikeSlots?.price3hr || 0) - (a.pricePerDay || a.bikeSlots?.price3hr || 0))
    return list
  }, [allVehicles, vehicleType, search, category, fuel, transmission, availableOnly, sortBy])

  const clearFilters = () => {
    setSearch(''); setCategory('All'); setFuel('All')
    setTransmission('All'); setAvailableOnly(false); setSortBy('default')
  }

  const hasFilters = search || category !== 'All' || fuel !== 'All' || transmission !== 'All' || availableOnly

  // Prefetch vehicle detail on hover (debounced — only one in-flight at a time)
  const prefetchedRef = useRef(new Set())
  const prefetchVehicle = useCallback((id) => {
    if (prefetchedRef.current.has(id)) return
    prefetchedRef.current.add(id)
    fetch(`/api/vehicles/${id}`).catch(() => { })
  }, [])

  return (
    <>
      <style>{`
        .cars-page { background: var(--bg); min-height: 100vh; padding-top: 100px; }
        .cars-hero { background: var(--bg-soft); border-bottom: 1px solid var(--border); padding: 48px 0 40px; position: relative; overflow: hidden; }
        .cars-hero__ghost { position: absolute; right: 4%; top: 50%; transform: translateY(-50%); font-family: var(--font-display); font-size: clamp(80px,14vw,180px); color: transparent; -webkit-text-stroke: 1px rgba(255,210,0,0.06); line-height: 1; pointer-events: none; user-select: none; }
        .cars-hero__inner { position: relative; z-index: 1; }
        .search-bar { display: flex; align-items: center; background: var(--bg-card); border: 1px solid var(--border); max-width: 520px; transition: border-color 0.2s; }
        .search-bar:focus-within { border-color: rgba(255,210,0,0.4); }
        .search-bar__icon { padding: 0 14px; color: var(--text-muted); display: flex; align-items: center; }
        .search-bar input { flex: 1; padding: 14px 0; background: none; border: none; outline: none; font-family: var(--font-body); font-size: 14px; color: var(--text); }
        .search-bar input::placeholder { color: var(--text-muted); }
        .vtype-tabs { display: flex; border: 1px solid var(--border); max-width: 320px; margin-bottom: 32px; }
        .vtype-tab { flex: 1; padding: 11px; text-align: center; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; background: var(--bg-soft); color: var(--text-muted); border: none; transition: all 0.15s; }
        .vtype-tab.active { background: var(--accent); color: #0c0c0c; }
        .vtype-tab:hover:not(.active) { color: var(--text); }
        .cars-layout { display: grid; grid-template-columns: 240px 1fr; gap: 32px; padding: 40px 48px; max-width: 1400px; margin: 0 auto; }
        @media (max-width: 900px) { .cars-layout { grid-template-columns: 1fr; padding: 24px; } }

        /* ── Uniform Grid ── */
        .cars-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }

        @keyframes shimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
        .skeleton-card { pointer-events: none; }
        .skeleton-img { height: 220px; flex-shrink: 0; background: linear-gradient(90deg, var(--bg-soft) 25%, rgba(255,255,255,0.05) 50%, var(--bg-soft) 75%); background-size: 600px 100%; animation: shimmer 1.4s infinite linear; }
        .skeleton-line { border-radius: 2px; background: linear-gradient(90deg, var(--bg-soft) 25%, rgba(255,255,255,0.05) 50%, var(--bg-soft) 75%); background-size: 600px 100%; animation: shimmer 1.4s infinite linear; }

        /* ── Fixed-size car cards ── */
        .car-card { background: var(--bg-card); border: 1px solid var(--border); overflow: hidden; transition: border-color 0.2s, transform 0.2s; display: flex; flex-direction: column; height: 460px; }
        .car-card:hover { border-color: rgba(255,210,0,0.25); transform: translateY(-3px); }
        .car-card__img-wrap { position: relative; height: 220px; overflow: hidden; background: var(--bg-soft); flex-shrink: 0; }
        .car-card__image { width: 100%; height: 100%; object-fit: cover; display: block; color: transparent; transition: opacity 0.3s ease, transform 0.5s ease; }
        .car-card:hover .car-card__image { transform: scale(1.04); }

        /* ── Carousel controls ── */
        .car-card__carousel-controls { position: absolute; inset: 0; display: flex; justify-content: space-between; align-items: center; padding: 0 8px; opacity: 0; transition: opacity 0.2s; z-index: 2; pointer-events: none; }
        .car-card:hover .car-card__carousel-controls { opacity: 1; pointer-events: auto; }
        .carousel-btn { background: rgba(0,0,0,0.55); color: #fff; border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; font-size: 18px; line-height: 1; }
        .carousel-btn:hover { background: var(--accent); color: #000; }
        .carousel-dots { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); display: flex; gap: 4px; z-index: 2; pointer-events: none; align-items: center; }
        .carousel-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.4); transition: background 0.2s, transform 0.2s; }
        .carousel-dot.active { background: #fff; transform: scale(1.3); }
        .carousel-dot-more { font-size: 8px; color: rgba(255,255,255,0.6); font-weight: 700; }

        .car-card__overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%); pointer-events: none; }
        .car-card__price-badge { position: absolute; top: 10px; right: 10px; background: var(--accent); color: #0c0c0c; font-family: var(--font-display); font-size: 14px; letter-spacing: 0.04em; padding: 3px 10px; z-index: 3; }
        .car-card__category { position: absolute; bottom: 10px; left: 10px; font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.7); background: rgba(0,0,0,0.4); padding: 3px 8px; z-index: 3; }
        .car-card__body { padding: 16px; display: flex; flex-direction: column; gap: 10px; flex: 1; overflow: hidden; }
        .car-card__name { font-family: var(--font-display); font-size: 22px; color: var(--text); line-height: 1; letter-spacing: 0.02em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .car-card__specs { display: flex; gap: 12px; flex-wrap: wrap; }
        .car-card__spec { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--text-muted); font-weight: 600; }
        .car-card__spec svg { color: var(--accent); }
        .car-card__btn { display: block; padding: 10px; text-align: center; background: var(--accent); color: #0c0c0c; font-weight: 800; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px)); transition: background 0.2s; margin-top: auto; }
        .car-card__btn:hover { background: #ffe44d; }
        .badge-available { color: #22c55e; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); }
        .badge-unavailable { color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
        .bike-prices { display: flex; gap: 6px; }
        .bike-price-chip { flex: 1; padding: 5px 4px; text-align: center; background: var(--bg-soft); border: 1px solid var(--border); }
        .bike-price-chip__time { font-size: 9px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); }
        .bike-price-chip__amt { font-size: 13px; font-weight: 800; color: var(--accent); margin-top: 2px; }
        .cars-empty { grid-column: 1/-1; text-align: center; padding: 80px 24px; color: var(--text-muted); }
        .cars-empty__icon { font-size: 48px; margin-bottom: 16px; }
        .cars-empty__title { font-family: var(--font-display); font-size: 40px; color: var(--text); margin-bottom: 8px; }
        .mobile-filter-btn { display: none; align-items: center; gap: 8px; padding: 10px 18px; background: var(--bg-card); border: 1px solid var(--border); color: var(--text-muted); font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
        @media (max-width: 900px) { .mobile-filter-btn { display: flex; } }
        @media (max-width: 480px) { .cars-layout { padding: 16px; } .cars-grid { grid-template-columns: 1fr; } .vtype-tabs { max-width: 100%; } }
      `}</style>

      <div className="cars-page">
        <div className="cars-hero">
          <div className="cars-hero__ghost">FLEET</div>
          <div className="container cars-hero__inner">
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ display: 'inline-block', width: '28px', height: '1px', background: 'var(--accent)' }} />
              Journey Rentals · Solapur
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px,6vw,80px)', lineHeight: 0.9, color: 'var(--text)', marginBottom: '24px', letterSpacing: '0.02em' }}>
              OUR <span style={{ color: 'var(--accent)' }}>FLEET</span>
            </h1>
            <div className="search-bar">
              <div className="search-bar__icon"><SearchIcon /></div>
              <input placeholder="Search cars or bikes..." value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button onClick={() => setSearch('')} style={{ padding: '0 14px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}>×</button>}
            </div>
          </div>
        </div>

        <div className="cars-layout">
          <div style={{ display: mobileFiltersOpen ? 'block' : undefined }}>
            {/* Filter Sidebar — rendered inline to avoid re-mounting */}
            <aside style={styles.sidebar}>
              <div style={styles.sidebarHeader}>
                <span style={styles.sidebarTitle}>Filters</span>
                {hasFilters && <button onClick={clearFilters} style={styles.clearBtn}>Clear all</button>}
              </div>
              <div style={styles.filterGroup}>
                <p style={styles.filterLabel}>Vehicle Type</p>
                <div style={styles.pillGroup}>
                  {[['all', 'All'], ['car', '🚗 Cars'], ['bike', '🏍 Bikes']].map(([val, label]) => (
                    <button key={val} onClick={() => switchType(val)}
                      style={{ ...styles.pill, ...(vehicleType === val ? styles.pillActive : {}) }}>{label}</button>
                  ))}
                </div>
              </div>
              <div style={styles.filterGroup}>
                <p style={styles.filterLabel}>Category</p>
                <div style={styles.pillGroup}>
                  {categories.map(c => (
                    <button key={c} onClick={() => setCategory(c)}
                      style={{ ...styles.pill, ...(category === c ? styles.pillActive : {}) }}>{c}</button>
                  ))}
                </div>
              </div>
              <div style={styles.filterGroup}>
                <p style={styles.filterLabel}>Fuel Type</p>
                <div style={styles.pillGroup}>
                  {fuelTypes.map(f => (
                    <button key={f} onClick={() => setFuel(f)}
                      style={{ ...styles.pill, ...(fuel === f ? styles.pillActive : {}) }}>{f}</button>
                  ))}
                </div>
              </div>
              <div style={styles.filterGroup}>
                <p style={styles.filterLabel}>Transmission</p>
                <div style={styles.pillGroup}>
                  {transmissions.map(t => (
                    <button key={t} onClick={() => setTransmission(t)}
                      style={{ ...styles.pill, ...(transmission === t ? styles.pillActive : {}) }}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <label style={styles.checkRow}>
                  <div onClick={() => setAvailableOnly(v => !v)}
                    style={{ ...styles.checkbox, ...(availableOnly ? styles.checkboxActive : {}) }}>
                    {availableOnly && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#0c0c0c" strokeWidth="2.5"><polyline points="2,6 5,9 10,3" /></svg>}
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer' }}
                    onClick={() => setAvailableOnly(v => !v)}>Available only</span>
                </label>
              </div>
            </aside>
          </div>

          <div>
            <button className="mobile-filter-btn" onClick={() => setMobileFiltersOpen(v => !v)} style={{ marginBottom: '16px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
              {mobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
            </button>

            <div className="vtype-tabs">
              {[['all', 'All Vehicles'], ['car', '🚗 Cars'], ['bike', '🏍 Bikes']].map(([val, label]) => (
                <button key={val} className={`vtype-tab ${vehicleType === val ? 'active' : ''}`} onClick={() => switchType(val)}>{label}</button>
              ))}
            </div>

            <div style={styles.sortBar}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {loading
                  ? 'Loading fleet...'
                  : <><span style={{ color: 'var(--accent)', fontWeight: 700 }}>{filtered.length}</span> vehicle{filtered.length !== 1 ? 's' : ''} found</>
                }
              </span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={styles.sortSelect}>
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            <div className="cars-grid">
              {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

              {!loading && fetchError && (
                <div className="cars-empty">
                  <div className="cars-empty__icon">⚠️</div>
                  <div className="cars-empty__title">Failed to load</div>
                  <p style={{ fontSize: '14px', color: '#ef4444', marginBottom: '16px' }}>{fetchError}</p>
                  <button onClick={() => { _vehicleCache = null; window.location.reload() }} className="btn btn--yellow" style={{ fontSize: '12px' }}>Retry</button>
                </div>
              )}

              {!loading && !fetchError && filtered.length === 0 && (
                <div className="cars-empty">
                  <div className="cars-empty__icon">🚗</div>
                  <div className="cars-empty__title">No vehicles found</div>
                  <p style={{ fontSize: '14px', marginBottom: '24px' }}>Try adjusting your filters</p>
                  <button onClick={clearFilters} className="btn btn--yellow" style={{ fontSize: '12px', padding: '12px 24px' }}>Clear Filters</button>
                </div>
              )}

              {!loading && !fetchError && filtered.map(v => (
                <CarCard key={v._id} v={v} prefetchVehicle={prefetchVehicle} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const styles = {
  sidebar: { background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px', position: 'sticky', top: '100px', alignSelf: 'start' },
  sidebarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' },
  sidebarTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', letterSpacing: '0.04em', color: 'var(--text)' },
  clearBtn: { fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' },
  filterGroup: { marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' },
  filterLabel: { fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' },
  pillGroup: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  pill: { padding: '5px 12px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s' },
  pillActive: { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#0c0c0c' },
  checkRow: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
  checkbox: { width: '18px', height: '18px', border: '1px solid var(--border)', background: 'var(--bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s, border-color 0.15s' },
  checkboxActive: { background: 'var(--accent)', borderColor: 'var(--accent)' },
  sortBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' },
  sortSelect: { padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: "'Syne', sans-serif", fontSize: '12px', fontWeight: 700, cursor: 'pointer', outline: 'none' },
}

export default Cars