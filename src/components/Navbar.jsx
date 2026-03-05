import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useAppNav } from '../context/AppNavContext.jsx'
import apiClient from '../api/client.js'
import { appEnv } from '../config/env.js'
import '../styles/components/Navbar.css'

const asText = (value) => (typeof value === 'string' ? value.trim() : '')
const apiBaseUrl = appEnv.apiBaseUrl
const homePath = appEnv.appHomePath || window.location.origin
const logoPath = appEnv.publicLogoPath

const readPictureUrl = (account) =>
  asText(account?.pictureUrl) ||
  asText(account?.user?.pictureUrl) ||
  asText(account?.profile?.pictureUrl) ||
  asText(account?.data?.pictureUrl)

const readName = (account) =>
  asText(account?.name) ||
  asText(account?.user?.name) ||
  asText(account?.profile?.name) ||
  asText(account?.data?.name)

const resolveHasPassword = (account, fallback = false) => {
  const rawValue = account?.hasPassword
  if (typeof rawValue === 'boolean') return rawValue
  if (typeof rawValue === 'string') return rawValue.trim().toLowerCase() === 'true'
  if (typeof rawValue === 'number') return rawValue === 1
  return fallback
}

function Navbar({ onOpenAuth }) {
  const { isAuthenticated, user } = useAuth()
  const { setActiveItem, setNavAction } = useAppNav()
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)
  const [profilePictureUrl, setProfilePictureUrl] = useState('')
  const [resolvedAvatarUrl, setResolvedAvatarUrl] = useState('')
  const [remoteHasPassword, setRemoteHasPassword] = useState(null)
  const dropdownRef = useRef(null)
  const menuIsOpen = isAuthenticated && isAccountMenuOpen

  useEffect(() => {
    if (!menuIsOpen) {
      return
    }
    const handleOutsideClick = (event) => {
      if (!dropdownRef.current) {
        return
      }
      if (!dropdownRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false)
      }
    }
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false)
      }
    }
    window.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('keydown', handleEsc)
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('keydown', handleEsc)
    }
  }, [menuIsOpen])

  const storedUser = (() => {
    try {
      const localRaw = localStorage.getItem('scm_user')
      const sessionRaw = sessionStorage.getItem('scm_user')
      const raw = localRaw || sessionRaw
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })()
  const accountName = readName(user) || readName(storedUser) || 'Account'
  const accountHasPassword = resolveHasPassword(
    user,
    resolveHasPassword(storedUser, remoteHasPassword ?? false),
  )
  const accountAvatarUrl = asText(profilePictureUrl) || readPictureUrl(user) || readPictureUrl(storedUser)
  const effectiveAvatarUrl = asText(resolvedAvatarUrl) || accountAvatarUrl
  const showAvatar = Boolean(effectiveAvatarUrl) && !avatarLoadFailed

  useEffect(() => {
    setAvatarLoadFailed(false)
  }, [effectiveAvatarUrl])

  useEffect(() => {
    let isMounted = true

    const hydrateFromProfile = async () => {
      try {
        const response = await apiClient.get('/auth/getUser')
        const remoteUser = response?.data?.user || response?.data
        const nextAvatar = readPictureUrl(remoteUser)
        if (isMounted) {
          setProfilePictureUrl(nextAvatar || '')
          setRemoteHasPassword(resolveHasPassword(remoteUser, false))
        }
      } catch {
        // Keep local/session values if profile call fails.
      }
    }

    if (isAuthenticated) {
      void hydrateFromProfile()
    } else {
      setProfilePictureUrl('')
      setRemoteHasPassword(null)
    }

    return () => {
      isMounted = false
    }
  }, [isAuthenticated])

  useEffect(() => {
    let isMounted = true
    let objectUrl = ''

    const resolveAvatarSource = async () => {
      const raw = asText(accountAvatarUrl)
      if (!raw) {
        setResolvedAvatarUrl('')
        return
      }

      const token = localStorage.getItem('scm_token') || sessionStorage.getItem('scm_token') || ''
      const isApiImage = raw.startsWith('/') || (apiBaseUrl && raw.startsWith(apiBaseUrl))
      const absoluteUrl = raw.startsWith('/') ? `${apiBaseUrl}${raw}` : raw

      if (!token || !isApiImage) {
        setResolvedAvatarUrl(absoluteUrl)
        return
      }

      try {
        const response = await fetch(absoluteUrl, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) {
          throw new Error('Failed to load avatar image.')
        }
        const blob = await response.blob()
        objectUrl = URL.createObjectURL(blob)
        if (isMounted) {
          setResolvedAvatarUrl(objectUrl)
        }
      } catch {
        if (isMounted) {
          setResolvedAvatarUrl(absoluteUrl)
        }
      }
    }

    void resolveAvatarSource()

    return () => {
      isMounted = false
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [accountAvatarUrl])

  return (
    <header className="navbar navbar-expand-lg scm-navbar">
      <div className="container-fluid px-4">
        <a className="navbar-brand d-flex align-items-center gap-3 fw-semibold" href={homePath}>
          <img src={logoPath} alt="SCM logo" className="scm-brand-logo" />
          <span className="scm-brand-text">Smart Contact Manager</span>
        </a>
        <div className="ms-auto d-flex align-items-center gap-3">
          {isAuthenticated ? (
            <div className={`dropdown scm-account-dropdown${menuIsOpen ? ' is-open' : ''}`} ref={dropdownRef}>
              <button
                className="btn btn-sm btn-ghost dropdown-toggle scm-account-trigger"
                type="button"
                aria-expanded={menuIsOpen}
                onClick={() => setIsAccountMenuOpen((prev) => !prev)}
              >
                {showAvatar ? (
                  <img
                    src={effectiveAvatarUrl}
                    alt={accountName}
                    className="scm-account-avatar"
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarLoadFailed(true)}
                  />
                ) : (
                  <Icon name="user" />
                )}{' '}
                {accountName}
              </button>
              <ul className={`dropdown-menu dropdown-menu-end scm-dropdown${menuIsOpen ? ' show' : ''}`}>
                <li>
                  <button
                    className="dropdown-item scm-dropdown-item"
                    type="button"
                    onClick={() => {
                      setActiveItem('Profile')
                      setNavAction(null)
                      setIsAccountMenuOpen(false)
                    }}
                  >
                    <Icon name="user-pen" /> Profile
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item scm-dropdown-item"
                    type="button"
                    onClick={() => {
                      setActiveItem('Profile')
                      setNavAction('change-password')
                      setIsAccountMenuOpen(false)
                    }}
                  >
                    <Icon name="key" /> {accountHasPassword ? 'Change Password' : 'Set Password'}
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item scm-dropdown-item scm-dropdown-item--danger"
                    type="button"
                    onClick={() => {
                      setNavAction('logout')
                      setIsAccountMenuOpen(false)
                    }}
                  >
                    <Icon name="logout" /> Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <button
              id="scm-nav-continue-btn"
              className="scm-nav-continue-profile"
              type="button"
              onClick={() => onOpenAuth?.('login')}
            >
              <span className="scm-nav-continue-profile-inner">
                Continue
                <Icon name="circle-chevron-right" />
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
