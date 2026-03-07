import { useEffect, useState } from 'react'
import './startup.css'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')
const startServerUrl = `${apiBaseUrl}/start-server`

function StartupGate() {
  const [loadedModules, setLoadedModules] = useState(null)
  const [startupAttempts, setStartupAttempts] = useState(0)
  const [showStartupLatencyNotice, setShowStartupLatencyNotice] = useState(false)

  useEffect(() => {
    let cancelled = false
    let retryTimer = null

    const wakeAndBoot = async () => {
      if (cancelled) {
        return
      }

      try {
        const response = await fetch(startServerUrl, { method: 'GET' })
        if (!response.ok) {
          throw new Error('Server is not ready yet')
        }

        const [{ default: App }, { AuthProvider }, { AlertProvider }] = await Promise.all([
          import('./App.jsx'),
          import('./context/AuthContext.jsx'),
          import('./context/AlertContext.jsx'),
          import('bootstrap/dist/css/bootstrap.min.css'),
        ])

        if (!cancelled) {
          setShowStartupLatencyNotice(true)
          setLoadedModules({ App, AuthProvider, AlertProvider })
        }
      } catch {
        if (cancelled) {
          return
        }
        setStartupAttempts((prev) => prev + 1)
        retryTimer = window.setTimeout(() => {
          void wakeAndBoot()
        }, 3000)
      }
    }

    void wakeAndBoot()

    return () => {
      cancelled = true
      if (retryTimer) {
        window.clearTimeout(retryTimer)
      }
    }
  }, [])

  if (!loadedModules) {
    return (
      <div className="startup-loader-screen" role="status" aria-live="polite">
        <div className="startup-loader-bar">
          <p className="startup-loader-text">Starting Server...</p>
        </div>
        {startupAttempts > 0 && (
          <p className="startup-loader-note">Still waking up backend. Retrying...</p>
        )}
      </div>
    )
  }

  const { App, AuthProvider, AlertProvider } = loadedModules
  return (
    <AuthProvider>
      <AlertProvider>
        <App showStartupLatencyNotice={showStartupLatencyNotice} />
      </AlertProvider>
    </AuthProvider>
  )
}

export default StartupGate
