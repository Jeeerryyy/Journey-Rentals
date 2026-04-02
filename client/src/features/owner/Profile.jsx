import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const Profile = () => {
  const { owner } = useAuth()
  const [name, setName] = useState(owner?.name || '')
  const [email, setEmail] = useState(owner?.email || '')
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    // Mock save logic for now
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="owner-page">
      <style>{`
        .profile-container {
          max-width: 600px;
          background: var(--bg-card);
          padding: 32px;
          border: 1px solid var(--border);
          border-radius: 8px;
        }
        .profile-title {
          font-family: var(--font-display);
          font-size: 28px;
          color: var(--text);
          margin-bottom: 24px;
          letter-spacing: 0.02em;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        .form-input {
          width: 100%;
          padding: 12px 16px;
          background: var(--bg-soft);
          border: 1px solid var(--border);
          color: var(--text);
          font-family: var(--font-body);
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus {
          border-color: var(--accent);
        }
        .btn-save {
          background: var(--accent);
          color: #0c0c0c;
          padding: 12px 24px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 13px;
          transition: background 0.2s;
        }
        .btn-save:hover {
          background: #ffe44d;
        }
        .success-msg {
          color: var(--green);
          font-size: 13px;
          margin-top: 16px;
        }
        @media (max-width: 600px) {
          .profile-container { padding: 20px; border-radius: 4px; border: none; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
          .profile-title { font-size: 24px; margin-bottom: 20px; }
          .btn-save { width: 100%; text-align: center; }
        }
      `}</style>
      
      <div className="profile-container">
        <h1 className="profile-title">Edit Profile</h1>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn-save">Save Changes</button>
          {saved && <div className="success-msg">Profile updated successfully!</div>}
        </form>
      </div>
    </div>
  )
}

export default Profile
