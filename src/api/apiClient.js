import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'x-api-key': import.meta.env.VITE_API_KEY,
    'Accept': 'application/json'
  },
  timeout: 15000
})

// Attach Authorization Bearer token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')   // <-- FIXED
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, err => Promise.reject(err))

// Auto-logout on 401 responses
api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('userType')
    localStorage.removeItem('guest')
  }
  return Promise.reject(err)
})

export default api
