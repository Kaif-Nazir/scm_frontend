import { useMemo, useState } from 'react'
import Icon from '../components/Icon.jsx'
import Sidebar from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useAppNav } from '../context/AppNavContext.jsx'
import '../styles/pages/ContactsPage.css'
import AddContactPage from './AddContactPage.jsx'
import DashboardPage from './DashboardPage.jsx'
import ViewContactsPage from './ViewContactsPage.jsx'
import FavouritesPage from './FavouritesPage.jsx'
import ProfilePage from './ProfilePage.jsx'

function ContactsPage() {
  const { user, logout } = useAuth()
  const { activeItem, setActiveItem, navAction, setNavAction } = useAppNav()
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)
  const selectedItem = navAction === 'change-password' ? 'Profile' : activeItem
  const profileAction = navAction === 'change-password' ? 'change-password' : null

  const handleSelect = (label) => {
    if (label === 'Logout') {
      setIsLogoutOpen(true)
      return
    }
    setActiveItem(label)
  }

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
          onActionHandled={() => {
            setNavAction(null)
          }}
        />
      ),
    }),
    [profileAction, setActiveItem, setNavAction, user],
  )

  return (
    <div className="scm-layout">
      <Sidebar activeItem={activeItem} onSelect={handleSelect} />
      <section className="scm-content">
        <div className="container py-4">
          {views[selectedItem] || views.Dashboard}
        </div>
      </section>
      {(isLogoutOpen || navAction === 'logout') && (
        <div
          className="scm-modal-backdrop scm-logout-backdrop"
          onClick={() => {
            setIsLogoutOpen(false)
            setNavAction(null)
          }}
          role="presentation"
        >
          <div
            className="scm-modal scm-logout-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="scm-modal__header">
              <h4 className="fw-semibold mb-0">Log out</h4>
              <button
                className="btn btn-sm btn-ghost scm-modal-close-btn"
                type="button"
                onClick={() => {
                  setIsLogoutOpen(false)
                  setNavAction(null)
                }}
              >
                <Icon name="xmark" />
              </button>
            </div>
            <p className="text-muted mb-4">Are you sure you want to log out?</p>
            <div className="d-flex flex-wrap gap-2">
              <button
                className="btn btn-outline-secondary logout-cancel-btn"
                type="button"
                onClick={() => {
                  setIsLogoutOpen(false)
                  setNavAction(null)
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-outline-primary logout-confirm-btn"
                type="button"
                onClick={() => {
                  setIsLogoutOpen(false)
                  setNavAction(null)
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
