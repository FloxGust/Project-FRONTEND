import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor - attach JWT
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('soc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor - handle 401
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('soc_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default client
