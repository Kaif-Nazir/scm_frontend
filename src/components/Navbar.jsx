import { useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAddressBook, faMoon, faSun, faUser } from '@fortawesome/free-solid-svg-icons'
import { ThemeContext } from '../theme.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useAppNav } from '../context/AppNavContext.jsx'
import '../styles/components/Navbar.css'

function Navbar({ onOpenAuth }) {
  const { theme, mode, toggleTheme } = useContext(ThemeContext)
  const { isAuthenticated, user } = useAuth()
  const { setActiveItem, setNavAction } = useAppNav()

  return (
    <header className="navbar navbar-expand-lg scm-navbar">
      <div className="container-fluid px-4">
        <a className="navbar-brand d-flex align-items-center gap-3 fw-semibold" href="/">
          <span className="icon-stack" style={{ background: theme.colors.accent }}>
            <FontAwesomeIcon icon={faAddressBook} />
          </span>
          Smart Contact Manager
        </a>
        <div className="ms-auto d-flex align-items-center gap-3">
          <button
            className="btn btn-sm btn-theme"
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <FontAwesomeIcon icon={mode === 'light' ? faMoon : faSun} />
          </button>
          {isAuthenticated ? (
            <div className="dropdown">
              <button
                className="btn btn-sm btn-ghost dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <FontAwesomeIcon icon={faUser} /> {user?.name || 'Account'}
              </button>
              <ul className="dropdown-menu dropdown-menu-end scm-dropdown" >
                <li>
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={() => {
                      setActiveItem('Profile')
                      setNavAction(null)
                    }}
                  >
                    Profile
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={() => setNavAction('change-password')}
                  >
                    Change Password
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={() => setNavAction('logout')}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                type="button"
                onClick={() => onOpenAuth?.('login')}
              >
                Log in
              </button>
              <button className="btn btn-sm btn-primary" type="button" onClick={() => onOpenAuth?.('signup')}>
                Sign up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
