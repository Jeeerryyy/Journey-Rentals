/**
 * Unified API Client for Journey Rentals
 * - Preserves httpOnly cookies with credentials: 'include'
 * - In-memory cache & request deduplication for high performance
 * - Supports both DriveHub axios-style (api.get/post) and Journey Rentals helper objects
 */

import { format, isValid } from 'date-fns'

let BASE_URL = import.meta.env.VITE_API_URL || ''
if (BASE_URL.endsWith('/api/')) BASE_URL = BASE_URL.slice(0, -5)
if (BASE_URL.endsWith('/api')) BASE_URL = BASE_URL.slice(0, -4)

export const API_BASE = BASE_URL ? `${BASE_URL}/api` : '/api'

// In-memory cache for fast repeat requests
const cache = new Map()
const inFlightRequests = new Map()
const CACHE_TTL_MS = 20000

export function clearApiCache() {
  cache.clear()
}

/**
 * Core request wrapper
 */
export async function request(endpoint, options = {}, isRetry = false) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/api') ? '' : '/api'}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  const cacheKey = `${url}:${JSON.stringify(options.params || {})}`
  const method = (options.method || 'GET').toUpperCase()

  // 1. Cache lookup for public GET endpoints
  if (method === 'GET' && !options.headers?.['no-cache'] && (endpoint.includes('/vehicles') || endpoint.includes('/fleet-section'))) {
    const cached = cache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return cached.data
    }
  }

  // 2. Request deduplication for in-flight GETs
  if (method === 'GET' && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)
  }

  const timeoutMs = options.timeout || 30000
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const isFormData = options.body instanceof FormData
  const config = {
    method,
    signal: controller.signal,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    ...(options.body ? { body: isFormData ? options.body : (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) } : {}),
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(url, config)
      clearTimeout(timeoutId)

      let data = {}
      const text = await res.text()
      if (text) {
        try { data = JSON.parse(text) } catch { data = { message: text } }
      }

      // Auto-refresh token on 401
      if (res.status === 401 && !isRetry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
        try {
          const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          })
          if (refreshRes.ok) {
            return request(endpoint, options, true)
          }
        } catch { /* ignore refresh fail */ }
      }

      if (!res.ok) {
        const err = new Error(data.error || data.message || `Request failed with status ${res.status}`)
        err.status = res.status
        err.data = data
        throw err
      }

      // Invalidate cache on mutations
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        cache.clear()
      } else if (method === 'GET' && (endpoint.includes('/vehicles') || endpoint.includes('/fleet-section'))) {
        cache.set(cacheKey, { data, timestamp: Date.now() })
      }

      return data
    } catch (err) {
      clearTimeout(timeoutId)
      if (err.name === 'AbortError') {
        throw new Error('Request timed out. Please check your internet connection.')
      }
      throw err
    }
  })()

  if (method === 'GET') {
    inFlightRequests.set(cacheKey, fetchPromise)
    fetchPromise.finally(() => inFlightRequests.delete(cacheKey))
  }

  return fetchPromise
}

// Axios-compatible wrapper interface
export const api = {
  get:    (url, config = {}) => request(url, { method: 'GET', ...config }).then(data => ({ data })),
  post:   (url, body, config = {}) => request(url, { method: 'POST', body, ...config }).then(data => ({ data })),
  put:    (url, body, config = {}) => request(url, { method: 'PUT', body, ...config }).then(data => ({ data })),
  patch:  (url, body, config = {}) => request(url, { method: 'PATCH', body, ...config }).then(data => ({ data })),
  delete: (url, config = {}) => request(url, { method: 'DELETE', ...config }).then(data => ({ data })),

  // Domain Helper APIs
  auth: {
    signup:       (body) => request('/api/auth/signup',       { method: 'POST', body }),
    login:        (body) => request('/api/auth/login',        { method: 'POST', body }),
    logout:       ()     => request('/api/auth/logout',       { method: 'POST' }),
    me:           ()     => request('/api/auth/me'),
    verifyOtp:    (body) => request('/api/auth/verify-otp',   { method: 'POST', body }),
    resendOtp:    (body) => request('/api/auth/resend-otp',   { method: 'POST', body }),
    ownerLogin:   (body) => request('/api/auth/owner-login',  { method: 'POST', body }),
    ownerLogout:  ()     => request('/api/auth/owner-logout', { method: 'POST' }),
    updateProfile:(body) => request('/api/auth/profile',      { method: 'PUT',  body }),
    uploadAvatar: (formData) => request('/api/auth/profile/avatar', { method: 'PUT', body: formData }),
  },

  vehicles: {
    getAll:       (type) => request(`/api/vehicles${type ? `?type=${type}` : ''}`),
    getById:      (id)   => request(`/api/vehicles/${id}`),
    fleetSection: ()     => request('/api/vehicles/fleet-section'),
  },

  bookings: {
    createOrder:      (body) => request('/api/bookings/create-order',   { method: 'POST', body }),
    verifyPayment:    (body) => request('/api/bookings/verify-payment', { method: 'POST', body }),
    mine:             ()     => request('/api/bookings/mine'),
    getMyBookings:    ()     => request('/api/bookings/mine'),
    getById:          (id)   => request(`/api/bookings/${id}`),
    cancel:           (id)   => request(`/api/bookings/cancel?id=${id}`, { method: 'PATCH' }),
    requestExtension: (id)   => request(`/api/bookings/${id}/request-extension`, { method: 'PATCH' }),
  },

  upload: {
    documents: (body) => request('/api/upload/document', { method: 'POST', body }),
  },

  owner: {
    dashboard:       ()             => request('/api/owner/dashboard'),
    getBookings:     (status, cursor) => {
      const params = new URLSearchParams()
      if (status) params.set('status', status)
      if (cursor) params.set('cursor', cursor)
      return request(`/api/owner/bookings?${params.toString()}`)
    },
    updateBooking:   (id, body)     => request(`/api/owner/bookings/${id}`,          { method: 'PATCH', body }),
    getVehicles:     ()             => request('/api/owner/vehicles'),
    addVehicle:      (body)         => request('/api/owner/vehicles',                { method: 'POST',  body }),
    updateVehicle:   (id, body)     => request(`/api/owner/vehicles-item/${id}`,     { method: 'PATCH', body }),
    deleteVehicle:   (id)           => request(`/api/owner/vehicles-item/${id}`,     { method: 'DELETE' }),
    uploadImages:    (body)         => request('/api/owner/upload/images',           { method: 'POST',  body, timeout: 60000 }),
    toggleVisibility:(id)           => request(`/api/owner/vehicles-visibility/${id}`, { method: 'PATCH' }),
    getFleetSection: ()             => request('/api/owner/fleet-section'),
    updateFleetSection: (body)      => request('/api/owner/fleet-section',           { method: 'PUT',   body }),
    uploadBookingPhoto: (id, image) => request(`/api/owner/bookings/${id}/photo`,    { method: 'POST',  body: { image } }),
    deleteBookingPhoto: (id)        => request(`/api/owner/bookings/${id}/photo`,    { method: 'DELETE' }),
    searchBooking:   (refId)        => request(`/api/owner/bookings/search/${refId}`),
  },

  notifications: {
    list:        (params) => request('/api/notifications', { params }),
    markRead:    (body)   => request('/api/notifications/mark-read', { method: 'PATCH', body }),
    delete:      (id)     => request(`/api/notifications/${id}`, { method: 'DELETE' }),
    clearAll:    ()       => request('/api/notifications', { method: 'DELETE' }),
    subscribe:   (body)   => request('/api/notifications/subscribe',   { method: 'POST', body }),
    unsubscribe: (body)   => request('/api/notifications/unsubscribe', { method: 'POST', body }),
  }
}

// Utility formatters
export function formatApiError(err) {
  if (!err) return 'Something went wrong'
  if (typeof err === 'string') return err
  return err.data?.error || err.data?.message || err.message || 'Something went wrong'
}

export function formatINR(v) {
  if (v == null || isNaN(Number(v))) return '₹0'
  return '₹' + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

export function getOptimizedImageUrl(url) {
  if (!url) return '/vehicles/maruti_swift_old.webp'
  if (url.includes('cloudinary.com') && !url.includes('f_auto')) {
    return url.replace('/upload/', '/upload/w_600,f_auto,q_auto/')
  }
  if (url.includes('unsplash.com') && !url.includes('w=')) {
    return `${url}&w=600&q=75&auto=format`
  }
  return url
}

export function safeFormatDate(
  dateInput,
  formatString = 'dd MMM yyyy',
  fallback = '—'
) {
  if (!dateInput) return fallback
  try {
    const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput
    if (!isValid(d) || isNaN(d.getTime())) {
      return fallback
    }
    return format(d, formatString)
  } catch {
    return fallback
  }
}

export default api
