// src/context/AuthContext.jsx
import { createContext,  useState, useEffect, useCallback, startTransition } from 'react'
import { getMe, logout as logoutApi } from '../api/authApi'

export const AuthContext = createContext(null)  // ← now exported so useAuth.js can import it

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    try {
      const res = await getMe()
      startTransition(() => {
        setUser(res.data.data ?? res.data)
      })
    } catch {
      startTransition(() => {
        setUser(null)
      })
    } finally {
      startTransition(() => {
        setLoading(false)
      })
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = (userData) => {
    setUser(userData)
  }

  const logout = async () => {
    try {
      await logoutApi()
    } catch {
      // proceed regardless
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// ← useAuth removed from here. It now lives in ./useAuth.js