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
        vehicleImage: b.vehicleSnapshot?.image || '',
        pickup: b.pickupDate ? new Date(b.pickupDate).toLocaleDateString('en-GB') : (b.bikeDate ? new Date(b.bikeDate).toLocaleDateString('en-GB') : 'N/A'),
        pickupTime: b.pickupTime || '',
        ret: b.returnDate ? new Date(b.returnDate).toLocaleDateString('en-GB') : (b.bikeSlot || 'N/A'),
        returnTime: b.returnTime || '',
        days: b.totalDays || 1,
        amount: b.totalPrice,
        advance: b.advancePaid,
        balance: b.balanceDue || (b.totalPrice - b.advancePaid),
        status: b.status,
        extensionRequested: b.extensionRequested || false,
        extensionStatus: b.extensionStatus || 'none',
        docs: !!(b.documents?.aadharUrl || b.documents?.licenseUrl),
        aadharUrl: b.documents?.aadharUrl || '',
        licenseUrl: b.documents?.licenseUrl || '',
        adminPhotoUrl: b.adminPhotoWithVehicleUrl || ''
      }))
      setBookings(formatted)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const [uploading, setUploading] = useState(false)

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be under 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      try {
        setUploading(true)
        const res = await api.owner.uploadBookingPhoto(selected._id, reader.result)
        const updatedPhoto = res.url
        setBookings(prev => prev.map(b => b._id === selected._id ? { ...b, adminPhotoUrl: updatedPhoto } : b))
        setSelected(prev => ({ ...prev, adminPhotoUrl: updatedPhoto }))
      } catch (err) {
        alert(err.message)
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handlePhotoDelete = async () => {
    if (!confirm('Are you sure you want to remove this photo?')) return
    try {
      setUploading(true)
      await api.owner.deleteBookingPhoto(selected._id)
      setBookings(prev => prev.map(b => b._id === selected._id ? { ...b, adminPhotoUrl: null } : b))
      setSelected(prev => ({ ...prev, adminPhotoUrl: null }))
    } catch (err) {
      alert(err.message)
    } finally {
      setUploading(false)
    }
  }

  const filters = ['all', 'confirmed', 'completed', 'cancelled']

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

  const updateExtensionStatus = async (id, extensionStatus) => {
    try {
      await api.owner.updateBooking(id, { extensionStatus })
      const requested = extensionStatus === 'approved' ? false : true // Or handle appropriately
      setBookings(prev => prev.map(b => b._id === id ? { ...b, extensionStatus, extensionRequested: extensionStatus === 'approved' ? false : b.extensionRequested } : b))
      if (selected?._id === id) setSelected(prev => ({ ...prev, extensionStatus, extensionRequested: extensionStatus === 'approved' ? false : prev.extensionRequested }))
    } catch (err) {
      alert(err.message)
    }
  }

  const exportToExcel = () => {
    try {
      let tableHTML = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8" />
          <style>
            table { border-collapse: collapse; font-family: Calibri, sans-serif; }
            th { background-color: #1F2937; color: #ffffff; font-weight: bold; padding: 10px; height: 30px; text-align: center; border: 1px solid #d1d5db; vertical-align: middle; }
            td { padding: 10px; text-align: left; vertical-align: middle; height: 35px; border: 1px solid #e5e7eb; }
            .col-sno { width: 40px; text-align: center; }
            .col-date { width: 100px; mso-number-format: "\\@"; }
            .col-name { width: 180px; mso-number-format: "\\@"; }
            .col-phone { width: 130px; mso-number-format: "\\@"; }
            .col-car { width: 220px; mso-number-format: "\\@"; }
            .col-ret-date { width: 110px; mso-number-format: "\\@"; }
            .col-ret-time { width: 90px; mso-number-format: "\\@"; }
            .col-amount { width: 120px; mso-number-format: "[$₹-en-IN]\\ #\\,##0"; text-align: left; }
            .col-status { width: 130px; text-align: center; }
            .col-doc { width: 100px; text-align: center; }
            .col-photo { width: 100px; text-align: center; }
          </style>
        </head>
        <body>
          <table>
            <col class="col-sno" />
            <col class="col-date" />
            <col class="col-name" />
            <col class="col-phone" />
            <col class="col-car" />
            <col class="col-ret-date" />
            <col class="col-ret-time" />
            <col class="col-amount" />
            <col class="col-amount" />
            <col class="col-status" />
            <col class="col-doc" />
            <col class="col-doc" />
            <col class="col-photo" />
            <col class="col-photo" />
            <tr>
               <th>S.No</th>
               <th>Booking Date</th>
               <th>Customer Name</th>
               <th>Phone Number</th>
               <th>Car/Bike Name</th>
               <th>Return Date</th>
               <th>Return Time</th>
               <th>Paid Amount</th>
               <th>Remaining Amount</th>
               <th>Status</th>
               <th>Aadhar</th>
               <th>License</th>
               <th>User Photo</th>
               <th>Vehicle Photo</th>
            </tr>
      `;

      bookings.forEach((b, index) => {
        const sno = index + 1;
        const date = b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-GB') : '—';
        const name = (b.customer || '—').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const phone = (b.phone || '—').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const carName = b.car.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Handle Return details split
        const retDate = b.ret;
        const retTime = b.bookingType === 'bike' ? (b.bikeSlot || '—') : (b.returnTime || '—');
        
        const paidAmt = b.advance || 0;
        const remainingAmt = b.balance || 0;

        const rawStatus = (b.status || 'pending').toLowerCase();
        const isConfirmed = rawStatus === 'confirmed' || rawStatus === 'completed';
        const statusLabel = isConfirmed ? 'Confirmed' : 'Unconfirmed';
        const statusBg = isConfirmed ? '#dcfce7' : '#fee2e2';
        const statusColor = isConfirmed ? '#166534' : '#991b1b';

        const aadharLink = b.aadharUrl ? `<a href="${b.aadharUrl}" style="color: #2563eb;">View Aadhar</a>` : '—';
        const licenseLink = b.licenseUrl ? `<a href="${b.licenseUrl}" style="color: #2563eb;">View License</a>` : '—';
        const userPhotoLink = b.adminPhotoUrl ? `<a href="${b.adminPhotoUrl}" style="color: #2563eb;">View Photo</a>` : '—';
        const vehiclePhotoLink = b.vehicleImage ? `<a href="${b.vehicleImage}" style="color: #2563eb;">View Vehicle</a>` : '—';
        
        tableHTML += `
            <tr>
              <td class="col-sno">${sno}</td>
              <td>${date}</td>
              <td>${name}</td>
              <td>${phone}</td>
              <td>${carName}</td>
              <td>${retDate}</td>
              <td>${retTime}</td>
              <td class="col-amount">${paidAmt}</td>
              <td class="col-amount">${remainingAmt}</td>
              <td style="background-color: ${statusBg}; color: ${statusColor}; font-weight: bold; text-align: center;">${statusLabel}</td>
              <td style="text-align: center;">${aadharLink}</td>
              <td style="text-align: center;">${licenseLink}</td>
              <td style="text-align: center;">${userPhotoLink}</td>
              <td style="text-align: center;">${vehiclePhotoLink}</td>
            </tr>
        `;
      });

      tableHTML += `
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Journey_Rentals_Bookings_${new Date().toISOString().split('T')[0]}.xls`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export Error:', err);
      alert('Failed to export bookings. Please try again.');
    }
  }

  return (
    <>
      <style>{`
        .mb-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .mb-title { font-family: var(--font-display); font-size: 40px; letter-spacing: 0.02em; color: var(--text); line-height: 1; }
        .mb-title span { color: var(--accent); }
        .mb-sub { font-size: 13px; color: var(--text-muted); margin-top: 6px; }

        .mb-export-btn { padding: 10px 18px; display: inline-flex; align-items: center; gap: 8px; background: var(--bg-soft); color: var(--text); font-family: var(--font-body); font-weight: 700; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; border: 1px solid var(--border); cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .mb-export-btn:hover { background: var(--accent); color: #0c0c0c; border-color: var(--accent); }

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

        .mb-photo-wrap { margin-top: 10px; position: relative; border-radius: 8px; overflow: hidden; border: 1px dashed var(--border); aspect-ratio: 16/9; background: var(--bg-soft); display: flex; align-items: center; justify-content: center; }
        .mb-photo-img { width: 100%; height: 100%; object-fit: cover; }
        .mb-photo-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--text-muted); cursor: pointer; padding: 20px; text-align: center; width: 100%; height: 100%; }
        .mb-photo-empty:hover { background: rgba(255,255,255,0.03); }
        .mb-photo-empty svg { opacity: 0.5; }
        .mb-photo-btn-group { position: absolute; bottom: 8px; right: 8px; display: flex; gap: 6px; }
        .mb-photo-mini-btn { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); color: #fff; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; transition: all 0.2s; }
        .mb-photo-mini-btn:hover { background: var(--accent); color: #000; border-color: var(--accent); }
        .mb-photo-loading { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 11px; font-weight: 800; text-transform: uppercase; z-index: 5; }
      `}</style>

      <div className="mb-header">
        <div>
          <div className="mb-title">Manage <span>Bookings</span></div>
          <div className="mb-sub">{loading ? 'Loading...' : `${bookings.length} total bookings · Click any row for details`}</div>
        </div>
        {!loading && bookings.length > 0 && (
          <button className="mb-export-btn" onClick={exportToExcel}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export to Excel
          </button>
        )}
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
                  <td style={{ color: 'var(--accent)', fontWeight: 700 }}>
                    {b.refId}
                    {b.extensionRequested && b.extensionStatus === 'pending' && <span style={{ display: 'inline-block', marginLeft: '6px', width: '8px', height: '8px', borderRadius: '50%', background: '#facc15' }} title="Extension Requested" />}
                  </td>
                  <td>{b.customer}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{b.car}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{b.pickup} {b.pickupTime && <span style={{fontSize:'10px', opacity:0.8}}><br/>{b.pickupTime}</span>}</td>
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
              <div className="mb-panel__row"><span>Pickup</span><span>{selected.pickup} {selected.pickupTime ? `at ${selected.pickupTime}` : ''}</span></div>
              <div className="mb-panel__row"><span>Return</span><span>{selected.ret} {selected.returnTime ? `at ${selected.returnTime}` : ''}</span></div>
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
              
              {selected.extensionRequested && (
                <div style={{ background: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.3)', padding: '12px', borderRadius: '8px', marginTop: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#facc15', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Extension Requested</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>The customer has requested to extend this rental.</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="mb-action-btn" style={{ color: '#22c55e', borderColor: 'rgba(34,197,94,0.3)', flex: 1 }} onClick={() => updateExtensionStatus(selected._id, 'approved')}>✓ Approve</button>
                    <button className="mb-action-btn" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)', flex: 1 }} onClick={() => updateExtensionStatus(selected._id, 'rejected')}>✗ Reject</button>
                  </div>
                </div>
              )}

              <div className="mb-panel__section">Admin Attachments (Private)</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>Photo of user with the vehicle. Not visible to customer.</div>
              <div className="mb-photo-wrap">
                {uploading && <div className="mb-photo-loading">Processing...</div>}
                {selected.adminPhotoUrl ? (
                  <>
                    <img src={selected.adminPhotoUrl} className="mb-photo-img" alt="User with Vehicle" />
                    <div className="mb-photo-btn-group">
                      <label className="mb-photo-mini-btn" title="Replace Photo">
                        <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} disabled={uploading} />
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L17 3z"/></svg>
                      </label>
                      <button className="mb-photo-mini-btn" title="Remove Photo" onClick={handlePhotoDelete} disabled={uploading}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="mb-photo-empty">
                    <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} disabled={uploading} />
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Upload User Photo with Vehicle</span>
                  </label>
                )}
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