import { useEffect, useMemo, useState } from 'react'
import apiClient from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useAlert } from '../context/AlertContext.jsx'
import { appEnv } from '../config/env.js'
import '../styles/pages/OAuth2CallbackPage.css'

const asTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '')

const decodeValue = (value) => {
  const raw = asTrimmedString(value)
  if (!raw) return ''
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

const parseObject = (value) => {
  const raw = decodeValue(value)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

const readOAuthParams = () => {
  const queryParams = new URLSearchParams(window.location.search)
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
  const hashParams = new URLSearchParams(hash)

  const getFirst = (...keys) => {
    for (const key of keys) {
      const queryValue = queryParams.get(key)
      if (asTrimmedString(queryValue)) return queryValue
      const hashValue = hashParams.get(key)
      if (asTrimmedString(hashValue)) return hashValue
    }
    return ''
  }

  return {
    token: getFirst('token', 'access_token', 'jwt', 'authToken'),
    error: getFirst('error', 'oauth_error'),
    errorDescription: getFirst('error_description', 'message'),
    userRaw: getFirst('user', 'userData', 'profile'),
  }
}

function OAuth2CallbackPage() {
  const { login } = useAuth()
  const { error: showError } = useAlert()
  const [message, setMessage] = useState('')
  const [isWorking, setIsWorking] = useState(true)
  const params = useMemo(readOAuthParams, [])
  const homePath = appEnv.appHomePath || window.location.origin

  useEffect(() => {
    const completeOAuth = async () => {
      let isRedirecting = false
      const token = asTrimmedString(params.token)
      const backendError = asTrimmedString(params.error)
      const backendErrorDescription = asTrimmedString(params.errorDescription)

      if (backendError) {
        const messageText = backendErrorDescription || backendError || 'Google login failed.'
        setMessage(messageText)
        showError(messageText)
        setIsWorking(false)
        return
      }

      if (!token) {
        const messageText = 'No access token found in callback URL.'
        setMessage(messageText)
        showError(messageText)
        setIsWorking(false)
        return
      }

      try {
        const userFromUrl = parseObject(params.userRaw)
        let authenticatedUser = userFromUrl

        if (!authenticatedUser) {
          const response = await apiClient.get('/auth/getUser', {
            headers: { Authorization: `Bearer ${token}` },
          })
          authenticatedUser = response?.data?.user || response?.data
        }

        if (!authenticatedUser || typeof authenticatedUser !== 'object') {
          throw new Error('Could not load user profile after Google login.')
        }

        login(authenticatedUser, token, { remember: true })
        isRedirecting = true
        window.location.replace(homePath)
        return
      } catch (error) {
        const messageText =
          error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          'Google login could not be completed.'
        setMessage(String(messageText))
        showError(messageText)
      } finally {
        if (!isRedirecting) {
          setIsWorking(false)
        }
      }
    }

    void completeOAuth()
  }, [homePath, login, params, showError])

  if (isWorking) {
    return null
  }

  return (
    <main className="scm-oauth-callback-page container py-5">
      <section className="scm-oauth-callback-card">
        <h1>Google Authentication</h1>
        <p>{message}</p>
        {!isWorking && (
          <button type="button" onClick={() => window.location.replace(homePath)}>
            Go to Home
          </button>
        )}
      </section>
    </main>
  )
}

export default OAuth2CallbackPage
