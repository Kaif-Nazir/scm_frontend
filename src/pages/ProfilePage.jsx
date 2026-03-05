import { useEffect, useState } from 'react'
import Icon from '../components/Icon.jsx'
import apiClient from '../api/client.js'
import { useAlert } from '../context/AlertContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/pages/ProfilePage.css'

const resolveHasPassword = (payload, fallback = false) => {
  const rawValue = payload?.hasPassword
  if (typeof rawValue === 'boolean') return rawValue
  if (typeof rawValue === 'string') return rawValue.trim().toLowerCase() === 'true'
  if (typeof rawValue === 'number') return rawValue === 1
  return fallback
}

function ProfilePage({ action, onActionHandled }) {
  const { success, error: showError } = useAlert()
  const { setUser, logout } = useAuth()

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    hasPassword: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
  })
  const [updateError, setUpdateError] = useState('')
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
  })
  const [deleteEmail, setDeleteEmail] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const minPasswordLength = 6
  const requiresInitialPassword = profile.hasPassword === false
  const deleteMatch = deleteEmail.trim().toLowerCase() === profile.email.toLowerCase()
  const isPasswordFormComplete = requiresInitialPassword
    ? [passwordForm.newPassword, passwordForm.confirmPassword].every((value) => value.trim().length > 0)
    : [passwordForm.oldPassword, passwordForm.newPassword, passwordForm.confirmPassword].every((value) => value.trim().length > 0)
  const passwordsMatch = passwordForm.newPassword === passwordForm.confirmPassword
  const hasMinPasswordLength = passwordForm.newPassword.trim().length >= minPasswordLength
  const canSubmitPassword = isPasswordFormComplete && passwordsMatch && hasMinPasswordLength

  useEffect(() => {
    let isMounted = true
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/auth/getUser')
        const payload = response?.data || {}
        if (isMounted) {
          setProfile({
            name: payload?.name || '',
            email: payload?.email || '',
            phoneNumber: payload?.phoneNumber || '',
            hasPassword: resolveHasPassword(payload, false),
          })
          setLoadError('')
        }
      } catch (error) {
        if (isMounted) {
          const message = error?.response?.data?.message || 'Failed to load profile.'
          setLoadError(message)
          showError(message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    fetchProfile()
    return () => {
      isMounted = false
    }
  }, [showError])

  const openEdit = () => {
    setForm({
      name: profile.name,
      phoneNumber: profile.phoneNumber,
    })
    setUpdateError('')
    setIsEditing(true)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const openPasswordModal = () => {
    setPasswordForm({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setPasswordError('')
    setShowPassword({ oldPassword: false, newPassword: false })
    setIsChangingPassword(true)
  }

  useEffect(() => {
    if (action !== 'change-password') return
    if (isLoading) return
    openPasswordModal()
    onActionHandled?.()
  }, [action, isLoading, onActionHandled])

  const handlePasswordChange = (event) => {
    const { name, value } = event.target
    if (passwordError) {
      setPasswordError('')
    }
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    if (!hasMinPasswordLength) {
      const message = `New password must be at least ${minPasswordLength} characters.`
      setPasswordError(message)
      showError(message)
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      const message = 'Passwords do not match.'
      setPasswordError(message)
      showError(message)
      return
    }
    if (!requiresInitialPassword && !passwordForm.oldPassword.trim()) {
      const message = 'Current password is required.'
      setPasswordError(message)
      showError(message)
      return
    }
    setPasswordError('')
    try {
      if (requiresInitialPassword) {
        await apiClient.patch('/auth/users/set-password', {
          newPassword: passwordForm.newPassword,
        })
      } else {
        await apiClient.patch('/auth/users/change-password', {
          currentPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        })
      }
      setProfile((prev) => ({ ...prev, hasPassword: true }))
      setUser((prevUser) => (prevUser ? { ...prevUser, hasPassword: true } : prevUser))
      setIsChangingPassword(false)
      success(requiresInitialPassword ? 'Password set successfully.' : 'Password updated successfully.')
    } catch (error) {
      const status = error?.response?.status
      const serverMessage = error?.response?.data?.message
      const rawMessage = typeof serverMessage === 'string' ? serverMessage : ''
      const looksLikeWrongPassword =
        status === 401 ||
        status === 403 ||
        rawMessage.toLowerCase().includes('current password') ||
        rawMessage.toLowerCase().includes('badrequestexception')
      const message = !requiresInitialPassword && looksLikeWrongPassword
        ? 'Password is incorrect. Try again.'
        : (serverMessage || 'Failed to update password.')
      setPasswordError(message)
      showError(message)
    }
  }

  const openDeleteModal = () => {
    setDeleteEmail('')
    setDeleteError('')
    setIsDeleting(true)
  }

  const handleDeleteSubmit = async (event) => {
    event.preventDefault()
    if (!deleteMatch) {
      const message = 'Email does not match.'
      setDeleteError(message)
      showError(message)
      return
    }
    setDeleteError('')
    try {
      await apiClient.delete('/auth/deleteUser')
      setIsDeleting(false)
      success('Account deleted successfully.')
      logout()
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to delete account.'
      setDeleteError(message)
      showError(message)
    }
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    try {
      const response = await apiClient.patch('/auth/users/update', {
        name: form.name,
        phoneNumber: form.phoneNumber,
      })
      const updated = response.data || {}
      setProfile((prev) => ({
        ...prev,
        name: updated.name ?? form.name,
        phoneNumber: updated.phoneNumber ?? form.phoneNumber,
      }))
      setUser((prevUser) =>
        ({
          ...(prevUser || {}),
          name: updated.name ?? form.name,
          phoneNumber: updated.phoneNumber ?? form.phoneNumber,
          email: (prevUser && prevUser.email) || profile.email || '',
        }),
      )
      setUpdateError('')
      setIsEditing(false)
      success('Profile updated successfully.')
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to update profile.'
      setUpdateError(message)
      showError(message)
    }
  }

  return (
      isLoading ? (
        <div className="text-muted">Loading profile...</div>
      ) : loadError ? (
        <div className="text-danger">{loadError}</div>
      ) : (
      <div className="scm-profile-page">
        <div className="card shadow-sm border-0 scm-profile-card">
          <div className="card-body p-4 scm-profile-card__body">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-4">
            <div>
              <h3 className="fw-semibold mb-1">Profile</h3>
              <p className="text-muted mb-0">Manage your account details.</p>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="text-muted small">Name</div>
              <div className="fw-semibold scm-profile-value">{profile.name}</div>
            </div>
            <div className="col-12 col-md-6">
              <div className="text-muted small">Email</div>
              <div className="fw-semibold scm-profile-value">{profile.email}</div>
            </div>
            <div className="col-12 col-md-6">
              <div className="text-muted small">Phone Number</div>
              <div className="fw-semibold scm-profile-value">{profile.phoneNumber}</div>
            </div>
            <div className="col-12 d-flex flex-wrap gap-2 pt-2">
              <button className="btn btn-outline-primary profile_save_btn profile-action-btn" type="button" onClick={openEdit}>
                Update Details
              </button>
              <button className="btn btn-outline-secondary profile_change_password" type="button" onClick={openPasswordModal}>
                {requiresInitialPassword ? 'Set Password' : 'Change Password'}
              </button>
              <button className="btn btn-outline-danger profile_clear_btn profile-action-btn" type="button" onClick={openDeleteModal}>
                Delete Account
              </button>
            </div>
          </div>
          </div>
        {isEditing && (
            <div className="scm-modal-backdrop scm-profile-backdrop" onClick={() => setIsEditing(false)} role="presentation">
              <div
                  className="scm-modal scm-edit-modal scm-profile-modal"
                  role="dialog"
                  aria-modal="true"
                  onClick={(event) => event.stopPropagation()}
              >
                <div className="scm-modal__header">
                  <h4 className="fw-semibold mb-0">Update Details</h4>
                  <button
                      className="btn btn-sm btn-ghost scm-modal-close-btn"
                      type="button"
                      onClick={() => setIsEditing(false)}
                  >
                    <Icon name="xmark" />
                  </button>
                </div>
                <form className="row g-3 scm-update-form" onSubmit={handleProfileSubmit}>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold" htmlFor="profile-edit-name">
                      Name
                    </label>
                    <input
                        className="form-control"
                        id="profile-edit-name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold" htmlFor="profile-edit-phone">
                      Phone Number
                    </label>
                    <input
                        className="form-control"
                        id="profile-edit-phone"
                        name="phoneNumber"
                        type="tel"
                        minLength={10}
                        maxLength={10}
                        value={form.phoneNumber}
                        onChange={handleChange}
                    />
                  </div>
                  {updateError && (
                    <div className="col-12">
                      <div className="text-danger small">{updateError}</div>
                    </div>
                  )}
                  <div className="col-12 d-flex flex-wrap gap-2 pt-2">
                    <button className="btn btn-outline-primary profile_save_btn" type="submit">
                      Save Changes
                    </button>
                    <button className="btn btn-outline-danger profile_clear_btn" type="button" onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
        {isChangingPassword && (
            <div
                className="scm-modal-backdrop scm-profile-backdrop"
                onClick={() => setIsChangingPassword(false)}
                role="presentation"
            >
              <div
                  className="scm-modal scm-edit-modal scm-profile-modal"
                  role="dialog"
                  aria-modal="true"
                  onClick={(event) => event.stopPropagation()}
              >
                <div className="scm-modal__header">
                  <h4 className="fw-semibold mb-0">{requiresInitialPassword ? 'Set Password' : 'Change Password'}</h4>
                  <button
                      className="btn btn-sm btn-ghost scm-modal-close-btn"
                      type="button"
                      onClick={() => setIsChangingPassword(false)}
                  >
                    <Icon name="xmark" />
                  </button>
                </div>
                <form className="row g-3 scm-update-form" onSubmit={handlePasswordSubmit}>
                  {!requiresInitialPassword && (
                    <div className="col-12">
                      <label className="form-label fw-semibold" htmlFor="profile-old-password">
                        Old Password
                      </label>
                      <div className="input-group">
                        <input
                            className="form-control"
                            id="profile-old-password"
                            name="oldPassword"
                            type={showPassword.oldPassword ? 'text' : 'password'}
                            value={passwordForm.oldPassword}
                            onChange={handlePasswordChange}
                        />
                        <button
                            className="btn btn-outline-secondary profile-password-toggle"
                            type="button"
                            onClick={() =>
                                setShowPassword((prev) => ({
                                  ...prev,
                                  oldPassword: !prev.oldPassword,
                                }))
                            }
                            aria-label={showPassword.oldPassword ? 'Hide password' : 'Show password'}
                        >
                          <Icon name={showPassword.oldPassword ? 'eye-slash' : 'eye'} />
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="col-12">
                    <label className="form-label fw-semibold" htmlFor="profile-new-password">
                      New Password
                    </label>
                    <div className="input-group">
                      <input
                          className="form-control"
                          id="profile-new-password"
                          name="newPassword"
                          type={showPassword.newPassword ? 'text' : 'password'}
                          minLength={minPasswordLength}
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                      />
                      <button
                          className="btn btn-outline-secondary profile-password-toggle"
                          type="button"
                          onClick={() =>
                              setShowPassword((prev) => ({
                                ...prev,
                                newPassword: !prev.newPassword,
                              }))
                          }
                          aria-label={showPassword.newPassword ? 'Hide password' : 'Show password'}
                      >
                        <Icon name={showPassword.newPassword ? 'eye-slash' : 'eye'} />
                      </button>
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold" htmlFor="profile-confirm-password">
                      Confirm Password
                    </label>
                    <input
                        className="form-control"
                        id="profile-confirm-password"
                        name="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                    />
                    {passwordError && <div className="text-danger small mt-2">{passwordError}</div>}
                    <div className="text-muted small mt-2">
                      {requiresInitialPassword
                        ? `Set a password with at least ${minPasswordLength} characters.`
                        : `To enable this button, fill all fields. New password must be at least ${minPasswordLength} characters.`}
                    </div>
                  </div>
                  <div className="col-12 d-flex flex-wrap gap-2 pt-2">
                    <button
                      className="btn btn-outline-primary profile_save_btn"
                      type="submit"
                      disabled={!canSubmitPassword}
                    >
                      {requiresInitialPassword ? 'Set Password' : 'Update Password'}
                    </button>
                    <button
                        className="btn btn-outline-danger profile_clear_btn"
                        type="button"
                        onClick={() => setIsChangingPassword(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
        {isDeleting && (
            <div className="scm-modal-backdrop scm-profile-backdrop" onClick={() => setIsDeleting(false)} role="presentation">
              <div
                  className="scm-modal scm-edit-modal scm-profile-modal"
                  role="dialog"
                  aria-modal="true"
                  onClick={(event) => event.stopPropagation()}
              >
                <div className="scm-modal__header">
                  <h4 className="fw-semibold mb-0">Delete Account</h4>
                  <button
                      className="btn btn-sm btn-ghost scm-modal-close-btn"
                      type="button"
                      onClick={() => setIsDeleting(false)}
                  >
                    <Icon name="xmark" />
                  </button>
                </div>
                <p className="text-muted">
                  Type your email to confirm permanent deletion of your account.
                </p>
                <form className="row g-3 scm-update-form" onSubmit={handleDeleteSubmit}>
                  <div className="col-12">
                    <label className="form-label fw-semibold" htmlFor="profile-delete-email">
                      Email
                    </label>
                    <input
                        className="form-control"
                        id="profile-delete-email"
                        name="deleteEmail"
                        type="email"
                        value={deleteEmail}
                        onChange={(event) => setDeleteEmail(event.target.value)}
                    />
                    <div className="text-muted small mt-2">
                      Enter correct email to enable account deletion.
                    </div>
                    {deleteError && <div className="text-danger small mt-2">{deleteError}</div>}
                  </div>
                  <div className="col-12 d-flex flex-wrap gap-2 pt-2">
                    <button
                        className="btn btn-outline-danger profile_clear_btn"
                        type="submit"
                        disabled={!deleteMatch}
                    >
                      Delete Account
                    </button>
                    <button className="btn btn-outline-primary profile_save_btn" type="button" onClick={() => setIsDeleting(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
        </div>
      </div>
      )
  )
}

export default ProfilePage
