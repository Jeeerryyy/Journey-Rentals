import { useState, useEffect } from 'react'
import { api } from '../../lib/api.js'
import { statusConfig } from '../../lib/utils.js'

const ManageBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const data = await api.owner.getBookings()
      const formatted = data.bookings.map(b => ({
        ...b,
        _id: b._id,
        refId: b.referenceId,
        customer: b.userSnapshot?.name || 'Customer',
        phone: b.userSnapshot?.phone || 'N/A',
        car: `${b.vehicleSnapshot?.brand} ${b.vehicleSnapshot?.model}`,
        pickup: b.pickupDate ? new Date(b.pickupDate).toLocaleDateString('en-GB') : (b.bikeDate ? new Date(b.bikeDate).toLocaleDateString('en-GB') : 'N/A'),
        ret: b.returnDate ? new Date(b.returnDate).toLocaleDateString('en-GB') : (b.bikeSlot || 'N/A'),
        days: b.totalDays || 1,
        amount: b.totalPrice,
        advance: b.advancePaid,
        status: b.status,
        docs: !!(b.documents?.aadharUrl || b.documents?.licenseUrl)
      }))
      setBookings(formatted)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filters = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  const updateStatus = async (id, status) => {
    try {
      await api.owner.updateBooking(id, { status })
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b))
      if (selected?._id === id) setSelected(prev => ({ ...prev, status }))
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <>
      <style>{`
        .mb-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .mb-title { font-family: var(--font-display); font-size: 40px; letter-spacing: 0.02em; color: var(--text); line-height: 1; }
        .mb-title span { color: var(--accent); }
        .mb-sub { font-size: 13px; color: var(--text-muted); margin-top: 6px; }

        .mb-filters { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
        .mb-filter { padding: 7px 14px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; background: transparent; border: 1px solid var(--border); color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
        .mb-filter:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }
        .mb-filter.active { background: var(--accent); color: #0c0c0c; border-color: var(--accent); }

        .mb-table-wrap { background: var(--bg-card); border: 1px solid var(--border); overflow-x: auto; }
        .mb-table { width: 100%; border-collapse: collapse; min-width: 700px; }
        .mb-table th { padding: 12px 16px; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); text-align: left; border-bottom: 1px solid var(--border); background: var(--bg-soft); white-space: nowrap; }
        .mb-table td { padding: 14px 16px; font-size: 13px; color: var(--text); border-bottom: 1px solid var(--border); white-space: nowrap; }
        .mb-table tr:last-child td { border-bottom: none; }
        .mb-table tr { cursor: pointer; transition: background 0.15s; }
        .mb-table tr:hover td { background: var(--bg-soft); }
        .mb-badge { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 9px; border: 1px solid; }
        .mb-action-btn { padding: 5px 10px; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; border: 1px solid; background: transparent; cursor: pointer; transition: all 0.15s; margin-right: 4px; }

        /* Detail panel */
        .mb-panel-overlay { position: fixed; inset: 0; z-index: 999; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); }
        .mb-panel { position: fixed; top: 0; right: 0; height: 100vh; width: 400px; max-width: 100vw; background: var(--bg-card); border-left: 1px solid var(--border); z-index: 1000; overflow-y: auto; display: flex; flex-direction: column; }
        .mb-panel__head { padding: 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .mb-panel__title { font-family: var(--font-display); font-size: 26px; color: var(--text); letter-spacing: 0.02em; }
        .mb-panel__close { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 20px; padding: 4px; transition: color 0.2s; }
        .mb-panel__close:hover { color: var(--text); }
        .mb-panel__body { padding: 24px; flex: 1; }
        .mb-panel__section { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid var(--border); margin-top: 20px; }
        .mb-panel__section:first-child { margin-top: 0; }
        .mb-panel__row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
        .mb-panel__row span:first-child { color: var(--text-muted); }
        .mb-panel__row span:last-child { color: var(--text); font-weight: 600; }
        .mb-panel__actions { padding: 20px 24px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px; }
        .mb-panel__btn { padding: 12px; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; border: none; cursor: pointer; transition: all 0.15s; }

        @media (max-width: 600px) {
          .mb-title { font-size: 28px; }
          .mb-filters { gap: 6px; }
          .mb-filter { padding: 8px 12px; font-size: 10px; min-height: 40px; }
          .mb-table { min-width: 580px; }
          .mb-table th, .mb-table td { padding: 10px 12px; font-size: 12px; }
          .mb-action-btn { padding: 6px 10px; font-size: 10px; min-height: 36px; }
          .mb-panel { width: 100vw; }
          .mb-panel__head { padding: 16px; }
          .mb-panel__body { padding: 16px; }
          .mb-panel__actions { padding: 16px; }
          .mb-panel__title { font-size: 22px; }
          .mb-panel__btn { min-height: 44px; }
        }
      `}</style>

      <div className="mb-header">
        <div>
          <div className="mb-title">Manage <span>Bookings</span></div>
          <div className="mb-sub">{loading ? 'Loading...' : `${bookings.length} total bookings · Click any row for details`}</div>
        </div>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '16px', marginBottom: '24px', border: '1px solid rgba(239,68,68,0.3)' }}>{error}</div>}

      {/* Filter tabs */}
      <div className="mb-filters">
        {filters.map(f => (
          <button key={f} className={`mb-filter ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? `All (${bookings.length})` : `${f} (${bookings.filter(b => b.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="mb-table-wrap">
        <table className="mb-table">
          <thead>
            <tr>
              <th>Ref #</th>
              <th>Customer</th>
              <th>Car</th>
              <th>Pickup</th>
              <th>Return</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => {
              const st = statusConfig[b.status]
              return (
                <tr key={b._id} onClick={() => setSelected(b)}>
                  <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{b.refId}</td>
                  <td>{b.customer}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{b.car}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{b.pickup}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{b.ret}</td>
                  <td style={{ fontWeight: 700 }}>₹{b.amount.toLocaleString()}</td>
                  <td><span className="mb-badge" style={{ color: st.color, background: st.bg, borderColor: st.border }}>{st.label}</span></td>
                  <td onClick={e => e.stopPropagation()}>
                    {b.status === 'pending' && (
                      <>
                        <button className="mb-action-btn" style={{ color: '#22c55e', borderColor: 'rgba(34,197,94,0.3)' }} onClick={() => updateStatus(b._id, 'confirmed')}>✓ Confirm</button>
                        <button className="mb-action-btn" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }} onClick={() => updateStatus(b._id, 'cancelled')}>✗ Cancel</button>
                      </>
                    )}
                    {b.status === 'confirmed' && (
                      <button className="mb-action-btn" style={{ color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.1)' }} onClick={() => updateStatus(b._id, 'completed')}>✓ Complete</button>
                    )}
                    {(b.status === 'completed' || b.status === 'cancelled') && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No {filter} bookings found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selected && (
        <>
          <div className="mb-panel-overlay" onClick={() => setSelected(null)} />
          <div className="mb-panel">
            <div className="mb-panel__head">
              <div className="mb-panel__title">#{selected.refId}</div>
              <button className="mb-panel__close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="mb-panel__body">
              <div className="mb-panel__section">Customer</div>
              <div className="mb-panel__row"><span>Name</span><span>{selected.customer}</span></div>
              <div className="mb-panel__row"><span>Phone</span><span>{selected.phone}</span></div>
              <div className="mb-panel__row"><span>Documents</span><span style={{ color: selected.docs ? '#22c55e' : '#ef4444' }}>{selected.docs ? '✓ Uploaded' : '✗ Missing'}</span></div>

              <div className="mb-panel__section">Booking Details</div>
              <div className="mb-panel__row"><span>Car</span><span>{selected.car}</span></div>
              <div className="mb-panel__row"><span>Pickup</span><span>{selected.pickup}</span></div>
              <div className="mb-panel__row"><span>Return</span><span>{selected.ret}</span></div>
              <div className="mb-panel__row"><span>Duration</span><span>{selected.days} days</span></div>

              <div className="mb-panel__section">Payment</div>
              <div className="mb-panel__row"><span>Total</span><span>₹{selected.amount.toLocaleString()}</span></div>
              <div className="mb-panel__row"><span>Advance Paid</span><span style={{ color: '#22c55e' }}>₹{selected.advance.toLocaleString()}</span></div>
              <div className="mb-panel__row"><span>Balance Due</span><span>₹{(selected.amount - selected.advance).toLocaleString()}</span></div>

              <div className="mb-panel__section">Status</div>
              <div style={{ marginBottom: '8px' }}>
                <span className="mb-badge" style={{ color: statusConfig[selected.status].color, background: statusConfig[selected.status].bg, borderColor: statusConfig[selected.status].border, fontSize: '12px', padding: '5px 14px' }}>
                  {statusConfig[selected.status].label}
                </span>
              </div>
            </div>

            <div className="mb-panel__actions">
              {selected.status === 'pending' && (
                <>
                  <button className="mb-panel__btn" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }} onClick={() => updateStatus(selected._id, 'confirmed')}>✓ Confirm Booking</button>
                  <button className="mb-panel__btn" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }} onClick={() => updateStatus(selected._id, 'cancelled')}>✗ Cancel Booking</button>
                </>
              )}
              {selected.status === 'confirmed' && (
                <button className="mb-panel__btn" style={{ background: 'var(--bg-soft)', color: 'var(--text-muted)', border: '1px solid var(--border)' }} onClick={() => updateStatus(selected._id, 'completed')}>Mark as Completed</button>
              )}
              <button className="mb-panel__btn" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)' }} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default ManageBookings