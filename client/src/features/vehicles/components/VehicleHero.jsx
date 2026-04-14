import { useState, useEffect } from 'react'

const VehicleHero = ({ vehicle, heroImages, isBike, BIKE_SLOTS }) => {
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setImgIdx(i => (i + 1) % heroImages.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [heroImages.length])

  return (
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
            ? `₹${BIKE_SLOTS[0]?.price || 0} / 3hrs · ₹${BIKE_SLOTS[1]?.price || 0} / 6hrs · ₹${BIKE_SLOTS[2]?.price || 0} / 12hrs`
            : `₹${vehicle.pricePerDay?.toLocaleString()} / Day`}
        </div>
      </div>
    </div>
  )
}

export default VehicleHero
