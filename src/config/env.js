const readEnv = (key) => {
  const value = import.meta.env[key]
  return typeof value === 'string' ? value.trim() : ''
}

const withGooglePrompt = (url) => {
  if (!url) return ''
  const separator = url.includes('?') ? '&' : '?'
  if (url.includes('prompt=')) return url
  return `${url}${separator}prompt=select_account`
}

const apiBaseUrl = readEnv('VITE_API_BASE_URL').replace(/\/+$/, '')
const googleAuthUrlFromEnv = readEnv('VITE_GOOGLE_AUTH_URL')
const googleAuthPath = readEnv('VITE_GOOGLE_AUTH_PATH')

const googleAuthUrl =
  googleAuthUrlFromEnv ||
  (apiBaseUrl && googleAuthPath ? `${apiBaseUrl}${googleAuthPath.startsWith('/') ? '' : '/'}${googleAuthPath}` : '')

export const appEnv = {
  apiBaseUrl,
  appHomePath: readEnv('VITE_APP_HOME_PATH'),
  resetPasswordPath: readEnv('VITE_RESET_PASSWORD_PATH'),
  oauthCallbackPath: readEnv('VITE_OAUTH_CALLBACK_PATH'),
  publicLogoPath: readEnv('VITE_PUBLIC_LOGO_PATH'),
  resetPasswordEndpoint: readEnv('VITE_RESET_PASSWORD_ENDPOINT'),
  googleAuthUrl: withGooglePrompt(googleAuthUrl),
  contactEmail: readEnv('VITE_CONTACT_EMAIL'),
  githubRepoUrl: readEnv('VITE_GITHUB_REPO_URL'),
  linkedinUrl: readEnv('VITE_LINKEDIN_URL'),
}
