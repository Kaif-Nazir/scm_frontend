import { useEffect, useState } from 'react'
import './styles/global.css'
import Navbar from './components/Navbar.jsx'
import MainFront from './components/MainFront.jsx'
import AuthModal from './components/AuthModal.jsx'
import ContactsPage from './pages/ContactsPage.jsx'
import ResetPasswordPage from './pages/ResetPasswordPage.jsx'
import OAuth2CallbackPage from './pages/OAuth2CallbackPage.jsx'
import { useAuth } from './context/AuthContext.jsx'
import AppNavContext from './context/AppNavContext.jsx'
import { appEnv } from './config/env.js'
import FloatingContactFab from './components/FloatingContactFab.jsx'

function App() {
  const { isAuthenticated } = useAuth()
  const isResetPasswordRoute =
    Boolean(appEnv.resetPasswordPath) && window.location.pathname === appEnv.resetPasswordPath
  const isOAuthCallbackRoute =
    Boolean(appEnv.oauthCallbackPath) && window.location.pathname === appEnv.oauthCallbackPath
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState('login')
  const [activeItem, setActiveItem] = useState('Dashboard')
  const [navAction, setNavAction] = useState(null)

  useEffect(() => {
    const handleEscClose = (event) => {
      if (event.key !== 'Escape') {
        return
      }

      const activeElement = document.activeElement
      if (activeElement && typeof activeElement.blur === 'function') {
        activeElement.blur()
      }

      const backdrops = document.querySelectorAll('.scm-modal-backdrop')
      const topmostBackdrop = backdrops[backdrops.length - 1]
      if (topmostBackdrop instanceof HTMLElement) {
        topmostBackdrop.click()
      }
    }

    window.addEventListener('keydown', handleEscClose)
    return () => {
      window.removeEventListener('keydown', handleEscClose)
    }
  }, [])

  return (
    <AppNavContext.Provider value={{ activeItem, setActiveItem, navAction, setNavAction }}>
      <div className={`app app--dark${isAuthenticated ? '' : ' app--login-clean'}`}>
        <Navbar
          onOpenAuth={(tab) => {
            setAuthTab(tab || 'login')
            setIsAuthOpen(true)
          }}
        />
        {isOAuthCallbackRoute ? (
          <OAuth2CallbackPage />
        ) : isResetPasswordRoute ? (
          <ResetPasswordPage />
        ) : isAuthenticated ? (
          <ContactsPage />
        ) : (
          <main className="container py-5">
            <MainFront
              onGetStarted={() => {
                setAuthTab('signup')
                setIsAuthOpen(true)
              }}
            />
          </main>
        )}
        {!isAuthenticated && !isResetPasswordRoute && !isOAuthCallbackRoute && (
          <AuthModal
            isOpen={isAuthOpen}
            activeTab={authTab}
            onClose={() => setIsAuthOpen(false)}
            onTabChange={setAuthTab}
          />
        )}
        <FloatingContactFab />
      </div>
    </AppNavContext.Provider>
  )
}

export default App
