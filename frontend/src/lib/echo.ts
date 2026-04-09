import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

import { getApiOrigin } from './api'

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

window.Pusher = Pusher

let echoInstance: Echo<'reverb'> | null = null

/** Matches backend `REVERB_APP_KEY` when Vite env vars are unset. */
const DEFAULT_REVERB_KEY = 'smart-cafe-key'

function reverbKey(): string {
  const key = import.meta.env.VITE_REVERB_APP_KEY
  if (typeof key === 'string' && key.trim() !== '') {
    return key.trim()
  }
  return DEFAULT_REVERB_KEY
}

/**
 * WebSocket realtime is opt-in so the app works without Reverb/Pusher running.
 * Set `VITE_ENABLE_REALTIME=true` in frontend `.env` when `php artisan reverb:start` is active.
 */
export function isRealtimeEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_REALTIME === 'true'
}

export function getEcho(): Echo<'reverb'> | null {
  if (!isRealtimeEnabled()) {
    return null
  }

  if (echoInstance) {
    return echoInstance
  }

  const key = reverbKey()
  const wsHost = (import.meta.env.VITE_REVERB_HOST as string | undefined)?.trim() || 'localhost'
  const portRaw = import.meta.env.VITE_REVERB_PORT
  const wsPort = portRaw !== undefined && portRaw !== '' ? Number(portRaw) : 8080
  const scheme = (import.meta.env.VITE_REVERB_SCHEME as string | undefined)?.trim() || 'http'

  try {
    echoInstance = new Echo({
      broadcaster: 'reverb',
      key,
      wsHost,
      wsPort,
      wssPort: wsPort,
      forceTLS: scheme === 'https',
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${getApiOrigin() || 'http://localhost:8000'}/broadcasting/auth`,
      withCredentials: true,
    })
  } catch {
    return null
  }

  return echoInstance
}
