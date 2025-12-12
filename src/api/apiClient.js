import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'API-KEY': import.meta.env.VITE_API_KEY, // Changed from x-api-key
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 15000
})

// Attach Authorization Bearer token AND Business context automatically
api.interceptors.request.use(config => {
  // Get token from localStorage
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Get business code from localStorage (for business context)
  const storedBusiness = localStorage.getItem('current_business')
  if (storedBusiness) {
    const business = JSON.parse(storedBusiness)
    if (business.code) {
      config.headers['X-Business-Code'] = business.code
    }
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