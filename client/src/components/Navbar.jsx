import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { animateThemeToggle } from '../utils/themeToggle'

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isLight, setIsLight] = useState(false)
  const { customer, customerLogout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    customerLogout()
    close()
    navigate('/')
  }

  const toggleTheme = () => {
    const next = !isLight
    animateThemeToggle(() => {
      setIsLight(next)
      document.documentElement.setAttribute('data-theme', next ? 'light' : '')
    }, 'circle', 'top-right', false)
  }

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      if (isOpen) return
      setHidden(y > lastScrollY && y > 100)
      setLastScrollY(y)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [lastScrollY, isOpen])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const close = () => setIsOpen(false)

  const navLinks = [
    { label: 'About',     href: '/#about',   isRoute: false },
    { label: 'Catalogue', href: '/cars',      isRoute: true  },
    { label: 'Reviews',   href: '/#reviews',  isRoute: false },
    { label: 'Support',   href: '/support',   isRoute: true  },
    { label: 'Contact',   href: '/#cta',      isRoute: false },
  ]

  const NavItem = ({ link, className, onClick }) => {
    const handleClick = (e) => {
      onClick && onClick(e)
      if (!link.isRoute && location.pathname === '/') {
        e.preventDefault()
        const targetId = link.href.replace('/#', '')
        const el = document.getElementById(targetId)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }
    }

    if (link.isRoute) {
      return <Link to={link.href} className={className} onClick={handleClick}>{link.label}</Link>
    }
    return <a href={link.href} className={className} onClick={handleClick}>{link.label}</a>
  }

  return (
    <>
      <style>{`
        /* mobile menu panel styles */
        .mobile-menu-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 1100;
          background: var(--bg);
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.3s ease, transform 0.3s ease;
          opacity: 0;
          pointer-events: none;
          transform: translateY(-12px);
        }
        .mobile-menu-overlay.is-open {
          opacity: 1;
          pointer-events: all;
          transform: translateY(0);
        }
        .mobile-menu-overlay .nav-link-mobile {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 42px;
          letter-spacing: 0.04em;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
          line-height: 1.1;
        }
        .mobile-menu-overlay .nav-link-mobile:hover { color: var(--accent); }
        .mobile-menu-overlay .mobile-menu-btn {
          margin-top: 24px;
        }
        .mobile-menu-overlay .mobile-menu-divider {
          width: 40px;
          height: 1px;
          background: var(--border);
          margin: 8px 0;
        }
        @media (min-width: 901px) {
          .mobile-menu-overlay { display: none !important; }
        }
        @media (max-width: 900px) {
          .mobile-menu-overlay { display: flex; }
          .menu__list-wrap { display: none !important; }
          .menu__right .btn--yellow { display: none; }
          .menu__right .theme-btn { display: flex; }
          .desktop-auth { display: none !important; }
        }
      `}</style>

      {/* Mobile full-screen menu */}
      <div className={`mobile-menu-overlay ${isOpen ? 'is-open' : ''}`}>
        {navLinks.map(link => (
          <NavItem key={link.label} link={link} className="nav-link-mobile" onClick={close} />
        ))}
        <div className="mobile-menu-divider" />
        {customer ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '280px', padding: '24px 0' }}>
            <Link to="/account" className="btn btn--outline mobile-menu-btn" onClick={close} style={{ fontSize: '14px', width: '100%', textAlign: 'center', margin: 0 }}>
              My Account
            </Link>
          </div>
        ) : (
          <Link to="/login" className="btn btn--outline mobile-menu-btn" onClick={close} style={{ fontSize: '13px', padding: '14px 32px' }}>Login / Sign Up</Link>
        )}
        <Link to="/cars" className="btn btn--yellow mobile-menu-btn" onClick={close}
          style={{ fontSize: '13px', padding: '14px 32px' }}>
          <span className="btn__label">
            <span className="btn__main">Book a Ride</span>
            <span className="btn__alt">Let's Go →</span>
          </span>
        </Link>
      </div>

      {/* Header bar */}
      <header className={`header ${hidden ? 'header--hidden' : ''} ${scrolled ? 'header--scrolled' : ''}`}
        style={{ zIndex: 1200 }}>
        <div className="header__island">
          <nav className="menu">

            <Link to="/" className="menu__logo" onClick={close}>
              Journey<span>Rentals</span>
            </Link>

            {/* Desktop nav links */}
            <div className="menu__list-wrap">
              <ul className="menu__list">
                {navLinks.map(link => (
                  <li key={link.label}>
                    <NavItem link={link} className="menu__link" onClick={close} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="menu__right">
              {/* Auth button — desktop */}
              {customer ? (
                <div className="desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link to="/account" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '0.06em', transition: 'color 0.2s', marginLeft: '6px' }}
                    onMouseEnter={e => e.target.style.color = 'var(--text)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                    My Account
                  </Link>
                </div>
              ) : (
                <Link to="/login" className="desktop-auth" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', textDecoration: 'none', border: '1px solid var(--border)', padding: '7px 14px', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
                  Login
                </Link>
              )}

              {/* Desktop only CTA */}
              <Link to="/cars" className="btn btn--yellow" style={{ fontSize: '11px', padding: '10px 20px' }}>
                <span className="btn__label">
                  <span className="btn__main">Book a Ride</span>
                  <span className="btn__alt">Let's Go →</span>
                </span>
              </Link>

              {/* Hamburger */}
              <button
                className={`icon-menu ${isOpen ? 'is-open' : ''}`}
                onClick={() => setIsOpen(o => !o)}
                aria-label="Toggle menu"
                style={{ zIndex: 1300, position: 'relative' }}
              >
                <span className="icon-menu__bar" />
                <span className="icon-menu__bar" />
                <span className="icon-menu__bar" />
              </button>

              {/* Theme toggle — locked to absolute right corner */}
              <button
                className="theme-btn"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                style={{
                  width: '34px', height: '34px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'color 0.2s, border-color 0.2s',
                  marginLeft: '8px'
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'rgba(255,210,0,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                {isLight ? <MoonIcon /> : <SunIcon />}
              </button>
            </div>

          </nav>
        </div>
      </header>
    </>
  )
}

export default Navbar