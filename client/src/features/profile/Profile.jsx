import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext'

const Profile = () => {
  const { customer, setCustomerData, customerLogout } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  
  const [name, setName] = useState(customer?.name || '')
  const [email, setEmail] = useState(customer?.email || '')
  const fileInputRef = useRef(null)

  const handleLogout = () => {
    customerLogout()
    navigate('/')
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB.')
      return
    }

    setAvatarLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await api.auth.uploadAvatar(formData)
      setCustomerData(res.user)
      setSuccess('Profile picture updated successfully.')
    } catch (err) {
      setError(err.message || 'Failed to upload profile picture.')
    } finally {
      setAvatarLoading(false)
    }
  }

  const handleSaveChanges = async () => {
    setSaveLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await api.auth.updateProfile({ name, email })
      setCustomerData(res.user)
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(err.message || 'Failed to update profile.')
    } finally {
      setSaveLoading(false)
    }
  }

  if (!customer) return null

  return (
    <>
      <style>{`
        .profile-container { display: grid; gap: 32px; grid-template-columns: 300px 1fr; width: 100%; max-width: 1000px; margin: 0 auto; align-items: start; }
        @media (max-width: 850px) { .profile-container { grid-template-columns: 1fr; } }
        
        .profile-card { background: var(--bg-card); border: 1px solid var(--border); padding: 32px; width: 100%; }
        .avatar-section { display: flex; flex-direction: column; align-items: center; text-align: center; }
        .avatar-wrapper { position: relative; width: 150px; height: 150px; border-radius: 50%; overflow: hidden; border: 2px solid var(--border); background: var(--bg-soft); margin-bottom: 24px; }
        .avatar-img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 56px; color: var(--text-muted); font-family: var(--font-display); }
        .avatar-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; cursor: pointer; color: #fff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
        .avatar-wrapper:hover .avatar-overlay { opacity: 1; }
        
        .profile-title { font-family: var(--font-display); font-size: 28px; color: var(--text); letter-spacing: 0.02em; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 16px; }
        .profile-field { margin-bottom: 24px; }
        .profile-label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
        .profile-val { font-size: 16px; color: var(--text); padding: 14px 16px; background: var(--bg-soft); border: 1px solid var(--border); font-weight: 500; }
        .profile-input { width: 100%; padding: 14px 16px; background: var(--bg-soft); border: 1px solid var(--border); color: var(--text); font-family: var(--font-body); font-size: 16px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        .profile-input:focus { border-color: var(--accent); }
        .profile-input:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .btn-full { width: 100%; padding: 14px; font-family: var(--font-body); font-weight: 800; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; border: none; cursor: pointer; transition: all 0.2s; }
        .btn-accent { background: var(--accent); color: #0c0c0c; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px)); }
        .btn-accent:hover:not(:disabled) { background: #ffe44d; transform: translateY(-1px); }
        .btn-accent:disabled { background: var(--border); color: var(--text-muted); cursor: not-allowed; clip-path: none; }
        
        .error-msg { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 12px; margin-bottom: 16px; font-size: 13px; }
        .success-msg { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); color: #22c55e; padding: 12px; margin-bottom: 16px; font-size: 13px; }
        .pay-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.2); border-top-color: #0c0c0c; border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 8px; vertical-align: middle; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      
      <div className="profile-container">
        
        {/* Left column: Avatar & Quick Actions */}
        <div className="profile-card avatar-section">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleAvatarChange} 
            style={{ display: 'none' }} 
          />
          <div className="avatar-wrapper" onClick={() => !avatarLoading && fileInputRef.current.click()}>
            {avatarLoading ? (
              <div className="avatar-overlay" style={{ opacity: 1, cursor: 'not-allowed' }}>
                <span className="pay-spinner" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#fff', width: '24px', height: '24px', margin: 0 }} />
              </div>
            ) : (
              <div className="avatar-overlay">Upload Photo</div>
            )}
            {customer.avatarUrl ? (
              <img src={customer.avatarUrl} alt="Avatar" className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">{customer.name?.charAt(0) || 'U'}</div>
            )}
          </div>
          
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--text)', marginBottom: '4px' }}>
            {customer.name}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            {customer.role === 'customer' ? 'USER' : customer.role.toUpperCase()}
          </p>

          <button 
            onClick={handleLogout} 
            className="btn btn--outline" 
            style={{ width: '100%', borderColor: 'var(--border)', color: 'var(--text-muted)', transition: 'all 0.2s', padding: '12px', marginTop: '32px' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            Log Out
          </button>
        </div>

        {/* Right column: Details */}
        <div>
          <div className="profile-card">
            <div className="profile-title">Account Details</div>
            
            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="profile-field" style={{ marginBottom: 0 }}>
                <span className="profile-label">Full Name</span>
                <input 
                  className="profile-input" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  disabled={saveLoading} 
                />
              </div>
              <div className="profile-field" style={{ marginBottom: 0 }}>
                <span className="profile-label">Email Address</span>
                <input 
                  className="profile-input" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  disabled={saveLoading} 
                />
              </div>
            </div>

            <div className="profile-field" style={{ marginTop: '24px', marginBottom: 0 }}>
              <span className="profile-label">Phone Number</span>
              <div className="profile-val">
                {customer.phone || 'Not provided'}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Phone number can be updated at the time of booking.
              </p>
            </div>

            <button 
              className="btn-accent" 
              onClick={handleSaveChanges} 
              disabled={saveLoading || (name === customer.name && email === customer.email)} 
              style={{ padding: '14px 24px', fontWeight: 700, fontSize: '11px', letterSpacing: '0.05em', marginTop: '16px' }}
            >
              {saveLoading ? <span className="pay-spinner" style={{ margin: 0 }} /> : 'SAVE CHANGES'}
            </button>
          </div>
        </div>

      </div>
    </>
  )
}

export default Profile
