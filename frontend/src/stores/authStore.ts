import { create } from 'zustand'

import { api, ensureCsrfCookie } from '../lib/api'
import type { ApiResource, User } from '../types/api'

interface AuthState {
  user: User | null
  initialized: boolean
  loading: boolean
  error: string | null
  bootstrap: () => Promise<void>
  login: (userId: number, pin: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,
  loading: false,
  error: null,
  async bootstrap() {
    if (useAuthStore.getState().initialized) {
      return
    }

    set({ loading: true, error: null })

    try {
      const response = await api.get<{ data: User | null }>('/session')
      set({ user: response.data.data, initialized: true, loading: false })
    } catch {
      set({ user: null, initialized: true, loading: false })
    }
  },
  async login(userId, pin) {
    set({ loading: true, error: null })

    try {
      await ensureCsrfCookie()
      const response = await api.post<ApiResource<User>>('/login', { user_id: userId, pin })
      set({ user: response.data.data, initialized: true, loading: false })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to sign you in right now.'

      set({ error: message, loading: false })
      throw error
    }
  },
  async logout() {
    await api.post('/logout')
    set({ user: null, initialized: true, error: null })
  },
}))
