import { useMemo, useState } from 'react'
import './styles/global.css'
import './styles/ambient.css'
import Navbar from './components/Navbar.jsx'
import { ThemeContext, themes } from './theme.js'
import MainFront from './components/MainFront.jsx'
import AuthModal from './components/AuthModal.jsx'
import ContactsPage from './pages/ContactsPage.jsx'
import { useAuth } from './context/AuthContext.jsx'
import AppNavContext from './context/AppNavContext.jsx'

function App() {
  const { isAuthenticated } = useAuth()
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState('login')
  const [activeItem, setActiveItem] = useState('Dashboard')
  const [navAction, setNavAction] = useState(null)
  const [mode, setMode] = useState('dark')
  const theme = themes[mode]
  /** @type {import('react').CSSProperties} */
  const cssVars = {
    '--color-primary': theme.colors.primary,
    '--color-accent': theme.colors.accent,
    '--color-ink': theme.colors.ink,
    '--color-muted': theme.colors.muted,
    '--color-surface': theme.colors.surface,
    '--color-border': theme.colors.border,
    '--color-page': theme.colors.page,
    '--bs-body-color': theme.colors.ink,
    '--bs-body-bg': theme.colors.page,
    '--bs-border-color': theme.colors.border,
    '--bs-secondary-color': theme.colors.muted,
    '--bs-heading-color': theme.colors.ink,
  }

  const toggleTheme = useMemo(
    () => () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
    [],
  )

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
      <AppNavContext.Provider value={{ activeItem, setActiveItem, navAction, setNavAction }}>
        <div
          className={`app${mode === 'light' ? ' app--light' : ''}${mode === 'dark' ? ' app--dark' : ''}${isAuthenticated ? '' : ' app--ambient'}`}
          style={cssVars}
        >
          <Navbar
            onOpenAuth={(tab) => {
              setAuthTab(tab || 'login')
              setIsAuthOpen(true)
            }}
          />
          {isAuthenticated ? (
            <ContactsPage />
          ) : (
            <main className="container py-5">
              <MainFront />
            </main>
          )}
          {!isAuthenticated && (
            <AuthModal
              isOpen={isAuthOpen}
              activeTab={authTab}
              onClose={() => setIsAuthOpen(false)}
              onTabChange={setAuthTab}
            />
          )}
        </div>
      </AppNavContext.Provider>
    </ThemeContext.Provider>
  )
}

export default App
