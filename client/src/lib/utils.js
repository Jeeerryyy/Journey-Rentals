// Shared utility functions and constants

/**
 * Convert a File object to a base64 data URL string
 */
export const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload  = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(file)
})

/**
 * Unified booking status color/label configuration
 * Used by MyBookings, ManageBookings, and Dashboard
 */
export const statusConfig = {
  confirmed: { label: 'Confirmed', color: '#22c55e',  bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)' },
  pending:   { label: 'Pending',   color: '#f59e0b',  bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
  completed: { label: 'Completed', color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)' },
  cancelled: { label: 'Cancelled', color: '#ef4444',  bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)' },
}
