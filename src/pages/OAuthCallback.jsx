// src/pages/OAuthCallback.jsx
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMe } from '../api/authApi'

/**
 * The backend sets HTTP-only cookies during /auth/github/callback and
 * redirects here. There are NO tokens in the URL — we just fetch /auth/me
 * to confirm the session is valid and get the user object.
 */
function OAuthCallback() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const hasFired = useRef(false)

  useEffect(() => {
    if (hasFired.current) return
    hasFired.current = true

    getMe()
      .then((res) => {
        const userData = res.data.data ?? res.data
        login(userData)
        navigate('/dashboard', { replace: true })
      })
      .catch(() => {
        navigate('/login', { replace: true })
      })
  }, [login, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4" />
      <p className="text-gray-400 text-sm animate-pulse">Finalizing login…</p>
    </div>
  )
}

export default OAuthCallback