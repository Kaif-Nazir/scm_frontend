import { useEffect, useMemo, useRef, useState } from 'react'
import { appEnv } from '../config/env.js'
import '../styles/components/FloatingContactFab.css'

const asText = (value) => (typeof value === 'string' ? value.trim() : '')
const toMailtoLink = (value) => {
  const email = asText(value)
  if (!email) return ''
  return email.startsWith('mailto:') ? email : `mailto:${email}`
}

function FloatingContactFab() {
  const [isOpen, setIsOpen] = useState(false)
  const closeTimerRef = useRef(null)
  const wrapRef = useRef(null)

  const links = useMemo(
    () =>
      [
        {
          id: 'email',
          href: toMailtoLink(appEnv.contactEmail),
          label: 'Email',
          className: 'email',
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M4 5h16a2 2 0 0 1 2 2v.4l-10 6.3L2 7.4V7a2 2 0 0 1 2-2Z" />
              <path d="M2 9.6V17a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9.6l-9.47 5.96a1 1 0 0 1-1.06 0L2 9.6Z" />
            </svg>
          ),
        },
        {
          id: 'linkedin',
          href: asText(appEnv.linkedinUrl),
          label: 'LinkedIn',
          className: 'linkedin',
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5 2.5 2.5 0 0 0 4.98 3.5ZM3 9h4v12H3V9Zm7 0h3.84v1.67h.05c.54-1.02 1.86-2.1 3.83-2.1C21 8.57 21 11.13 21 14.46V21h-4v-5.82c0-1.39-.03-3.18-1.94-3.18-1.95 0-2.25 1.52-2.25 3.08V21H10V9Z" />
            </svg>
          ),
        },
        {
          id: 'github',
          href: asText(appEnv.githubRepoUrl),
          label: 'GitHub',
          className: 'github',
          icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.006 2a9.847 9.847 0 0 0-6.484 2.44 10.32 10.32 0 0 0-3.393 6.17 10.48 10.48 0 0 0 1.317 6.955 10.045 10.045 0 0 0 5.4 4.418c.504.095.683-.223.683-.494 0-.245-.01-1.052-.014-1.908-2.78.62-3.366-1.21-3.366-1.21a2.711 2.711 0 0 0-1.11-1.5c-.907-.637.07-.621.07-.621.317.044.62.163.885.346.266.183.487.426.647.71.135.253.318.476.538.655a2.079 2.079 0 0 0 2.37.196c.045-.52.27-1.006.635-1.37-2.219-.259-4.554-1.138-4.554-5.07a4.022 4.022 0 0 1 1.031-2.75 3.77 3.77 0 0 1 .096-2.713s.839-.275 2.749 1.05a9.26 9.26 0 0 1 5.004 0c1.906-1.325 2.74-1.05 2.74-1.05.37.858.406 1.828.101 2.713a4.017 4.017 0 0 1 1.029 2.75c0 3.939-2.339 4.805-4.564 5.058a2.471 2.471 0 0 1 .679 1.897c0 1.372-.012 2.477-.012 2.814 0 .272.18.592.687.492a10.05 10.05 0 0 0 5.388-4.421 10.473 10.473 0 0 0 1.313-6.948 10.32 10.32 0 0 0-3.39-6.165A9.847 9.847 0 0 0 12.007 2Z" />
            </svg>
          ),
        },
      ].filter((item) => item.href),
    [],
  )

  const clearCloseTimer = () => {
    if (!closeTimerRef.current) return
    window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = null
  }

  const openMenu = () => {
    clearCloseTimer()
    setIsOpen(true)
  }

  const closeMenuWithDelay = () => {
    clearCloseTimer()
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false)
      closeTimerRef.current = null
    }, 560)
  }

  useEffect(
    () => () => {
      clearCloseTimer()
    },
    [],
  )

  if (!links.length) {
    return null
  }

  return (
    <div
      ref={wrapRef}
      className={`tooltip-container scm-contact-floating${isOpen ? ' is-open' : ''}`}
      onMouseEnter={openMenu}
      onMouseLeave={closeMenuWithDelay}
      onFocusCapture={openMenu}
      onBlurCapture={(event) => {
        if (!wrapRef.current?.contains(event.relatedTarget)) {
          closeMenuWithDelay()
        }
      }}
    >
      <button
        type="button"
        className="button-content"
        aria-label="Connect links"
        aria-expanded={isOpen}
        aria-controls="scm-contact-menu"
        onClick={() => (isOpen ? closeMenuWithDelay() : openMenu())}
      >
        <span className="text">Connect</span>
        <svg className="share-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
        </svg>
      </button>
      <div id="scm-contact-menu" className="tooltip-content" role="menu" aria-hidden={!isOpen}>
        <div className="social-icons">
        {links.map((item, index) => (
          <a
            key={item.id}
            className={`social-icon ${item.className}`}
            href={item.href}
            aria-label={item.label}
            title={item.label}
            target={item.id === 'email' ? undefined : '_blank'}
            rel={item.id === 'email' ? undefined : 'noreferrer noopener'}
            style={{ '--scm-contact-index': index + 1 }}
          >
            {item.icon}
          </a>
        ))}
        </div>
      </div>
    </div>
  )
}

export default FloatingContactFab
