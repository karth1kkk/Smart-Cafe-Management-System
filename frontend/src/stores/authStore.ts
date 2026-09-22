import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { api } from '../lib/api'
import type { User } from '../types/api'

interface AuthState {
  user: User | null
  token: string | null
  initialized: boolean
  loading: boolean
  error: string | null
  bootstrap: () => Promise<void>
  login: (userId: number, pin: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      initialized: false,
      loading: false,
      error: null,

      async bootstrap() {
        if (get().initialized) return
        set({ loading: true, error: null })
        try {
          const response = await api.get<{ data: User | null }>('/session')
          set({ user: response.data.data, initialized: true, loading: false })
        } catch {
          set({ user: null, token: null, initialized: true, loading: false })
        }
      },

      async login(userId, pin) {
        set({ loading: true, error: null })
        try {
          const response = await api.post<{ data: User; token: string }>('/login', {
            user_id: userId,
            pin,
          })
          set({
            user: response.data.data,
            token: response.data.token,
            initialized: true,
            loading: false,
            error: null,
          })
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Unable to sign you in right now.'
          set({ error: message, loading: false })
          throw error
        }
      },

      async logout() {
        try {
          await api.post('/logout')
        } catch {
          // ignore — token may already be invalid
        }
        set({ user: null, token: null, initialized: true, error: null })
      },
    }),
    {
      name: 'smart-cafe-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
)