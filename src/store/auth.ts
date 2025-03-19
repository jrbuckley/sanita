import { create } from 'zustand'
import { BskyAgent } from '@atproto/api'
import { AuthState } from '@/types/atproto'

const agent = new BskyAgent({
  service: 'https://bsky.social',
})

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  agent: agent,
  isLoading: false,

  login: async (identifier: string, password: string) => {
    set({ isLoading: true })
    try {
      const { success, data } = await agent.login({
        identifier,
        password,
      })
      
      if (success) {
        set({
          session: data,
          agent: agent,
        })
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  logout: () => {
    set({
      session: null,
      agent: agent,
    })
  },
})) 