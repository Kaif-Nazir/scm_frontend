import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const USER_KEY = 'scm_user'
const TOKEN_KEY = 'scm_token'

const parseJSON = (value) => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const decodeJwtPayload = (token) => {
  if (typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length < 2) return null

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    return parseJSON(window.atob(padded))
  } catch {
    return null
  }
}

const isJwtExpired = (token) => {
  const payload = decodeJwtPayload(token)
  if (!payload || typeof payload.exp !== 'number') return false
  return Date.now() >= payload.exp * 1000
}

const clearStorageAuth = (storage) => {
  storage.removeItem(USER_KEY)
  storage.removeItem(TOKEN_KEY)
}

const readAuthFromStorage = (storage, remember) => {
  const token = storage.getItem(TOKEN_KEY)
  const rawUser = storage.getItem(USER_KEY)
  if (!token || !rawUser) return null

  if (isJwtExpired(token)) {
    clearStorageAuth(storage)
    return null
  }

  const user = parseJSON(rawUser)
  if (!user || typeof user !== 'object') {
    clearStorageAuth(storage)
    return null
  }

  return { user, token, remember }
}

const readInitialAuth = () =>
  readAuthFromStorage(localStorage, true) ||
  readAuthFromStorage(sessionStorage, false) || { user: null, token: null, remember: true }

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
  const initialAuth = useMemo(() => readInitialAuth(), [])
  const [user, setUserState] = useState(initialAuth.user)
  const [token, setTokenState] = useState(initialAuth.token)
  const [isRememberSession, setIsRememberSession] = useState(initialAuth.remember)
  const isAuthenticated = Boolean(user && token && !isJwtExpired(token))

  const persistAuth = useCallback((nextUser, nextToken, remember) => {
    const primaryStorage = remember ? localStorage : sessionStorage
    const secondaryStorage = remember ? sessionStorage : localStorage
    clearStorageAuth(secondaryStorage)

    if (!nextUser || !nextToken) {
      clearStorageAuth(primaryStorage)
      return
    }

    primaryStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    primaryStorage.setItem(TOKEN_KEY, nextToken)
  }, [])

  const persistUser = useCallback((nextUserOrUpdater) => {
    setUserState((prevUser) => {
      const nextUser =
        typeof nextUserOrUpdater === 'function' ? nextUserOrUpdater(prevUser) : nextUserOrUpdater
      persistAuth(nextUser, token, isRememberSession)
      return nextUser
    })
  }, [isRememberSession, persistAuth, token])

  const persistToken = useCallback((nextTokenOrUpdater) => {
    setTokenState((prevToken) => {
      const nextToken =
        typeof nextTokenOrUpdater === 'function' ? nextTokenOrUpdater(prevToken) : nextTokenOrUpdater
      persistAuth(user, nextToken, isRememberSession)
      return nextToken
    })
  }, [isRememberSession, persistAuth, user])

  const login = useCallback((nextUser, nextToken, options = {}) => {
    const remember = options.remember !== false
    setIsRememberSession(remember)
    setUserState(nextUser)
    setTokenState(nextToken)
    persistAuth(nextUser, nextToken, remember)
  }, [persistAuth])

  const logout = useCallback(() => {
    setUserState(null)
    setTokenState(null)
    clearStorageAuth(localStorage)
    clearStorageAuth(sessionStorage)
  }, [])

  useEffect(() => {
    if (!token) return
    if (isJwtExpired(token)) {
      clearStorageAuth(localStorage)
      clearStorageAuth(sessionStorage)
    }
  }, [token])

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      token,
      login,
      logout,
      setUser: persistUser,
      setToken: persistToken,
    }),
    [isAuthenticated, login, logout, user, token, persistUser, persistToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
