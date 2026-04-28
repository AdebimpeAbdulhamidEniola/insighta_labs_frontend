import axiosClient from './axiosClient'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const getGitHubLoginUrl = () => `${BASE_URL}/auth/github`

export const getMe = () => axiosClient.get('/auth/me')

/**
 * Exchanges the GitHub authorization code and state for access/refresh tokens.
 */

export const logout = (accessToken) =>
  axios.post(
    `${BASE_URL}/auth/logout`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

export const refreshTokens = (refreshToken) =>
  axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken })