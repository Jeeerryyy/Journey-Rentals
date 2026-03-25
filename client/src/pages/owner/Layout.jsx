import { useState, useEffect } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { animateThemeToggle } from '../../utils/themeToggle'

const menuItems = [
  { name: 'Dashboard', path: '/owner', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
  ), exact: true },
  { name: 'Add Car', path: '/owner/add-car', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
  )},
  { name: 'Manage Cars', path: '/owner/manage-cars', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
  )},
  { name: 'Manage Bookings', path: '/owner/manage-bookings', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  )},
  { name: 'Fleet Editor', path: '/owner/fleet-editor', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  )},
]

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Theme state — defaults to OS preference, persists in localStorage
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('jr_dashboard_theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('jr_dashboard_theme', theme)
    return () => {
      // Remove theme attribute when leaving owner pages so customer site stays default (dark)
      document.documentElement.removeAttribute('data-theme')
    }
  }, [theme])

  const toggleTheme = () => {
    animateThemeToggle(() => {
      setTheme(t => t === 'dark' ? 'light' : 'dark')
    }, 'circle', 'top-right', false)
  }

  return (
    <>
      <style>{`
        .owner-layout {
          display: flex; min-height: 100vh;
          background: var(--bg); font-family: var(--font-body);
          transition: background 0.35s ease, color 0.35s ease;
        }

        /* Sidebar */
        .owner-sidebar {
          width: 240px; flex-shrink: 0;
          background: var(--bg-card);
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          position: fixed; top: 0; left: 0; height: 100vh;
          z-index: 500;
          transition: transform 0.3s ease, background 0.35s ease;
        }
        .owner-sidebar__logo {
          padding: 24px 24px 20px;
          border-bottom: 1px solid var(--border);
          text-decoration: none;
        }
        .owner-sidebar__logo-text {
          font-family: var(--font-display);
          font-size: 24px; letter-spacing: 0.04em;
          color: var(--text); line-height: 1;
        }
        .owner-sidebar__logo-text span { color: var(--accent); }
        .owner-sidebar__badge {
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--text-muted); margin-top: 4px;
          display: block;
        }
        .owner-sidebar__nav { padding: 16px 12px; flex: 1; overflow-y: auto; }
        .owner-sidebar__nav-label {
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--text-muted); padding: 0 12px;
          margin-bottom: 8px; margin-top: 8px;
        }
        .owner-nav-link {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 12px;
          font-size: 13px; font-weight: 600;
          color: var(--text-muted);
          text-decoration: none;
          border: 1px solid transparent;
          margin-bottom: 2px;
          transition: all 0.15s;
        }
        .owner-nav-link:hover { color: var(--text); background: var(--bg-soft); }
        .owner-nav-link.active {
          color: var(--accent);
          background: var(--accent-dim);
          border-color: rgba(255,210,0,0.15);
        }
        .owner-nav-link svg { flex-shrink: 0; }
        .owner-sidebar__footer {
          padding: 16px 24px;
          border-top: 1px solid var(--border);
        }
        .owner-sidebar__user {
          display: flex; align-items: center; gap: 10px;
        }
        .owner-sidebar__avatar {
          width: 34px; height: 34px; flex-shrink: 0;
          background: var(--accent-dim);
          border: 1px solid rgba(255,210,0,0.2);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-size: 16px;
          color: var(--accent);
        }
        .owner-sidebar__user-name { font-size: 13px; font-weight: 700; color: var(--text); }
        .owner-sidebar__user-role { font-size: 10px; color: var(--accent); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }

        /* Main */
        .owner-main { flex: 1; margin-left: 240px; min-height: 100vh; }

        /* Top bar */
        .owner-topbar {
          height: 60px;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px;
          position: sticky; top: 0; z-index: 100;
          transition: background 0.35s ease;
        }
        .owner-topbar__title { font-family: var(--font-display); font-size: 20px; letter-spacing: 0.04em; color: var(--text); }
        .owner-topbar__right { display: flex; align-items: center; gap: 12px; }
        .owner-topbar__view-site {
          font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--text-muted);
          text-decoration: none; display: flex; align-items: center; gap: 6px;
          transition: color 0.2s;
        }
        .owner-topbar__view-site:hover { color: var(--accent); }
        .owner-hamburger {
          display: none;
          background: none; border: none; cursor: pointer;
          color: var(--text); padding: 4px;
        }

        /* Theme toggle */
        .owner-theme-toggle {
          width: 38px; height: 38px;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-soft); border: 1px solid var(--border);
          cursor: pointer; color: var(--text-muted);
          transition: all 0.25s ease; border-radius: 0;
          flex-shrink: 0;
        }
        .owner-theme-toggle:hover { border-color: var(--accent); color: var(--accent); }
        .owner-theme-toggle svg { transition: transform 0.35s ease; }
        .owner-theme-toggle:hover svg { transform: rotate(30deg); }

        /* Content area */
        .owner-content { padding: 32px; }

        /* Mobile */
        @media (max-width: 768px) {
          .owner-sidebar { transform: translateX(-100%); }
          .owner-sidebar.open { transform: translateX(0); }
          .owner-main { margin-left: 0; }
          .owner-topbar { padding: 0 16px; height: 56px; }
          .owner-topbar__title { font-size: 17px; }
          .owner-content { padding: 16px 12px; }
          .owner-hamburger { display: block; }
          .owner-sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 499; }
          .owner-topbar__view-site span { display: none; }
        }
      `}</style>

      <div className="owner-layout">
        {/* Overlay for mobile */}
        {sidebarOpen && <div className="owner-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <aside className={`owner-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <Link to="/" className="owner-sidebar__logo">
            <div className="owner-sidebar__logo-text">JOURNEY<span>RENTALS</span></div>
            <span className="owner-sidebar__badge">Owner Dashboard</span>
          </Link>

          <nav className="owner-sidebar__nav">
            <div className="owner-sidebar__nav-label">Menu</div>
            {menuItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) => `owner-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="owner-sidebar__footer">
            <div className="owner-sidebar__user">
              <div className="owner-sidebar__avatar">A</div>
              <div>
                <div className="owner-sidebar__user-name">Arbaz Shaikh</div>
                <div className="owner-sidebar__user-role">Owner</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main area */}
        <main className="owner-main">
          <div className="owner-topbar">
            <button className="owner-hamburger" onClick={() => setSidebarOpen(v => !v)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <span className="owner-topbar__title">Journey Rentals</span>
            <div className="owner-topbar__right">
              {/* Theme toggle */}
              <button className="owner-theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                {theme === 'dark' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
              </button>
              <Link to="/" className="owner-topbar__view-site">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                <span>View Site</span>
              </Link>
            </div>
          </div>
          <div className="owner-content">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  )
}

export default Layout