import { create } from 'zustand'
import { AuthState, AuthActions } from '../models/types'
import AtProtoService from '../api/atproto'

const atProto = AtProtoService.getInstance()

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  agent: atProto.getAgent(),
  isLoading: false,
  error: null,

  login: async (identifier: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await atProto.login(identifier, password)
      if (!response.success) {
        throw new Error(response.error)
      }
      set({
        session: response.data,
        agent: atProto.getAgent(),
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Login failed' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  logout: () => {
    atProto.logout()
    set({
      session: null,
      agent: atProto.getAgent(),
      error: null,
    })
  },

  refreshSession: async () => {
    // Implement session refresh logic here
    throw new Error('Not implemented')
  },
})) 