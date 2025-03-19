import { AtpSessionData } from '@atproto/api'
import { securityUtils } from './security'
import AtProtoService from '../api/atproto'

export class SessionManager {
  private static instance: SessionManager
  private static readonly SESSION_KEY = 'auth_session'
  private static readonly REFRESH_INTERVAL = 1000 * 60 * 15 // 15 minutes
  private static readonly TOKEN_EXPIRY_BUFFER = 1000 * 60 * 5 // 5 minutes buffer
  private refreshTimer?: NodeJS.Timeout
  private atProto: typeof AtProtoService

  private constructor() {
    this.atProto = AtProtoService
    this.initializeSession()
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  private initializeSession(): void {
    const session = this.getSession()
    if (session) {
      this.startRefreshTimer()
    }
  }

  getSession(): AtpSessionData | null {
    try {
      const session = securityUtils.secureStore.get<AtpSessionData>(SessionManager.SESSION_KEY)
      if (!session) return null

      if (!this.isSessionValid(session)) {
        this.clearSession()
        return null
      }

      return session
    } catch (error) {
      console.error('Error retrieving session:', error)
      return null
    }
  }

  setSession(session: AtpSessionData): void {
    try {
      if (!session || !session.accessJwt || !session.refreshJwt) {
        throw new Error('Invalid session data')
      }

      securityUtils.secureStore.set(SessionManager.SESSION_KEY, session)
      this.startRefreshTimer()
    } catch (error) {
      console.error('Error setting session:', error)
      throw new Error('Failed to set session')
    }
  }

  clearSession(): void {
    try {
      securityUtils.secureStore.remove(SessionManager.SESSION_KEY)
      this.stopRefreshTimer()
    } catch (error) {
      console.error('Error clearing session:', error)
    }
  }

  private isSessionValid(session: AtpSessionData): boolean {
    if (!session.accessJwt || !session.refreshJwt) {
      return false
    }

    try {
      const token = session.accessJwt.split('.')[1]
      const decoded = JSON.parse(atob(token))
      const expirationTime = decoded.exp * 1000 // Convert to milliseconds
      
      // Consider session invalid if it's within the expiry buffer
      return Date.now() < (expirationTime - SessionManager.TOKEN_EXPIRY_BUFFER)
    } catch (error) {
      console.error('Error validating session:', error)
      return false
    }
  }

  private startRefreshTimer(): void {
    this.stopRefreshTimer()
    this.refreshTimer = setInterval(() => {
      void this.refreshSessionIfNeeded()
    }, SessionManager.REFRESH_INTERVAL)
  }

  private stopRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = undefined
    }
  }

  private async refreshSessionIfNeeded(): Promise<void> {
    const session = this.getSession()
    if (!session) {
      this.stopRefreshTimer()
      return
    }

    try {
      const response = await this.atProto.refreshSession(session.refreshJwt)
      
      if (!response.success || !response.data) {
        throw new Error('Failed to refresh session')
      }

      this.setSession(response.data)
    } catch (error) {
      console.error('Failed to refresh session:', error)
      this.clearSession()
    }
  }

  // Public method to force a session refresh
  async refreshSession(): Promise<void> {
    await this.refreshSessionIfNeeded()
  }
}

export default SessionManager.getInstance() 