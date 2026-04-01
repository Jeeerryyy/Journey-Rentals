import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      color: '#fff',
      fontFamily: 'var(--font-display, "Syne", sans-serif)',
      padding: '24px',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontSize: 'clamp(80px, 15vw, 160px)',
        fontWeight: 800,
        color: '#ffd200',
        lineHeight: 1,
        margin: 0,
      }}>
        404
      </h1>
      <h2 style={{
        fontSize: 'clamp(20px, 4vw, 32px)',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        margin: '8px 0 16px',
      }}>
        Page not found
      </h2>
      <p style={{
        color: 'rgba(255,255,255,0.5)',
        fontSize: '16px',
        maxWidth: '400px',
        lineHeight: 1.6,
        marginBottom: '32px',
      }}>
        Looks like you took a wrong turn. The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          padding: '14px 32px',
          background: '#ffd200',
          color: '#111',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '14px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          borderRadius: '4px',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => {
          e.target.style.transform = 'translateY(-2px)'
          e.target.style.boxShadow = '0 8px 24px rgba(255,210,0,0.3)'
        }}
        onMouseLeave={e => {
          e.target.style.transform = 'translateY(0)'
          e.target.style.boxShadow = 'none'
        }}
      >
        Back to Home
      </Link>
    </div>
  )
}
