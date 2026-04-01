import { Link } from 'react-router-dom'

const Hero = () => {
  const stats = [
    { value: '50+', label: 'Cars & Bikes Available' },
    { value: '1K+', label: 'Happy Customers' },
    { value: '4.9★', label: 'Avg Rating' },
  ]

  return (
    <section className="hero" id="home">
      {/* Decorative ghost text */}
      <div className="hero__bg-ghost" aria-hidden="true">DRIVE</div>
      {/* Vertical line */}
      <div className="hero__vline" aria-hidden="true" />

      <div className="container">
        <div className="hero__content">

          <p className="hero__eyebrow">Journey Rentals · Solapur</p>

          <h1 className="hero__title">
            Drive The
            <em>Moment.</em>
            Own It.
          </h1>

          <p className="hero__subtitle">
            Journey Rentals offers the finest self-drive experience in Solapur.
            Instant booking, zero hassle, and a Ride you'll love.
          </p>

          <div className="hero__actions">
            <Link to="/cars" className="btn btn--yellow">
              <span className="btn__label">
                <span className="btn__main">Explore </span>
                <span className="btn__alt">See All Rides →</span>
              </span>
            </Link>
            <a href="#reviews" className="btn btn--outline">
              <span className="btn__label">
                <span className="btn__main">Read Reviews</span>
                <span className="btn__alt">See What They Say</span>
              </span>
            </a>
          </div>

          <div className="hero__stats">
            {stats.map(stat => (
              <div key={stat.label} className="hero__stat">
                <div className="hero__stat-value">{stat.value}</div>
                <div className="hero__stat-label">{stat.label}</div>
              </div>
            ))}
            </div>
          </div>
        </div>
    </section>
  )
}

export default Hero