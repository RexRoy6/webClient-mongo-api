import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'API-KEY': import.meta.env.VITE_API_KEY,
    'Accept': 'application/json'
  },
  timeout: 15000
})

// attach authorization header if token present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
}, err => Promise.reject(err))

// optional: response interceptor for 401 auto-logout
api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    // e.g. sign out user globally
    localStorage.removeItem('access_token')
    localStorage.removeItem('guest_uuid')
  }
  return Promise.reject(err)
})

export default api
