import { useEffect } from 'react'

import { useAuthStore } from '../stores/authStore'

const IDLE_MS = 2 * 60 * 1000

const activityEvents: (keyof WindowEventMap)[] = [
  'mousedown',
  'mousemove',
  'keydown',
  'touchstart',
  'scroll',
  'wheel',
  'click',
  'pointerdown',
]

/**
 * Signs the user out after a period with no pointer, key, or scroll activity.
 */
export function useIdleLogout() {
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (!user) {
      return
    }

    let timeoutId = window.setTimeout(() => {}, 0)

    function resetTimer() {
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => {
        void useAuthStore.getState().logout()
      }, IDLE_MS)
    }

    resetTimer()

    for (const event of activityEvents) {
      window.addEventListener(event, resetTimer, { passive: true })
    }

    return () => {
      window.clearTimeout(timeoutId)
      for (const event of activityEvents) {
        window.removeEventListener(event, resetTimer)
      }
    }
  }, [user])
}
