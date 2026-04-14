import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api.js'
import { statusConfig } from '../../lib/utils.js'
import NotificationToggle from './NotificationToggle.jsx'
import BookingPhotoModal from './BookingPhotoModal.jsx'

const Dashboard = () => {
  const { owner } = useAuth()
  const [stats, setStats]           = useState(null)
  const [recentBookings, setRecent] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'Good Morning'
    if (hour >= 12 && hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }, [])

  const [photoModal, setPhotoModal] = useState({ open: false, booking: null })

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.owner.dashboard()
        setStats(data.stats)
        setRecent(data.recentBookings)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const statCards = stats ? [
    {
      label: 'Total Vehicles', value: stats.vehicles.total, sub: `${stats.vehicles.available} available`,
      color: '#FFD200',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
    },
    {
      label: 'Total Bookings', value: stats.bookings.total, sub: `${stats.monthly?.bookings || 0} this month`,
      color: '#60a5fa',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    },
    {
      label: 'Pending', value: stats.bookings.pending, sub: 'Awaiting confirmation',
      color: '#f59e0b',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    },
    {
      label: 'Revenue', value: `₹${(stats.revenue.totalAdvance || 0).toLocaleString()}`, sub: `₹${(stats.revenue.thisMonth || 0).toLocaleString()} this month`,
      color: '#22c55e',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    },
  ] : []

  return (
    <>
      <style>{`
        .dash-header { margin-bottom: 28px; }
        .dash-header__title { font-family: var(--font-display); font-size: 40px; letter-spacing: 0.02em; color: var(--text); line-height: 1; }
        .dash-header__title span { color: var(--accent); }
        .dash-header__sub { font-size: 13px; color: var(--text-muted); margin-top: 6px; }

        .dash-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 28px; }
        .dash-stat { background: var(--bg-card); border: 1px solid var(--border); padding: 20px; display: flex; flex-direction: column; gap: 12px; transition: border-color 0.2s; }
        .dash-stat:hover { border-color: rgba(255,210,0,0.2); }
        .dash-stat__icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border: 1px solid; }
        .dash-stat__value { font-family: var(--font-display); font-size: 36px; line-height: 1; letter-spacing: 0.02em; color: var(--text); }
        .dash-stat__label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); }
        .dash-stat__sub { font-size: 12px; color: var(--text-muted); }

        .dash-section-title { font-family: var(--font-display); font-size: 24px; letter-spacing: 0.02em; color: var(--text); margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; }
        .dash-section-title a { font-family: var(--font-body); font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); text-decoration: none; }

        .dash-table-wrap { background: var(--bg-card); border: 1px solid var(--border); overflow-x: auto; margin-bottom: 28px; }
        .dash-table { width: 100%; border-collapse: collapse; min-width: 560px; }
        .dash-table th { padding: 12px 16px; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); text-align: left; border-bottom: 1px solid var(--border); background: var(--bg-soft); }
        .dash-table td { padding: 14px 16px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border); }
        .dash-table tr:last-child td { border-bottom: none; }
        .dash-table tr:hover td { background: var(--bg-soft); }
        .dash-badge { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 9px; border: 1px solid; }

        .dash-quick { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
        .dash-quick-btn { background: var(--bg-card); border: 1px solid var(--border); padding: 20px; text-decoration: none; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.2s, transform 0.2s; }
        .dash-quick-btn:hover { border-color: rgba(255,210,0,0.3); transform: translateY(-2px); }
        .dash-quick-btn__label { font-size: 13px; font-weight: 700; color: var(--text); }
        .dash-quick-btn__sub { font-size: 11px; color: var(--text-muted); }

        .dash-loading { display: flex; align-items: center; justify-content: center; min-height: 300px; font-family: var(--font-display); font-size: 28px; color: var(--accent); }
        .dash-empty { padding: 32px; text-align: center; color: var(--text-muted); font-size: 13px; }

        @media (max-width: 768px) {
          .dash-header__title { font-size: 28px; line-height: 1.15; }
          .dash-stats { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .dash-stat { padding: 14px; gap: 8px; }
          .dash-stat__icon { width: 34px; height: 34px; }
          .dash-stat__icon svg { width: 18px; height: 18px; }
          .dash-stat__value { font-size: 24px; }
          .dash-stat__label { font-size: 9px; }
          .dash-stat__sub { font-size: 10px; }
          .dash-section-title { font-size: 20px; flex-direction: column; align-items: flex-start; gap: 10px; }
          .dash-quick { grid-template-columns: 1fr; }
          .dash-quick-btn { padding: 16px; flex-direction: row; align-items: center; }
        }
      `}</style>

      <div className="dash-header">
        <div className="dash-header__title">{greeting}, <span>{owner?.name?.split(' ')[0] || 'Partner'}</span> 👋</div>
        <div className="dash-header__sub">Here's what's happening with Journey Rentals today.</div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px', borderRadius: '8px', marginBottom: '28px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '8px', color: 'var(--text)' }}>Booking Alerts</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>Get instant notifications on this device when a new booking is made.</p>
        <NotificationToggle />
      </div>

      {/* Loading */}
      {loading && <div className="dash-loading">Loading Dashboard...</div>}

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '16px', marginBottom: '24px', color: '#ef4444', fontSize: '14px' }}>
          Failed to load dashboard: {error}
        </div>
      )}

      {/* Stats */}
      {!loading && stats && (
        <div className="dash-stats">
          {statCards.map(s => (
            <div className="dash-stat" key={s.label}>
              <div className="dash-stat__icon" style={{ color: s.color, borderColor: `${s.color}30`, background: `${s.color}10` }}>
                {s.icon}
              </div>
              <div>
                <div className="dash-stat__value">{s.value}</div>
                <div className="dash-stat__label">{s.label}</div>
                <div className="dash-stat__sub">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Bookings */}
      {!loading && (
        <>
          <div className="dash-section-title">
            Recent Bookings
            <Link to="/owner/manage-bookings">View All →</Link>
          </div>
          <div className="dash-table-wrap">
            {recentBookings.length === 0 ? (
              <div className="dash-empty">No bookings yet.</div>
            ) : (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Ref</th><th>Customer</th><th>Vehicle</th><th>Amount</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(b => {
                    const st = statusConfig[b.status] || statusConfig.pending
                    return (
                      <tr key={b._id}>
                        <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{b.referenceId}</td>
                        <td>{b.userSnapshot?.name || '—'}</td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          {b.vehicleSnapshot?.brand} {b.vehicleSnapshot?.model}
                        </td>
                        <td style={{ fontWeight: 700 }}>₹{b.totalPrice?.toLocaleString() || '—'}</td>
                        <td>
                          <span className="dash-badge" style={{ color: st.color, background: st.bg, borderColor: st.border }}>
                            {b.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="dash-badge" 
                            style={{ 
                              background: 'transparent', 
                              borderColor: 'var(--border)', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px'
                            }}
                            onClick={() => setPhotoModal({ open: true, booking: b })}
                            title="Manage Photo"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Quick Actions */}
      <div className="dash-section-title">Quick Actions</div>
      <div className="dash-quick">
        <button className="dash-quick-btn" onClick={() => setPhotoModal({ open: true, booking: null })} style={{ cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ fontSize: '24px' }}>📷</div>
          <div>
            <div className="dash-quick-btn__label">Upload Booking Photo</div>
            <div className="dash-quick-btn__sub">Attach user photo with vehicle</div>
          </div>
        </button>
        {[
          { to: '/owner/add-car',          icon: '＋', label: 'Add New Car',    sub: 'List a car in your fleet' },
          { to: '/owner/manage-cars',      icon: '🚗', label: 'Manage Cars',   sub: 'Edit or remove listings' },
          { to: '/owner/manage-bookings',  icon: '📋', label: 'Bookings',      sub: 'Review & confirm bookings' },
          { to: '/cars',                   icon: '👁',  label: 'View Fleet',   sub: 'See your public listings' },
        ].map(q => (
          <Link to={q.to} key={q.to} className="dash-quick-btn">
            <div style={{ fontSize: '24px' }}>{q.icon}</div>
            <div>
              <div className="dash-quick-btn__label">{q.label}</div>
              <div className="dash-quick-btn__sub">{q.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      <BookingPhotoModal 
        isOpen={photoModal.open} 
        onClose={() => setPhotoModal({ open: false, booking: null })}
        initialBooking={photoModal.booking}
        onUpdate={(updated) => {
          setRecent(prev => prev.map(b => b._id === updated._id ? { ...b, ...updated } : b))
        }}
      />
    </>
  )
}

export default Dashboard