import { useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import AtProtoService from '../api/atproto'

export const useAuth = () => {
  const { session, isLoading, error } = useAuthStore()
  const atProto = AtProtoService.getInstance()

  const login = useCallback(async (identifier: string, password: string) => {
    const response = await atProto.login(identifier, password)
    if (!response.success) {
      throw new Error(response.error)
    }
    return response.data
  }, [])

  const logout = useCallback(async () => {
    await atProto.logout()
  }, [])

  return {
    session,
    isLoading,
    error,
    isAuthenticated: !!session,
    login,
    logout,
  }
} 