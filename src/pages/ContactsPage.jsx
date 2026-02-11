import { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import Sidebar from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useAppNav } from '../context/AppNavContext.jsx'
import AddContactPage from './AddContactPage.jsx'
import DashboardPage from './DashboardPage.jsx'
import ViewContactsPage from './ViewContactsPage.jsx'
import FavouritesPage from './FavouritesPage.jsx'
import ProfilePage from './ProfilePage.jsx'

function ContactsPage() {
  const { user, logout } = useAuth()
  const { activeItem, setActiveItem, navAction, setNavAction } = useAppNav()
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)
  const [profileAction, setProfileAction] = useState(null)

  const handleSelect = (label) => {
    if (label === 'Logout') {
      setIsLogoutOpen(true)
      return
    }
    setActiveItem(label)
  }

  useEffect(() => {
    if (!navAction) {
      return
    }
    if (navAction === 'logout') {
      setIsLogoutOpen(true)
    }
    if (navAction === 'change-password') {
      setActiveItem('Profile')
      setProfileAction('change-password')
    }
    setNavAction(null)
  }, [navAction, setActiveItem, setNavAction])

  const views = useMemo(
    () => ({
      Dashboard: (
        <DashboardPage user={user} onStartAddContact={() => setActiveItem('Add Contact')} />
      ),
      'Add Contact': <AddContactPage />,
      'View Contacts': <ViewContactsPage />,
      Favourites: <FavouritesPage />,
      Profile: (
        <ProfilePage
          action={profileAction}
          onActionHandled={() => setProfileAction(null)}
        />
      ),
    }),
    [profileAction, setActiveItem, user],
  )

  return (
    <div className="scm-layout">
      <Sidebar activeItem={activeItem} onSelect={handleSelect} />
      <section className="scm-content">
        <div className="container py-4">
          {views[activeItem] || views.Dashboard}
        </div>
      </section>
      {isLogoutOpen && (
        <div className="scm-modal-backdrop" onClick={() => setIsLogoutOpen(false)} role="presentation">
          <div
            className="scm-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="scm-modal__header">
              <h4 className="fw-semibold mb-0">Log out</h4>
              <button
                className="btn btn-sm btn-ghost"
                type="button"
                onClick={() => setIsLogoutOpen(false)}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <p className="text-muted mb-4">Are you sure you want to log out?</p>
            <div className="d-flex flex-wrap gap-2">
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setIsLogoutOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  setIsLogoutOpen(false)
                  logout()
                }}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactsPage
