import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const features = [
  { icon: '⚡', title: 'Instant Booking',   desc: 'Reserve your Rides in under 2 minutes. with paperwork, no waiting.' },
  { icon: '🛡️', title: 'Fully Insured',     desc: 'Every vehicle is fully insured so you drive with complete peace of mind.' },
  { icon: '📍', title: 'Easy Pickup/Dropoff', desc: 'We deliver the Rides to your location and pick it up when you are done.' },
]

const AboutSection = () => {
  const sectionRef = useRef(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const targets = el.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    targets.forEach(t => observer.observe(t))
    return () => observer.disconnect()
  }, [])

  return (
    <section className="about" id="about" ref={sectionRef}>
      <div className="container">
        <div className="about__inner">

          {/* Left — text */}
          <div>
            <p className="section-label reveal">About Us</p>
            <h2 className="about__title reveal reveal-delay-1">
              Solapur's most
              <em>trusted rental</em>
            </h2>
            <p className="about__text reveal reveal-delay-2">
              Journey Rentals was built with one goal — to make renting a car or bike as simple and
              enjoyable as the drive itself. We offer a handpicked Rides of well-maintained
              cars & bikes for every occasion, from quick city trips to long weekend getaways.
            </p>

            <div className="about__features">
              {features.map((f, i) => (
                <div key={f.title} className={`about__feature reveal reveal-delay-${i + 1}`}>
                  <div className="about__feature-icon">{f.icon}</div>
                  <div>
                    <div className="about__feature-title">{f.title}</div>
                    <div className="about__feature-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="reveal reveal-delay-3">
              <Link to="/cars" className="btn btn--yellow">
                <span className="btn__label">
                  <span className="btn__main">Browse Rides </span>
                  <span className="btn__alt">See All Rides →</span>
                </span>
              </Link>
            </div>
          </div>

          {/* Right — image */}
          <div className="about__image-wrap reveal reveal-delay-2">
            <img
              src="https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80"
              alt="Car rental"
            />
            <div className="about__image-badge">
              <div className="about__image-badge-icon">🏆</div>
              <div>
                <div className="about__image-badge-text">#1 in Solapur</div>
                <div className="about__image-badge-sub">Rated by 1,000+ customers</div>
              </div> 
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default AboutSection