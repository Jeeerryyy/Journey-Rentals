const BASE_URL = import.meta.env.VITE_API_URL || ''

// wrapper for window.fetch that adds auth headers, timeouts, and json parsing
async function request(endpoint, options = {}) {
  // Pick the right token based on endpoint
  const token = endpoint.startsWith('/api/owner')
    ? localStorage.getItem('jr_token_owner')
    : localStorage.getItem('jr_token')

  // Default 10s timeout, allow override via options.timeout
  const timeoutMs = options.timeout || 10000
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const config = {
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config)
    clearTimeout(timeoutId)

    // Safe JSON parsing
    let data = {}
    const ct = res.headers.get('content-type') || ''
    const text = await res.text()
    if (text) {
      try { data = JSON.parse(text) } catch { data = { message: text } }
    }

    if (!res.ok) {
      throw new Error(data.error || data.message || `Request failed (${res.status})`)
    }

    return data
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.')
    }
    throw err
  }
}

export const api = {
  // auth endpoints
  auth: {
    signup:       (body) => request('/api/auth/signup',      { method: 'POST', body: JSON.stringify(body) }),
    login:        (body) => request('/api/auth/login',       { method: 'POST', body: JSON.stringify(body) }),
    ownerLogin:   (body) => request('/api/auth/owner-login', { method: 'POST', body: JSON.stringify(body) }),
    deleteAccount:() => request('/api/auth/profile', { method: 'DELETE' }),
    updateProfile:(body) => request('/api/auth/profile',     { method: 'PUT',  body: JSON.stringify(body) }),
    uploadAvatar: (formData) => {
      const token = localStorage.getItem('jr_token')
      return fetch(`${BASE_URL}/api/auth/profile/avatar`, {
        method: 'PUT',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      }).then(async res => {
        let data = {}
        const text = await res.text()
        if (text) {
          try { data = JSON.parse(text) } catch { data = { message: text } }
        }
        if (!res.ok) throw new Error(data.error || data.message || 'Avatar upload failed')
        return data
      })
    },
  },

  // public vehicle endpoints
  vehicles: {
    getAll:       (type) => request(`/api/vehicles${type ? `?type=${type}` : ''}`),
    getById:      (id)   => request(`/api/vehicles/${id}`),
    fleetSection: ()     => request('/api/vehicles/fleet-section'),
  },

  // customer booking actions
  bookings: {
    createOrder: (body) => request('/api/bookings/create-order',   { method: 'POST', body: JSON.stringify(body) }),
    verify:      (body) => request('/api/bookings/verify-payment', { method: 'POST', body: JSON.stringify(body) }),
    mine:        ()     => request('/api/bookings/mine'),
    cancel:      (id)   => request(`/api/bookings/cancel?id=${id}`, { method: 'PATCH' }),
  },

  // document uploads
  upload: {
    documents: (body) => request('/api/upload/document', { method: 'POST', body: JSON.stringify(body) }),
  },

  // admin dashboard actions
  owner: {
    dashboard:       ()         => request('/api/owner/dashboard'),
    getBookings:     (status)   => request(`/api/owner/bookings${status ? `?status=${status}` : ''}`),
    updateBooking:   (id, body) => request(`/api/owner/bookings/${id}`,          { method: 'PATCH',  body: JSON.stringify(body) }),
    getVehicles:     ()         => request('/api/owner/vehicles'),
    addVehicle:      (body)     => request('/api/owner/vehicles',                { method: 'POST',   body: JSON.stringify(body) }),
    updateVehicle:   (id, body) => request(`/api/owner/vehicles-item/${id}`,     { method: 'PATCH',  body: JSON.stringify(body) }),
    deleteVehicle:   (id)       => request(`/api/owner/vehicles-item/${id}`,     { method: 'DELETE' }),
    uploadImages:    (body)     => request('/api/owner/upload/images',           { method: 'POST',   body: JSON.stringify(body), timeout: 60000 }),
    getFleetSection: ()         => request('/api/owner/fleet-section'),
    updateFleetSection: (body)  => request('/api/owner/fleet-section',           { method: 'PUT',    body: JSON.stringify(body) }),
  },
}