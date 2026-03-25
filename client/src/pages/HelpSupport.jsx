const PhoneIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

const MessageIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

const InstagramIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)

const MapPinIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const CONTACT_WHATSAPP = 'https://wa.me/910000000000'
const CONTACT_PHONE = 'tel:+910000000000'
const CONTACT_INSTAGRAM = 'https://instagram.com/'
const CONTACT_MAPS = 'https://maps.google.com/'

const HelpSupport = () => {
  return (
    <div className="page-transition">
      <div className="container" style={{ padding: '60px 20px', minHeight: '80vh' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', color: 'var(--text)', marginBottom: '12px', letterSpacing: '0.02em', textAlign: 'center' }}>
          Need Help? We're here.
        </h1>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: '600px', margin: '0 auto 64px auto', fontSize: '15px' }}>
          Reach out to us through any of the channels below. Our support team is ready to assist you with your booking.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
          <a href={CONTACT_WHATSAPP} target="_blank" rel="noopener noreferrer" className="help-card">
            <div className="help-card__icon"><MessageIcon /></div>
            <h3 className="help-card__title">WhatsApp</h3>
            <p className="help-card__desc">Chat with our support team instantly.</p>
          </a>

          <a href={CONTACT_PHONE} className="help-card">
            <div className="help-card__icon"><PhoneIcon /></div>
            <h3 className="help-card__title">Phone Call</h3>
            <p className="help-card__desc">Speak directly with our representatives.</p>
          </a>

          <a href={CONTACT_INSTAGRAM} target="_blank" rel="noopener noreferrer" className="help-card">
            <div className="help-card__icon"><InstagramIcon /></div>
            <h3 className="help-card__title">Instagram</h3>
            <p className="help-card__desc">Follow us and send a direct message.</p>
          </a>

          <a href={CONTACT_MAPS} target="_blank" rel="noopener noreferrer" className="help-card">
            <div className="help-card__icon"><MapPinIcon /></div>
            <h3 className="help-card__title">Google Maps</h3>
            <p className="help-card__desc">Visit our primary office location.</p>
          </a>
        </div>
      </div>

      <style>{`
        .help-card {
          background: var(--bg-soft);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 40px 24px;
          text-align: center;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .help-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent);
          box-shadow: 0 12px 24px -10px rgba(0,0,0,0.15);
        }
        .help-card__icon {
          color: var(--accent);
          margin-bottom: 24px;
          background: var(--accent-dim);
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
        }
        .help-card:hover .help-card__icon {
          background: var(--accent);
          color: #0c0c0c;
        }
        .help-card__title {
          font-family: var(--font-display);
          font-size: 20px;
          color: var(--text);
          margin-bottom: 8px;
        }
        .help-card__desc {
          color: var(--text-muted);
          font-size: 14px;
          line-height: 1.6;
        }
      `}</style>
    </div>
  )
}

export default HelpSupport
