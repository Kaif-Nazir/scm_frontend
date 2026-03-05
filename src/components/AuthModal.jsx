import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useAlert } from '../context/AlertContext.jsx'
import apiClient from '../api/client.js'
import { appEnv } from '../config/env.js'
import '../styles/components/AuthModal.css'

function AuthModal({ isOpen, activeTab, onClose, onTabChange }) {
  const googleAuthUrl = appEnv.googleAuthUrl
  const otpLength = 5
  const resetOtpLength = 4
  const { login } = useAuth()
  const { success, info, error: showError } = useAlert()
  const otpInputRefs = useRef([])
  const resetOtpInputRefs = useRef([])
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' })
  const [verifyForm, setVerifyForm] = useState({ email: '', token: '' })
  const [resetForm, setResetForm] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' })
  const [isVerificationStep, setIsVerificationStep] = useState(false)
  const [isResetStep, setIsResetStep] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [signupError, setSignupError] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false)
  const [isSignupSubmitting, setIsSignupSubmitting] = useState(false)
  const [isVerifySubmitting, setIsVerifySubmitting] = useState(false)
  const [isResendSubmitting, setIsResendSubmitting] = useState(false)
  const [isResetSubmitting, setIsResetSubmitting] = useState(false)
  const [isResetUpdateSubmitting, setIsResetUpdateSubmitting] = useState(false)
  const [showPasswords, setShowPasswords] = useState({ login: false, signup: false })
  const [rememberMe, setRememberMe] = useState(true)

  const storeBrowserCredential = async (email, password, displayName = '') => {
    try {
      if (!email || !password) return
      if (!window.PasswordCredential || !navigator.credentials?.store) return
      const credential = new window.PasswordCredential({
        id: email,
        password,
        name: displayName || email,
      })
      await navigator.credentials.store(credential)
    } catch {
      // Ignore unsupported/blocked credential storage.
    }
  }

  const asText = (value) => {
    if (typeof value === 'string') return value
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    if (value && typeof value === 'object') {
      if (typeof value.message === 'string') return value.message
      try {
        return JSON.stringify(value)
      } catch {
        return ''
      }
    }
    return ''
  }

  const getMessage = (fallback, ...candidates) => {
    for (const candidate of candidates) {
      const value = asText(candidate).trim()
      if (value) return value
    }
    return fallback
  }

  const shouldOpenVerificationStep = (message) => {
    const value = (message || '').toLowerCase()
    return (
        value.includes('not verified') ||
        value.includes('unverified') ||
        value.includes('verify your email') ||
        (value.includes('already exists') && value.includes('verify'))
    )
  }

  const normalizeForMatch = (value) => (value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ')

  const isUnverifiedText = (value) => {
    const text = normalizeForMatch(value)
    return (
        text.includes('not verified') ||
        text.includes('notverified') ||
        text.includes('unverified') ||
        text.includes('email not verified') ||
        text.includes('email notverified') ||
        text.includes('email_not_verified') ||
        text.includes('not_verified') ||
        text.includes('verification pending') ||
        text.includes('verify your email') ||
        text.includes('email verification') ||
        text.includes('verification required') ||
        text.includes('otp')
    )
  }

  const hasUnverifiedSignal = (status, data, message) => {
    void status
    if (isUnverifiedText(message)) return true
    const packed = normalizeForMatch(asText(data))
    return isUnverifiedText(packed)
  }

  const openVerificationStep = (email, alertMessage) => {
    const normalizedEmail = (email || '').trim()
    setIsResetStep(false)
    setIsVerificationStep(true)
    setVerifyError('')
    setVerifyForm({ email: normalizedEmail, token: '' })
    if (alertMessage) info(alertMessage)
  }

  useEffect(() => {
    if (!isOpen) {
      setIsVerificationStep(false)
      setIsResetStep(false)
      setLoginError('')
      setSignupError('')
      setVerifyError('')
      setResetForm({ email: '', otp: '', newPassword: '', confirmPassword: '' })
      setVerifyForm({ email: '', token: '' })
      setRememberMe(true)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isVerificationStep) return
    const focusIndex = Math.min((verifyForm.token || '').length, otpLength - 1)
    window.requestAnimationFrame(() => {
      otpInputRefs.current[focusIndex]?.focus()
    })
  }, [isVerificationStep, verifyForm.token, otpLength])

  useEffect(() => {
    if (!isResetStep) return
    const focusIndex = Math.min((resetForm.otp || '').length, resetOtpLength - 1)
    window.requestAnimationFrame(() => {
      resetOtpInputRefs.current[focusIndex]?.focus()
    })
  }, [isResetStep, resetForm.otp, resetOtpLength])

  if (!isOpen) {
    return null
  }

  const handleLoginChange = (event) => {
    const { name, value } = event.target
    setLoginForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSignupChange = (event) => {
    const { name, value } = event.target
    if (signupError) setSignupError('')
    setSignupForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleVerifyChange = (event) => {
    const { name, value } = event.target
    if (verifyError) setVerifyError('')
    setVerifyForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleResetChange = (event) => {
    const { name, value } = event.target
    if (verifyError) setVerifyError('')
    setResetForm((prev) => ({ ...prev, [name]: value }))
  }

  const sanitizeOtp = (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, '')

  const setOtpAt = (index, rawValue) => {
    const chars = sanitizeOtp(rawValue).slice(0, otpLength)
    if (!chars && index >= otpLength) return

    setVerifyForm((prev) => {
      const next = Array.from({ length: otpLength }, (_, slot) => prev.token[slot] || '')
      if (!chars) {
        next[index] = ''
      } else {
        chars.split('').forEach((char, offset) => {
          const target = index + offset
          if (target < otpLength) next[target] = char
        })
      }
      return { ...prev, token: next.join('') }
    })

    const nextIndex = chars ? Math.min(index + chars.length, otpLength - 1) : index
    window.requestAnimationFrame(() => {
      otpInputRefs.current[nextIndex]?.focus()
    })
  }

  const handleOtpChange = (index, event) => {
    if (verifyError) setVerifyError('')
    setOtpAt(index, event.target.value)
  }

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      otpInputRefs.current[index - 1]?.focus()
      return
    }
    if (event.key === 'ArrowRight' && index < otpLength - 1) {
      event.preventDefault()
      otpInputRefs.current[index + 1]?.focus()
      return
    }
    if (event.key !== 'Backspace') return

    event.preventDefault()
    setVerifyForm((prev) => {
      const next = Array.from({ length: otpLength }, (_, slot) => prev.token[slot] || '')
      if (next[index]) {
        next[index] = ''
      } else if (index > 0) {
        next[index - 1] = ''
      }
      return { ...prev, token: next.join('') }
    })

    const targetIndex = verifyForm.token[index] ? index : Math.max(0, index - 1)
    window.requestAnimationFrame(() => {
      otpInputRefs.current[targetIndex]?.focus()
    })
  }

  const handleOtpPaste = (event) => {
    event.preventDefault()
    if (verifyError) setVerifyError('')
    const pasted = sanitizeOtp(event.clipboardData.getData('text')).slice(0, otpLength)
    if (!pasted) return

    setVerifyForm((prev) => ({ ...prev, token: pasted }))
    const focusIndex = Math.min(pasted.length, otpLength - 1)
    window.requestAnimationFrame(() => {
      otpInputRefs.current[focusIndex]?.focus()
    })
  }

  const setResetOtpAt = (index, rawValue) => {
    const chars = sanitizeOtp(rawValue).slice(0, resetOtpLength)
    if (!chars && index >= resetOtpLength) return

    setResetForm((prev) => {
      const next = Array.from({ length: resetOtpLength }, (_, slot) => prev.otp[slot] || '')
      if (!chars) {
        next[index] = ''
      } else {
        chars.split('').forEach((char, offset) => {
          const target = index + offset
          if (target < resetOtpLength) next[target] = char
        })
      }
      return { ...prev, otp: next.join('') }
    })

    const nextIndex = chars ? Math.min(index + chars.length, resetOtpLength - 1) : index
    window.requestAnimationFrame(() => {
      resetOtpInputRefs.current[nextIndex]?.focus()
    })
  }

  const handleResetOtpChange = (index, event) => {
    if (verifyError) setVerifyError('')
    setResetOtpAt(index, event.target.value)
  }

  const handleResetOtpKeyDown = (index, event) => {
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      resetOtpInputRefs.current[index - 1]?.focus()
      return
    }
    if (event.key === 'ArrowRight' && index < resetOtpLength - 1) {
      event.preventDefault()
      resetOtpInputRefs.current[index + 1]?.focus()
      return
    }
    if (event.key !== 'Backspace') return

    event.preventDefault()
    setResetForm((prev) => {
      const next = Array.from({ length: resetOtpLength }, (_, slot) => prev.otp[slot] || '')
      if (next[index]) {
        next[index] = ''
      } else if (index > 0) {
        next[index - 1] = ''
      }
      return { ...prev, otp: next.join('') }
    })

    const targetIndex = resetForm.otp[index] ? index : Math.max(0, index - 1)
    window.requestAnimationFrame(() => {
      resetOtpInputRefs.current[targetIndex]?.focus()
    })
  }

  const handleResetOtpPaste = (event) => {
    event.preventDefault()
    if (verifyError) setVerifyError('')
    const pasted = sanitizeOtp(event.clipboardData.getData('text')).slice(0, resetOtpLength)
    if (!pasted) return

    setResetForm((prev) => ({ ...prev, otp: pasted }))
    const focusIndex = Math.min(pasted.length, resetOtpLength - 1)
    window.requestAnimationFrame(() => {
      resetOtpInputRefs.current[focusIndex]?.focus()
    })
  }

  const requestVerificationCode = async (email, options = {}) => {
    const { autoTriggered = false } = options
    const trimmedEmail = (email || '').trim()

    if (!trimmedEmail) {
      const message = 'Enter your email to resend OTP.'
      setVerifyError(message)
      showError(message)
      return false
    }

    setIsResendSubmitting(true)
    try {
      const response = await apiClient.post('/auth/resend/verify-email', { email: trimmedEmail })
      if (autoTriggered) {
        info('Email not verified. OTP sent to your email.')
      } else {
        success(getMessage('OTP sent to your email.', response?.data?.message, response?.data))
      }
      return true
    } catch (error) {
      const message = getMessage(
          'Could not send OTP. Try again.',
          error?.response?.data?.message,
          error?.response?.data,
          error?.message,
      )
      setVerifyError(message)
      showError(message)
      return false
    } finally {
      setIsResendSubmitting(false)
    }
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setIsLoginSubmitting(true)
    setLoginError('')
    try {
      const response = await apiClient.post('/auth/login', loginForm)
      const payload = response.data
      const payloadMessage = getMessage('', payload?.message, payload)

      if (!payload?.user || !payload?.token) {
        if (hasUnverifiedSignal(response?.status, payload, payloadMessage)) {
          const email = loginForm.email.trim()
          openVerificationStep(email)
          await requestVerificationCode(email, { autoTriggered: true })
          return
        }
        throw new Error(payloadMessage || 'Login failed. Check your credentials.')
      }

      await storeBrowserCredential(loginForm.email.trim(), loginForm.password, payload?.user?.name)
      login(payload.user, payload.token, { remember: rememberMe })
      success('Logged in.')
      onClose?.()
    } catch (error) {
      const message = getMessage(
          'Login failed. Check your email and password.',
          error?.response?.data?.message,
          error?.response?.data,
          error?.message,
      )
      const status = error?.response?.status
      if (shouldOpenVerificationStep(message) || hasUnverifiedSignal(status, error?.response?.data, message)) {
        const email = loginForm.email.trim()
        openVerificationStep(email)
        await requestVerificationCode(email, { autoTriggered: true })
        return
      }
      setLoginError(message)
      showError(message)
    } finally {
      setIsLoginSubmitting(false)
    }
  }

  const handleSignupSubmit = async (event) => {
    event.preventDefault()
    const trimmedName = signupForm.name.trim()
    const trimmedEmail = signupForm.email.trim()

    if (!trimmedName || !trimmedEmail || !signupForm.password) {
      const message = 'Fill all required fields.'
      setSignupError(message)
      showError(message)
      return
    }

    if (signupForm.password.length < 6) {
      const message = 'Password must be at least 6 characters.'
      setSignupError(message)
      showError(message)
      return
    }

    setIsSignupSubmitting(true)
    try {
      await apiClient.post('/auth/createUser', {
        name: trimmedName,
        email: trimmedEmail,
        password: signupForm.password,
      })

      setIsVerificationStep(true)
      setVerifyError('')
      setVerifyForm({ email: trimmedEmail, token: '' })
      success('Account created. Verify your email to use the service.')
    } catch (error) {
      const message = getMessage('Sign up failed.', error?.response?.data?.message, error?.response?.data, error?.message)
      if (shouldOpenVerificationStep(message)) {
        openVerificationStep(trimmedEmail, 'Email not verified. Enter OTP to continue.')
        return
      }
      setSignupError(message)
      showError(message)
    } finally {
      setIsSignupSubmitting(false)
    }
  }

  const handleVerifySubmit = async (event) => {
    event.preventDefault()
    const otp = sanitizeOtp(verifyForm.token).slice(0, otpLength)

    if (!new RegExp(`^[A-Z0-9]{${otpLength}}$`).test(otp)) {
      const message = `Enter a valid ${otpLength}-character OTP.`
      setVerifyError(message)
      showError(message)
      return
    }

    setIsVerifySubmitting(true)
    try {
      const response = await apiClient.get('/auth/verify-email', {
        params: { token: otp },
      })
      success(getMessage('Email verified. You can sign in now.', response?.data?.message, response?.data))
      setLoginForm((prev) => ({ ...prev, email: verifyForm.email.trim() }))
      setIsVerificationStep(false)
      setVerifyError('')
      setVerifyForm((prev) => ({ ...prev, token: '' }))
      onTabChange?.('login')
    } catch (error) {
      const message = getMessage(
          'Invalid or expired OTP.',
          error?.response?.data?.message,
          error?.response?.data,
          error?.message,
      )
      setVerifyError(message)
      showError(message)
    } finally {
      setIsVerifySubmitting(false)
    }
  }

  const handleResendVerification = async (event) => {
    event.preventDefault()
    await requestVerificationCode(verifyForm.email)
  }

  const handleForgotPassword = async (event) => {
    event.preventDefault()
    const email = loginForm.email?.trim()
    if (!email) {
      showError('Enter your email first.')
      return
    }

    setIsResetSubmitting(true)
    try {
      const response = await apiClient.post('/auth/forgot-password', { email })
      success(getMessage('OTP sent to your email.', response?.data?.message, response?.data))
      setIsVerificationStep(false)
      setIsResetStep(true)
      setVerifyError('')
      setResetForm((prev) => ({ ...prev, email, otp: '' }))
    } catch (error) {
      const message = getMessage(
          'Could not send OTP. Try again.',
          error?.response?.data?.message,
          error?.response?.data,
          error?.message,
      )
      showError(message)
    } finally {
      setIsResetSubmitting(false)
    }
  }

  const handleResetPasswordSubmit = async (event) => {
    event.preventDefault()
    const email = resetForm.email.trim()
    const otp = sanitizeOtp(resetForm.otp).slice(0, resetOtpLength)
    const newPassword = resetForm.newPassword
    const confirmPassword = resetForm.confirmPassword

    if (!email) {
      const message = 'Please enter your email.'
      setVerifyError(message)
      showError(message)
      return
    }
    if (!new RegExp(`^[A-Z0-9]{${resetOtpLength}}$`).test(otp)) {
      const message = `Enter a valid ${resetOtpLength}-character OTP.`
      setVerifyError(message)
      showError(message)
      return
    }
    if (!newPassword || !confirmPassword) {
      const message = 'Please fill in both password fields.'
      setVerifyError(message)
      showError(message)
      return
    }
    if (newPassword.length < 6) {
      const message = 'Password must be at least 6 characters.'
      setVerifyError(message)
      showError(message)
      return
    }
    if (newPassword !== confirmPassword) {
      const message = 'Passwords do not match.'
      setVerifyError(message)
      showError(message)
      return
    }

    setIsResetUpdateSubmitting(true)
    try {
      const response = await apiClient.post('/auth/reset-password', { email, otp, newPassword })
      success(getMessage('Password has been reset successfully.', response?.data?.message, response?.data))
      setLoginForm((prev) => ({ ...prev, email }))
      setIsResetStep(false)
      setVerifyError('')
      setResetForm({ email: '', otp: '', newPassword: '', confirmPassword: '' })
      onTabChange?.('login')
    } catch (error) {
      const message = getMessage(
          'Failed to reset password.',
          error?.response?.data?.message,
          error?.response?.data,
          error?.message,
      )
      setVerifyError(message)
      showError(message)
    } finally {
      setIsResetUpdateSubmitting(false)
    }
  }

  const handleResendResetOtp = async () => {
    const email = resetForm.email.trim()
    if (!email) {
      const message = 'Enter your email to resend OTP.'
      setVerifyError(message)
      showError(message)
      return
    }

    setIsResendSubmitting(true)
    try {
      const response = await apiClient.post('/auth/forgot-password', { email })
      success(getMessage('OTP sent to your email.', response?.data?.message, response?.data))
    } catch (error) {
      const message = getMessage(
          'Could not send OTP. Try again.',
          error?.response?.data?.message,
          error?.response?.data,
          error?.message,
      )
      setVerifyError(message)
      showError(message)
    } finally {
      setIsResendSubmitting(false)
    }
  }

  const isSignupActive = activeTab === 'signup'

  return createPortal(
      <div className="scm-modal-backdrop" onClick={onClose} role="presentation">
        <div
            className={`scm-auth-modal-shell ${isSignupActive ? 'is-signup' : 'is-signin'}`}
            role="dialog"
            aria-modal="true"
            aria-label="Authentication"
            onClick={(event) => event.stopPropagation()}
        >
          <button className="scm-auth-close" type="button" onClick={onClose} aria-label="Close login form">
            <Icon name="xmark" />
          </button>

          <div className={`scm-auth-slider ${isSignupActive ? 'right-panel-active' : ''}`}>
            <div className="scm-auth-form-container scm-auth-sign-up-container">
              <form onSubmit={handleSignupSubmit} autoComplete="on">
                <h1>Create Account</h1>
                <div className="scm-auth-social-container">
                  <a href={googleAuthUrl} className="scm-auth-social scm-auth-social--google" aria-label="Sign up with Google">
                    <Icon name="google" />
                  </a>
                  </div>
                <span>or use your email for registration</span>
                <input
                    name="name"
                    type="text"
                    placeholder="Name"
                    autoComplete="name"
                    value={signupForm.name}
                    onChange={handleSignupChange}
                    required
                />
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    value={signupForm.email}
                    onChange={handleSignupChange}
                    required
                />
                <div className="scm-auth-password-wrap">
                  <input
                      name="password"
                      type={showPasswords.signup ? 'text' : 'password'}
                      placeholder="Password"
                      autoComplete="new-password"
                      value={signupForm.password}
                      onChange={handleSignupChange}
                      minLength={6}
                      required
                  />
                  <button
                      className="scm-auth-password-toggle"
                      type="button"
                      aria-label={showPasswords.signup ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPasswords((prev) => ({ ...prev, signup: !prev.signup }))}
                  >
                    <Icon name={showPasswords.signup ? 'eye-slash' : 'eye'} />
                  </button>
                </div>
                <button
                    className="btn btn-outline-primary scm-auth-cta-btn scm-auth-signup-submit"
                    type="submit"
                    disabled={isSignupSubmitting}
                >
                  {isSignupSubmitting ? 'Creating Account...' : 'Sign Up'}
                </button>
                {signupError && <div className="scm-auth-login-error">{signupError}</div>}
              </form>
            </div>

            <div className="scm-auth-form-container scm-auth-sign-in-container">
              <form onSubmit={handleLoginSubmit} autoComplete="on">
                <h1>Sign in</h1>
                <div className="scm-auth-social-container">
                  <a href={googleAuthUrl} className="scm-auth-social scm-auth-social--google" aria-label="Sign in with Google">
                    <Icon name="google" />
                  </a>
                </div>
                <span>or use your account</span>
                <div className="scm-auth-demo-credentials" aria-label="Demo login credentials">
                  <strong>Demo Login</strong>
                  <span>Email: user@gmail.com</span>
                  <span>Password: 123456</span>
                </div>
                <input
                    id="auth-login-email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    autoComplete="username"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    required
                />
                <div className="scm-auth-password-wrap">
                  <input
                      id="auth-login-password"
                      name="password"
                      type={showPasswords.login ? 'text' : 'password'}
                      placeholder="Password"
                      autoComplete="current-password"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      required
                  />
                  <button
                      className="scm-auth-password-toggle"
                      type="button"
                      aria-label={showPasswords.login ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPasswords((prev) => ({ ...prev, login: !prev.login }))}
                  >
                    <Icon name={showPasswords.login ? 'eye-slash' : 'eye'} />
                  </button>
                </div>
                <div className="scm-auth-login-options">
                  <label className="scm-auth-remember">
                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.target.checked)}
                    />
                    <span className="scm-auth-remember__copy">
                    <strong>Remember Me</strong>
                  </span>
                  </label>
                  <a
                      href="#!"
                      className={isResetSubmitting ? 'is-disabled' : undefined}
                      onClick={handleForgotPassword}
                      aria-disabled={isResetSubmitting}
                  >
                    {isResetSubmitting ? 'Sending OTP...' : 'Forgot Your Password?'}
                  </a>
                </div>
                <button
                    className="btn btn-outline-primary scm-auth-cta-btn scm-auth-signin-submit"
                    type="submit"
                    disabled={isLoginSubmitting}
                >
                  {isLoginSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
                {loginError && <div className="scm-auth-login-error">{loginError}</div>}
              </form>
            </div>

            <div className="scm-auth-overlay-container">
              <div className="scm-auth-overlay">
                <div className="scm-auth-overlay-panel scm-auth-overlay-left">
                  <h1>Welcome Back</h1>
                  <p>To keep connected with us please login with your personal info</p>
                  <button
                      className="ghost"
                      type="button"
                      onClick={() => {
                        setIsVerificationStep(false)
                        onTabChange?.('login')
                      }}
                  >
                    <Icon className="scm-auth-arrow scm-auth-arrow--left" name="arrow-left" />
                    Sign In
                  </button>
                </div>

                <div className="scm-auth-overlay-panel scm-auth-overlay-right">
                  <h1>Hello, Friend!</h1>
                  <p>Enter your personal details and start journey with us</p>
                  <button
                      className="ghost"
                      type="button"
                      onClick={() => {
                        setIsVerificationStep(false)
                        onTabChange?.('signup')
                      }}
                  >
                    Sign Up
                    <Icon className="scm-auth-arrow scm-auth-arrow--right" name="arrow-right" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isVerificationStep && (
              <div className="scm-auth-verify-backdrop" role="presentation">
                <form className="scm-auth-verify-popup" onSubmit={handleVerifySubmit}>
                  <h2>Verify Email</h2>
                  <p>Enter the OTP sent to your email.</p>
                  <input name="email" type="email" value={verifyForm.email} onChange={handleVerifyChange} />
                  <div className="scm-auth-otp-row" onPaste={handleOtpPaste}>
                    {Array.from({ length: otpLength }, (_, index) => (
                        <input
                            key={index}
                            className="scm-auth-otp-box"
                            type="text"
                            inputMode="text"
                            autoComplete="one-time-code"
                            placeholder="_"
                            aria-label={`OTP character ${index + 1}`}
                            value={verifyForm.token[index] || ''}
                            onChange={(event) => handleOtpChange(index, event)}
                            onKeyDown={(event) => handleOtpKeyDown(index, event)}
                            maxLength={1}
                            ref={(element) => {
                              otpInputRefs.current[index] = element
                            }}
                            required
                        />
                    ))}
                  </div>
                  <button type="submit" disabled={isVerifySubmitting}>
                    {isVerifySubmitting ? 'Verifying...' : 'Verify Email'}
                  </button>
                  <button className="ghost" type="button" disabled={isResendSubmitting} onClick={handleResendVerification}>
                    {isResendSubmitting ? 'Resending...' : 'Resend Email'}
                  </button>
                  <button
                      className="ghost"
                      type="button"
                      onClick={() => {
                        setIsVerificationStep(false)
                        setVerifyError('')
                      }}
                  >
                    Cancel
                  </button>
                  {verifyError && <div className="scm-auth-login-error">{verifyError}</div>}
                </form>
              </div>
          )}

          {isResetStep && (
              <div className="scm-auth-verify-backdrop" role="presentation">
                <form className="scm-auth-verify-popup" onSubmit={handleResetPasswordSubmit}>
                  <h2>Reset Password</h2>
                  <p>Enter email, OTP, and your new password.</p>
                  <input
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={resetForm.email}
                      onChange={handleResetChange}
                      required
                  />
                  <div className="scm-auth-otp-row scm-auth-otp-row--reset" onPaste={handleResetOtpPaste}>
                    {Array.from({ length: resetOtpLength }, (_, index) => (
                        <input
                            key={index}
                            className="scm-auth-otp-box"
                            type="text"
                            inputMode="text"
                            autoComplete="one-time-code"
                            placeholder="_"
                            aria-label={`Reset OTP character ${index + 1}`}
                            value={resetForm.otp[index] || ''}
                            onChange={(event) => handleResetOtpChange(index, event)}
                            onKeyDown={(event) => handleResetOtpKeyDown(index, event)}
                            maxLength={1}
                            ref={(element) => {
                              resetOtpInputRefs.current[index] = element
                            }}
                            required
                        />
                    ))}
                  </div>
                  <input
                      name="newPassword"
                      type="password"
                      placeholder="New password"
                      value={resetForm.newPassword}
                      onChange={handleResetChange}
                      minLength={6}
                      required
                  />
                  <input
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={resetForm.confirmPassword}
                      onChange={handleResetChange}
                      minLength={6}
                      required
                  />
                  <button type="submit" disabled={isResetUpdateSubmitting}>
                    {isResetUpdateSubmitting ? 'Resetting...' : 'Reset Password'}
                  </button>
                  <button className="ghost" type="button" disabled={isResendSubmitting} onClick={handleResendResetOtp}>
                    {isResendSubmitting ? 'Resending...' : 'Resend OTP'}
                  </button>
                  <button
                      className="ghost"
                      type="button"
                      onClick={() => {
                        setIsResetStep(false)
                        setVerifyError('')
                      }}
                  >
                    Cancel
                  </button>
                  {verifyError && <div className="scm-auth-login-error">{verifyError}</div>}
                </form>
              </div>
          )}
        </div>
      </div>,
      document.body,
  )
}

export default AuthModal
