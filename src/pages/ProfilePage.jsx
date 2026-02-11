import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash, faXmark } from '@fortawesome/free-solid-svg-icons'
import apiClient from '../api/client.js'

function ProfilePage({ action, onActionHandled }) {

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phoneNumber: '',
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
  const deleteMatch = deleteEmail.trim().toLowerCase() === profile.email.toLowerCase()

  useEffect(() => {
    let isMounted = true
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/auth/getUser')
        if (isMounted) {
          setProfile({
            name: response.data?.name || '',
            email: response.data?.email || '',
            phoneNumber: response.data?.phoneNumber || '',
          })
          setLoadError('')
        }
        console.log(response);
      } catch (error) {
        if (isMounted) {
          setLoadError(error?.response?.data?.message || 'Failed to load profile.')
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
  }, [])

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
    if (action === 'change-password') {
      openPasswordModal()
      onActionHandled?.()
    }
  }, [action, onActionHandled])

  const handlePasswordChange = (event) => {
    const { name, value } = event.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordSubmit = (event) => {
    event.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }
    setPasswordError('')
    apiClient
      .patch('/auth/users/change-password', {
        currentPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      })
      .then(() => {
        setIsChangingPassword(false)
      })
      .catch((error) => {
        setPasswordError(error?.response?.data?.message || 'Failed to update password.')
      })
  }

  const openDeleteModal = () => {
    setDeleteEmail('')
    setDeleteError('')
    setIsDeleting(true)
  }

  const handleDeleteSubmit = (event) => {
    event.preventDefault()
    if (!deleteMatch) {
      setDeleteError('Email does not match.')
      return
    }
    setDeleteError('')
    apiClient
      .delete('/auth/delete')
      .then(() => {
        setIsDeleting(false)
      })
      .catch((error) => {
        setDeleteError(error?.response?.data?.message || 'Failed to delete account.')
      })
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
      setUpdateError('')
      setIsEditing(false)
    } catch (error) {
      setUpdateError(error?.response?.data?.message || 'Failed to update profile.')
    }
  }

  return (
      isLoading ? (
        <div className="text-muted">Loading profile...</div>
      ) : loadError ? (
        <div className="text-danger">{loadError}</div>
      ) : (
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-4">
            <div>
              <h3 className="fw-semibold mb-1">Profile</h3>
              <p className="text-muted mb-0">Manage your account details.</p>
            </div>
          </div>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="text-muted small">Name</div>
              <div className="fw-semibold">{profile.name}</div>
            </div>
            <div className="col-12 col-md-6">
              <div className="text-muted small">Email</div>
              <div className="fw-semibold">{profile.email}</div>
            </div>
            <div className="col-12 col-md-6">
              <div className="text-muted small">Phone Number</div>
              <div className="fw-semibold">{profile.phoneNumber}</div>
            </div>
            <div className="col-12 d-flex flex-wrap gap-2 pt-2">
              <button className="btn btn-primary" type="button" onClick={openEdit}>
                Update Details
              </button>
              <button className="btn btn-outline-secondary" type="button" onClick={openPasswordModal}>
                Change Password
              </button>
              <button className="btn btn-outline-danger" type="button" onClick={openDeleteModal}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
        {isEditing && (
            <div className="scm-modal-backdrop" onClick={() => setIsEditing(false)} role="presentation">
              <div
                  className="scm-modal"
                  role="dialog"
                  aria-modal="true"
                  onClick={(event) => event.stopPropagation()}
              >
                <div className="scm-modal__header">
                  <h4 className="fw-semibold mb-0">Update Details</h4>
                  <button
                      className="btn btn-sm btn-ghost"
                      type="button"
                      onClick={() => setIsEditing(false)}
                  >
                    <FontAwesomeIcon icon={faXmark}/>
                  </button>
                </div>
                <form className="row g-3" onSubmit={handleProfileSubmit}>
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
                    <button className="btn btn-primary" type="submit">
                      Save Changes
                    </button>
                    <button className="btn btn-ghost" type="button" onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
        {isChangingPassword && (
            <div
                className="scm-modal-backdrop"
                onClick={() => setIsChangingPassword(false)}
                role="presentation"
            >
              <div
                  className="scm-modal"
                  role="dialog"
                  aria-modal="true"
                  onClick={(event) => event.stopPropagation()}
              >
                <div className="scm-modal__header">
                  <h4 className="fw-semibold mb-0">Change Password</h4>
                  <button
                      className="btn btn-sm btn-ghost"
                      type="button"
                      onClick={() => setIsChangingPassword(false)}
                  >
                    <FontAwesomeIcon icon={faXmark}/>
                  </button>
                </div>
                <form className="row g-3" onSubmit={handlePasswordSubmit}>
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
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() =>
                              setShowPassword((prev) => ({
                                ...prev,
                                oldPassword: !prev.oldPassword,
                              }))
                          }
                          aria-label={showPassword.oldPassword ? 'Hide password' : 'Show password'}
                      >
                        <FontAwesomeIcon icon={showPassword.oldPassword ? faEyeSlash : faEye}/>
                      </button>
                    </div>
                  </div>
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
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                      />
                      <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() =>
                              setShowPassword((prev) => ({
                                ...prev,
                                newPassword: !prev.newPassword,
                              }))
                          }
                          aria-label={showPassword.newPassword ? 'Hide password' : 'Show password'}
                      >
                        <FontAwesomeIcon icon={showPassword.newPassword ? faEyeSlash : faEye}/>
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
                  </div>
                  <div className="col-12 d-flex flex-wrap gap-2 pt-2">
                    <button className="btn btn-primary" type="submit">
                      Update Password
                    </button>
                    <button
                        className="btn btn-ghost"
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
            <div className="scm-modal-backdrop" onClick={() => setIsDeleting(false)} role="presentation">
              <div
                  className="scm-modal"
                  role="dialog"
                  aria-modal="true"
                  onClick={(event) => event.stopPropagation()}
              >
                <div className="scm-modal__header">
                  <h4 className="fw-semibold mb-0">Delete Account</h4>
                  <button
                      className="btn btn-sm btn-ghost"
                      type="button"
                      onClick={() => setIsDeleting(false)}
                  >
                    <FontAwesomeIcon icon={faXmark}/>
                  </button>
                </div>
                <p className="text-muted">
                  Type your email to confirm permanent deletion of your account.
                </p>
                <form className="row g-3" onSubmit={handleDeleteSubmit}>
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
                        className="btn btn-outline-danger"
                        type="submit"
                        disabled={!deleteMatch}
                    >
                      Delete Account
                    </button>
                    <button className="btn btn-ghost" type="button" onClick={() => setIsDeleting(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
      )
  )
}

export default ProfilePage
