import { useState } from 'react'
import { createPortal } from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext.jsx'
import apiClient from '../api/client.js'
import '../styles/components/AuthModal.css'

function AuthModal({ isOpen, activeTab, onClose, onTabChange }) {
  const { login } = useAuth()
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) {
    return null
  }

  const handleLoginChange = (event) => {
    const { name, value } = event.target
    setLoginForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setLoginError('')
    try {
      const response = await apiClient.post('/auth/login', loginForm)
      const payload = response.data
      login(payload.user, payload.token)
      onClose?.()
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Login failed.'
      setLoginError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return createPortal(
    <div className="scm-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="scm-modal scm-auth-modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="scm-modal__header">
          <h4 className="fw-semibold mb-0">Welcome</h4>
          <button className="btn btn-sm btn-ghost" type="button" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className="scm-auth-tabs mb-4">
          <button
            className={`scm-auth-tab${activeTab === 'login' ? ' is-active' : ''}`}
            type="button"
            onClick={() => onTabChange?.('login')}
          >
            Log in
          </button>
          <button
            className={`scm-auth-tab${activeTab === 'signup' ? ' is-active' : ''}`}
            type="button"
            onClick={() => onTabChange?.('signup')}
          >
            Sign up
          </button>
        </div>
        {activeTab === 'login' ? (
          <form className="d-grid gap-3" onSubmit={handleLoginSubmit}>
            <div>
              <label className="form-label fw-semibold" htmlFor="auth-login-email">
                Email
              </label>
              <input
                className="form-control"
                id="auth-login-email"
                name="email"
                type="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                required
              />
            </div>
            <div>
              <label className="form-label fw-semibold" htmlFor="auth-login-password">
                Password
              </label>
              <input
                className="form-control"
                id="auth-login-password"
                name="password"
                type="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </button>
            {loginError && <div className="text-danger small">{loginError}</div>}
          </form>
        ) : (
          <div className="text-muted">
            Sign up form coming next. For now, use Log in to access your account.
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default AuthModal
