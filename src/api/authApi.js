// src/api/authApi.js
import axiosClient from './axiosClient'

/**
 * Redirect URL that initiates GitHub OAuth in the browser.
 * The backend at GET /auth/github issues the redirect to GitHub.
 */
export const getGitHubAuthUrl = () => {
  return `${import.meta.env.VITE_API_BASE_URL}/auth/github`
}

// Alias used by LoginPage (was calling getGitHubLoginUrl which didn't exist)
export const getGitHubLoginUrl = getGitHubAuthUrl

/**
 * Get current authenticated user from HTTP-only cookie session.
 */
export const getMe = () => {
  return axiosClient.get('/auth/me')
}

/**
 * Refresh access token — refresh token is in HTTP-only cookie, no body needed.
 */
export const refreshToken = () => {
  return axiosClient.post('/auth/refresh')
}

/**
 * Logout — clears HTTP-only cookies server-side.
 */
export const logout = () => {
  return axiosClient.post('/auth/logout')
}