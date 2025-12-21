import axios, { AxiosError } from 'axios'

/* -------------------------------------------------------------------------- */
/* Environment & Config */
/* -------------------------------------------------------------------------- */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/'
const isBrowser = typeof window !== 'undefined'

/* -------------------------------------------------------------------------- */
/* Axios Instance */
/* -------------------------------------------------------------------------- */

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

/* -------------------------------------------------------------------------- */
/* Helpers - SSR Safe */
/* -------------------------------------------------------------------------- */

const getAccessToken = (): string | null => {
  if (!isBrowser) return null
  return localStorage.getItem('access_token')
}

const getRefreshToken = (): string | null => {
  if (!isBrowser) return null
  return localStorage.getItem('refresh_token')
}

const saveTokens = (access: string, refresh?: string): void => {
  if (!isBrowser) return
  localStorage.setItem('access_token', access)
  if (refresh) {
    localStorage.setItem('refresh_token', refresh)
  }
}

const clearTokens = (): void => {
  if (!isBrowser) return
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}

const redirectToLogin = (): void => {
  if (!isBrowser) return
  window.location.href = '/login'
}

/* -------------------------------------------------------------------------- */
/* Request Interceptor */
/* -------------------------------------------------------------------------- */

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/* -------------------------------------------------------------------------- */
/* Response Interceptor */
/* -------------------------------------------------------------------------- */

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<any>) => {
    // Only handle 401 errors
    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      clearTokens()
      redirectToLogin()
      return Promise.reject(error)
    }

    try {
      // Refresh token request
      const res = await axios.post(`${BASE_URL}api/auth/refresh-token`, {
        refresh_token: refreshToken
      })

      const { access_token, refresh_token } = res.data
      saveTokens(access_token, refresh_token)

      // Retry original request with new token
      const originalRequest = error.config!
      originalRequest.headers.Authorization = `Bearer ${access_token}`

      return api(originalRequest)
    } catch (refreshError) {
      clearTokens()
      redirectToLogin()
      return Promise.reject(refreshError)
    }
  }
)
