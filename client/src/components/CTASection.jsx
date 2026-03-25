import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'

const CTASection = () => {
  const sectionRef = useRef(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('cta-visible')
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style>{`
        .cta-section {
          position: relative;
          background: #0c0c0c;
          overflow: hidden;
          padding: 120px 0 140px;
          font-family: 'Syne', sans-serif;
        }

        .cta-lines {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .cta-lines::before,
        .cta-lines::after {
          content: '';
          position: absolute;
          left: -10%;
          width: 120%;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255,210,0,0.12) 30%, rgba(255,210,0,0.25) 60%, transparent 100%);
        }
        .cta-lines::before { top: 28%; }
        .cta-lines::after  { top: 72%; }

        .cta-slash {
          position: absolute;
          right: -60px;
          top: -40px;
          width: 520px;
          height: 120%;
          background: #FFD200;
          transform: skewX(-8deg);
          transform-origin: top right;
          opacity: 0.07;
          pointer-events: none;
        }

        .cta-ghost {
          position: absolute;
          right: 6%;
          top: 50%;
          transform: translateY(-50%);
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(180px, 22vw, 320px);
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,210,0,0.08);
          line-height: 1;
          user-select: none;
          pointer-events: none;
          letter-spacing: -0.02em;
        }

        .cta-container {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 48px;
          align-items: center;
        }

        @media (max-width: 900px) {
          .cta-container { grid-template-columns: 1fr; gap: 40px; }
          .cta-ghost { opacity: 0.04; right: -2%; }
        }

        .cta-label {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #FFD200;
          margin-bottom: 24px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .cta-label::before {
          content: '';
          display: block;
          width: 28px;
          height: 1px;
          background: #FFD200;
        }

        .cta-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(68px, 9vw, 130px);
          line-height: 0.92;
          letter-spacing: -0.01em;
          color: #fff;
          margin: 0 0 28px;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s;
        }
        .cta-title em {
          font-style: normal;
          color: #FFD200;
          display: block;
        }

        .cta-desc {
          font-size: 16px;
          font-weight: 400;
          line-height: 1.65;
          color: rgba(255,255,255,0.5);
          max-width: 440px;
          margin: 0;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s;
        }

        .cta-actions {
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-width: 200px;
          opacity: 0;
          transform: translateX(30px);
          transition: opacity 0.6s ease 0.25s, transform 0.6s ease 0.25s;
        }

        @media (max-width: 900px) {
          .cta-actions {
            flex-direction: row;
            transform: translateY(20px);
          }
        }

        .btn-primary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 24px;
          background: #FFD200;
          color: #0c0c0c;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
        }
        .btn-primary:hover {
          background: #ffe44d;
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(255,210,0,0.3);
        }
        .btn-primary:active { transform: translateY(0); }
        .btn-arrow {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.12);
          flex-shrink: 0;
        }
        .btn-arrow svg {
          width: 14px;
          height: 14px;
          transition: transform 0.2s;
        }
        .btn-primary:hover .btn-arrow svg {
          transform: translate(3px, -3px);
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 18px 24px;
          background: transparent;
          color: rgba(255,255,255,0.7);
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .btn-secondary:hover {
          border-color: rgba(255,255,255,0.35);
          color: #fff;
          background: rgba(255,255,255,0.04);
        }

        .phone-icon {
          width: 14px;
          height: 14px;
          opacity: 0.6;
        }

        .cta-visible .cta-label,
        .cta-visible .cta-title,
        .cta-visible .cta-desc,
        .cta-visible .cta-actions {
          opacity: 1;
          transform: none;
        }

        .cta-rule {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent 0%, #FFD200 40%, #FFD200 60%, transparent 100%);
          opacity: 0.6;
        }
      `}</style>

      <section className="cta-section" id="cta" ref={sectionRef}>
        <div className="cta-lines" aria-hidden="true" />
        <div className="cta-slash" aria-hidden="true" />
        <div className="cta-ghost" aria-hidden="true">01</div>

        <div className="cta-container">
          <div>
            <p className="cta-label">Journey Rentals</p>
            <h2 className="cta-title">
              Ready to hit
              <em>the road.</em>
            </h2>
            <p className="cta-desc">
              Book your perfect car today. No hidden fees, simple paperwork — just pure driving freedom.
            </p>
          </div>

          <div className="cta-actions">
            <Link to="/cars" className="btn-primary">
              Book a Ride
              <span className="btn-arrow">
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="1" y1="13" x2="13" y2="1" />
                  <polyline points="5,1 13,1 13,9" />
                </svg>
              </span>
            </Link>
            <a href="tel:+919860333616" className="btn-secondary">
              <svg className="phone-icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2h3l1.5 3.5-1.5 1a8 8 0 003.5 3.5l1-1.5L13 10v3a1 1 0 01-1 1C5.4 13 1 8.6 1 3a1 1 0 011-1z"/>
              </svg>
              Contact Us
            </a>
          </div>
        </div>

        <div className="cta-rule" aria-hidden="true" />
      </section>
    </>
  )
}

export default CTASection