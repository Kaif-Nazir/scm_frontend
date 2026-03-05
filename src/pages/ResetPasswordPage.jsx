import { useMemo, useState } from 'react'
import apiClient from '../api/client.js'
import { useAlert } from '../context/AlertContext.jsx'
import { appEnv } from '../config/env.js'
import '../styles/pages/ResetPasswordPage.css'

const resetPasswordEndpoint = appEnv.resetPasswordEndpoint

function ResetPasswordPage() {
  const { success, error: showError } = useAlert()
  const emailFromQuery = useMemo(() => new URLSearchParams(window.location.search).get('email') || '', [])
  const otpFromQuery = useMemo(() => new URLSearchParams(window.location.search).get('otp') || '', [])
  const [email, setEmail] = useState(emailFromQuery)
  const [otp, setOtp] = useState(otpFromQuery)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!email.trim()) {
      showError('Please enter your email.')
      return
    }

    if (!otp.trim()) {
      showError('Please enter OTP.')
      return
    }

    if (otp.trim().length !== 4) {
      showError('OTP must be 4 characters.')
      return
    }

    if (!newPassword || !confirmPassword) {
      showError('Please fill in both password fields.')
      return
    }

    if (newPassword !== confirmPassword) {
      showError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      }
      const response = await apiClient.post(resetPasswordEndpoint, payload)
      success(response?.data || 'Password has been reset successfully.')
      setIsDone(true)
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data || error?.message || 'Failed to reset password.'
      showError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="scm-reset-page container py-5">
      <section className="scm-reset-card">
        <h1>Reset Password</h1>
        <p className="scm-reset-subtitle">
          Enter your email, OTP, and new password.
        </p>

        {isDone ? (
          <div className="scm-reset-success">
            Your password is updated. You can return to sign in.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="scm-reset-form">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="otp">OTP</label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              maxLength={4}
              required
            />

            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />

            <label htmlFor="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}

export default ResetPasswordPage
