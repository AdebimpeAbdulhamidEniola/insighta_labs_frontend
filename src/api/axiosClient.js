// src/api/axiosClient.js
import axios from 'axios'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // TRD requires: X-API-Version: 1  (not 'api-version: 2025-05-15')
    'X-API-Version': '1',
  },
  withCredentials: true, // Send HTTP-only cookies on every request
})

// Track whether a refresh is already in-flight to avoid loops
let isRefreshing = false
let failedQueue = []

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until the ongoing refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => axiosClient(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Refresh token is in HTTP-only cookie — no body needed
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        processQueue(null)
        return axiosClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        // Hard redirect — session is fully expired
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axiosClient