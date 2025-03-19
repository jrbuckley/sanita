import { AES, enc } from 'crypto-js'

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key'

export const securityUtils = {
  // Secure storage methods
  secureStore: {
    set: (key: string, value: any): void => {
      try {
        const encrypted = AES.encrypt(JSON.stringify(value), ENCRYPTION_KEY).toString()
        localStorage.setItem(key, encrypted)
      } catch (error) {
        console.error('Failed to securely store data:', error)
      }
    },

    get: <T>(key: string): T | null => {
      try {
        const encrypted = localStorage.getItem(key)
        if (!encrypted) return null
        
        const decrypted = AES.decrypt(encrypted, ENCRYPTION_KEY).toString(enc.Utf8)
        return JSON.parse(decrypted)
      } catch (error) {
        console.error('Failed to retrieve secure data:', error)
        return null
      }
    },

    remove: (key: string): void => {
      localStorage.removeItem(key)
    }
  },

  // Input sanitization
  sanitizeInput: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .trim()
  },

  // Content Security Policy
  getCSP: (): string => {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://bsky.social",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  },

  // Rate limiting
  rateLimit: (() => {
    const requests: { [key: string]: number[] } = {}
    const WINDOW_MS = 60000 // 1 minute
    const MAX_REQUESTS = 60 // 60 requests per minute

    return {
      checkLimit: (key: string): boolean => {
        const now = Date.now()
        if (!requests[key]) {
          requests[key] = [now]
          return true
        }

        // Remove old timestamps
        requests[key] = requests[key].filter(time => now - time < WINDOW_MS)

        if (requests[key].length >= MAX_REQUESTS) {
          return false
        }

        requests[key].push(now)
        return true
      }
    }
  })(),

  // Session validation
  validateSession: (session: any): boolean => {
    if (!session) return false

    const requiredFields = ['accessJwt', 'refreshJwt', 'handle', 'did']
    return requiredFields.every(field => session[field])
  }
} 