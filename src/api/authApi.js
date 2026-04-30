// src/api/authApi.js
import axiosClient from './axiosClient'

/**
 * Redirect URL that initiates GitHub OAuth in the browser.
 * The backend at GET /auth/github issues the redirect to GitHub.
 */
export const getGitHubAuthUrl = () => {
  return `${import.meta.env.VITE_API_BASE_URL}/auth/github`
}

// Alias used by LoginPage
export const getGitHubLoginUrl = getGitHubAuthUrl

/**
 * Get current authenticated user.
 *
 * FIX: Changed from /auth/me to /api/users/me
 *
 * WHY THIS MATTERS:
 * /auth/me sits under the auth rate limiter (10 req/min).
 * AuthContext calls this on EVERY page load — including when the user
 * is not logged in. The interceptor then also calls POST /auth/refresh.
 * That is 2 auth requests per page load. After 5 loads the limit is
 * exhausted and clicking "Continue with GitHub" returns 429.
 *
 * /api/users/me sits under the API rate limiter (60 req/min) — 6x more
 * headroom. This stops the button from being blocked.
 */
export const getMe = () => {
  return axiosClient.get('/api/users/me')
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