import { useEffect, useRef } from 'react'

const reviews = [
  { rating: 5, text: 'Absolutely fantastic experience! The car was spotless and delivered right to my door. Booking took less than 2 minutes. Will definitely use Journey Rentals again!' },
  { rating: 5, text: 'Best car rental service I have used. No hidden charges, professional staff, and the car was in perfect condition. Highly recommended for anyone in Solapur!' },
  { rating: 5, text: 'Rented the Ertiga for a family trip. 7 seater was super comfortable and well maintained. The pickup and drop service is a game changer. 10/10!' },
  { rating: 5, text: 'Super smooth booking process and zero paperwork. The Swift was brand new and performed flawlessly for 3 days. Amazing value for money.' },
  { rating: 5, text: 'Used Journey Rentals during my business trip to Solapur. Prompt delivery, clean car, and very cooperative owner. A truly professional service!' },
]

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

const ReviewCard = ({ review }) => (
  <div className="review-card">
    <div style={{ display: 'flex', gap: '3px', color: 'var(--accent)', marginBottom: '14px' }}>
      {[...Array(review.rating)].map((_, i) => <StarIcon key={i} />)}
    </div>
    <p className="review-card__text">"{review.text}"</p>
    <div style={{
      marginTop: 'auto', paddingTop: '14px',
      borderTop: '1px solid var(--border)',
      display: 'flex', justifyContent: 'flex-end'
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--green)',
        background: 'rgba(34,197,94,0.08)',
        padding: '3px 10px',
        border: '1px solid rgba(34,197,94,0.2)',
      }}>
        ✓ Verified
      </div>
    </div>
  </div>
)

const ReviewsSection = () => {
  const sectionRef = useRef(null)
  const looped = [...reviews, ...reviews, ...reviews, ...reviews]

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
    <section className="reviews" id="reviews" ref={sectionRef}>
      <div className="container">
        <div className="reviews__header">
          <p className="section-label reveal" style={{ justifyContent: 'center' }}>Customer Reviews</p>
          <h2 className="section-title reveal reveal-delay-1">
            Loved by <em>thousands</em>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '15px' }} className="reveal reveal-delay-2">
            Real reviews from real customers across Solapur &amp; beyond
          </p>
        </div>
      </div>

      <div className="marquee">
        <div className="marquee__track">
          {looped.map((r, i) => <ReviewCard key={i} review={r} />)}
        </div>
      </div>
    </section>
  )
}

export default ReviewsSection