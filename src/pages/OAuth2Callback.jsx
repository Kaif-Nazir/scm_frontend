import { useEffect } from 'react'
import { appEnv } from '../config/env.js'

const getParam = (params, key) => {
  const value = params.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export default function OAuth2Callback() {
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const token = getParam(p, 'token')
    const id = getParam(p, 'id')
    const name = getParam(p, 'name')
    const homePath = appEnv.appHomePath || '/'

    if (token) {
      localStorage.setItem('token', token)
      localStorage.setItem('userId', id || '')
      localStorage.setItem('name', name || '')

      // Keep compatibility with existing AuthContext keys.
      localStorage.setItem('scm_token', token)
      localStorage.setItem(
        'scm_user',
        JSON.stringify({
          id: id || null,
          name: name || '',
        }),
      )

      window.location.replace(homePath)
      return
    }

    window.location.replace('/login')
  }, [])

  return <div>Signing you in...</div>
}
