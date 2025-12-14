import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'API-KEY': import.meta.env.VITE_API_KEY,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 15000
})

// Attach Authorization token and Business context
api.interceptors.request.use(config => {
  // Auth token
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Business context
  const storedBusiness = localStorage.getItem('current_business')
  if (storedBusiness) {
    const business = JSON.parse(storedBusiness)
    if (business.code) {
      config.headers['X-Business-Code'] = business.code
    }
  }

  return config
}, error => Promise.reject(error))

// Auto-logout on 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userType')
      localStorage.removeItem('guest')
    }
    return Promise.reject(error)
  }
)

export default api
