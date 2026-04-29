// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMe, logout as logoutApi } from '../api/authApi'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount, verify session via cookie — no token storage in JS
  const loadUser = useCallback(async () => {
    try {
      const res = await getMe()
      setUser(res.data.data ?? res.data)
    } catch {
      // No valid session cookie — user is not logged in
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  // login() just stores the user object returned after callback;
  // actual tokens live in HTTP-only cookies set by the backend
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

export const useAuth = () => useContext(AuthContext)