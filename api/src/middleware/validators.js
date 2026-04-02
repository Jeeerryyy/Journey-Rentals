/**
 * validators.js — Email format check + password strength enforcement.
 * Real email validation happens via OTP delivery — we only check format here.
 */

/**
 * Relaxed email format check. Real validation happens via OTP verification.
 * Returns { valid: true } or { valid: false, reason: string }
 */
export async function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'Email is required.' }
  }

  const trimmed = email.toLowerCase().trim()

  // Basic format check — real validation is done by OTP delivery
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    return { valid: false, reason: 'That doesn\'t look like a valid email address.' }
  }

  // Block obviously disposable domains
  const disposableDomains = ['tempmail.com', 'throwaway.email', 'guerrillamail.com', 'mailinator.com', 'yopmail.com']
  const domain = trimmed.split('@')[1]
  if (disposableDomains.includes(domain)) {
    return { valid: false, reason: 'Please use a permanent email address, not a disposable one.' }
  }

  return { valid: true }
}

/**
 * Validate password strength. Returns an array of failed rule descriptions.
 * Empty array = all rules passed.
 */
export function validatePassword(password, name = '', email = '') {
  const errors = []

  if (!password || typeof password !== 'string') {
    return ['Password is required.']
  }

  if (password.length < 8) {
    errors.push('Use at least 8 characters.')
  }

  if (password.length > 128) {
    errors.push('Password can\'t be longer than 128 characters.')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Include at least one uppercase letter.')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Include at least one lowercase letter.')
  }

  if (!/\d/.test(password)) {
    errors.push('Include at least one number.')
  }

  // Check if password contains the user's name or email prefix
  if (name && name.length > 2 && password.toLowerCase().includes(name.toLowerCase())) {
    errors.push('Your password shouldn\'t contain your name.')
  }

  if (email) {
    const emailPrefix = email.split('@')[0].toLowerCase()
    if (emailPrefix.length > 2 && password.toLowerCase().includes(emailPrefix)) {
      errors.push('Your password shouldn\'t contain your email.')
    }
  }

  // Common password check
  const commonPasswords = ['password', '12345678', 'qwerty123', 'letmein', 'welcome1', 'admin123']
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('That password is too common — pick something more unique.')
  }

  return errors
}
