import axios from 'axios'
import { appEnv } from '../config/env.js'

const apiClient = axios.create({
  baseURL: appEnv.apiBaseUrl || undefined,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('scm_token') || sessionStorage.getItem('scm_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default apiClient
