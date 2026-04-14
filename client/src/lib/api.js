/**
 * api.js — frontend API client
 * Uses httpOnly cookies for auth (credentials: 'include').
 * No JWT stored in localStorage/sessionStorage.
 * Automatic token refresh on 401 responses.
 */

let BASE_URL = import.meta.env.VITE_API_URL || ''
if (BASE_URL.endsWith('/api/')) BASE_URL = BASE_URL.slice(0, -5)
if (BASE_URL.endsWith('/api')) BASE_URL = BASE_URL.slice(0, -4)

// ── Token refresh state ──
let isRefreshing = false
let refreshPromise = null

/**
 * Attempt to refresh the access token using the refresh cookie.
 * Returns true if refresh succeeded, false otherwise.
 */
async function refreshAccessToken() {
  if (isRefreshing) return refreshPromise

  isRefreshing = true
  refreshPromise = fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => res.ok)
    .catch(() => false)
    .finally(() => { isRefreshing = false })

  return refreshPromise
}

/**
 * Core request wrapper.
 * - Always sends credentials (cookies) for cross-origin requests.
 * - Retries once on 401 by attempting token refresh.
 */
async function request(endpoint, options = {}, isRetry = false) {
  const timeoutMs = options.timeout || 10000
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const config = {
    signal: controller.signal,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config)
    clearTimeout(timeoutId)

    let data = {}
    const text = await res.text()
    if (text) {
      try { data = JSON.parse(text) } catch { data = { message: text } }
    }

    // Auto-refresh on 401 (token expired) — retry once
    if (res.status === 401 && !isRetry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        return request(endpoint, options, true)
      }
    }

    if (!res.ok) {
      const err = new Error(data.error || data.message || `Request failed (${res.status})`)
      err.status = res.status
      err.data = data
      throw err
    }

    return data
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('That request took too long. Check your connection and try again.')
    }
    throw err
  }
}

export const api = {
  auth: {
    signup:       (body) => request('/api/auth/signup',       { method: 'POST', body: JSON.stringify(body) }),
    login:        (body) => request('/api/auth/login',        { method: 'POST', body: JSON.stringify(body) }),
    logout:       ()     => request('/api/auth/logout',       { method: 'POST' }),
    me:           ()     => request('/api/auth/me'),
    refresh:      ()     => request('/api/auth/refresh',      { method: 'POST' }),
    verifyOtp:    (body) => request('/api/auth/verify-otp',   { method: 'POST', body: JSON.stringify(body) }),
    resendOtp:    (body) => request('/api/auth/resend-otp',   { method: 'POST', body: JSON.stringify(body) }),
    ownerLogin:   (body) => request('/api/auth/owner-login',  { method: 'POST', body: JSON.stringify(body) }),
    ownerLogout:  ()     => request('/api/auth/owner-logout', { method: 'POST' }),
    deleteAccount:()     => request('/api/auth/profile',      { method: 'DELETE' }),
    updateProfile:(body) => request('/api/auth/profile',      { method: 'PUT',  body: JSON.stringify(body) }),
    uploadAvatar: (formData) => {
      return fetch(`${BASE_URL}/api/auth/profile/avatar`, {
        method: 'PUT',
        credentials: 'include',
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

  vehicles: {
    getAll:       (type) => request(`/api/vehicles${type ? `?type=${type}` : ''}`),
    getById:      (id)   => request(`/api/vehicles/${id}`),
    fleetSection: ()     => request('/api/vehicles/fleet-section'),
  },

  bookings: {
    createOrder: (body) => request('/api/bookings/create-order',   { method: 'POST', body: JSON.stringify(body) }),
    verify:      (body) => request('/api/bookings/verify-payment', { method: 'POST', body: JSON.stringify(body) }),
    mine:        ()     => request('/api/bookings/mine'),
    cancel:      (id)   => request(`/api/bookings/cancel?id=${id}`, { method: 'PATCH' }),
    requestExtension: (id) => request(`/api/bookings/${id}/request-extension`, { method: 'PATCH' }),
  },

  upload: {
    documents: (body) => request('/api/upload/document', { method: 'POST', body: JSON.stringify(body) }),
  },

  owner: {
    dashboard:       ()             => request('/api/owner/dashboard'),
    getBookings:     (status, cursor) => {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      if (cursor) params.set('cursor', cursor)
      return request(`/api/owner/bookings?${params.toString()}`)
    },
    updateBooking:   (id, body)     => request(`/api/owner/bookings/${id}`,          { method: 'PATCH',  body: JSON.stringify(body) }),
    getVehicles:     ()             => request('/api/owner/vehicles'),
    addVehicle:      (body)         => request('/api/owner/vehicles',                { method: 'POST',   body: JSON.stringify(body) }),
    updateVehicle:   (id, body)     => request(`/api/owner/vehicles-item/${id}`,     { method: 'PATCH',  body: JSON.stringify(body) }),
    deleteVehicle:   (id)           => request(`/api/owner/vehicles-item/${id}`,     { method: 'DELETE' }),
    uploadImages:    (body)         => request('/api/owner/upload/images',           { method: 'POST',   body: JSON.stringify(body), timeout: 60000 }),
    toggleVisibility:(id)           => request(`/api/owner/vehicles-visibility/${id}`, { method: 'PATCH' }),
    getFleetSection: ()             => request('/api/owner/fleet-section'),
    updateFleetSection: (body)      => request('/api/owner/fleet-section',           { method: 'PUT',    body: JSON.stringify(body) }),
    uploadBookingPhoto: (id, image) => request(`/api/owner/bookings/${id}/photo`,    { method: 'POST',   body: JSON.stringify({ image }) }),
    deleteBookingPhoto: (id)        => request(`/api/owner/bookings/${id}/photo`,    { method: 'DELETE' }),
    searchBooking: (refId)          => request(`/api/owner/bookings/search/${refId}`),
  },
}