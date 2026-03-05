import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import '../styles/components/AlertStack.css'

const AlertContext = createContext({
  showAlert: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
})

function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([])

  const asText = useCallback((value) => {
    if (typeof value === 'string') {
      return value
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }
    if (value && typeof value === 'object') {
      if (typeof value.message === 'string') {
        return value.message
      }
      try {
        return JSON.stringify(value)
      } catch {
        return ''
      }
    }
    return ''
  }, [])

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const showAlert = useCallback((payload) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const nextAlert = {
      id,
      type: payload?.type || 'info',
      title: asText(payload?.title),
      message: asText(payload?.message),
    }
    setAlerts((prev) => [...prev, nextAlert])
    const duration = Number(payload?.duration) > 0 ? Number(payload.duration) : 3200
    window.setTimeout(() => {
      removeAlert(id)
    }, duration)
  }, [asText, removeAlert])

  const value = useMemo(() => ({
    showAlert,
    success: (message, title = 'Success') => showAlert({ type: 'success', title, message }),
    error: (message, title = 'Error') => showAlert({ type: 'error', title, message }),
    info: (message, title = 'Info') => showAlert({ type: 'info', title, message }),
  }), [showAlert])

  return (
    <AlertContext.Provider value={value}>
      {children}
      <div className="scm-alert-stack" aria-live="polite" aria-atomic="true">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`scm-alert scm-alert--${alert.type}`}
            role={alert.type === 'error' ? 'alert' : 'status'}
          >
            <div className="scm-alert__text">
              {alert.title ? <div className="scm-alert__title">{alert.title}</div> : null}
              <div className="scm-alert__message">{alert.message}</div>
            </div>
            <button
              className="scm-alert__close"
              type="button"
              onClick={() => removeAlert(alert.id)}
              aria-label="Dismiss alert"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  )
}

const useAlert = () => useContext(AlertContext)

export { AlertProvider, useAlert }
