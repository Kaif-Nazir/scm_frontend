import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  setUser: () => {},
  setToken: () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('scm_user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('scm_token'))
  const isAuthenticated = Boolean(user && token)

  const login = (nextUser, nextToken) => {
    setUser(nextUser)
    setToken(nextToken)
    localStorage.setItem('scm_user', JSON.stringify(nextUser))
    localStorage.setItem('scm_token', nextToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('scm_user')
    localStorage.removeItem('scm_token')
  }

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      token,
      login,
      logout,
      setUser,
      setToken,
    }),
    [isAuthenticated, user, token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
