// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout() // calls backend + clears user state
    navigate('/login', { replace: true })
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="text-white font-bold text-lg tracking-tight">
          Insighta <span className="text-indigo-400">Labs+</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-gray-300 hover:text-white text-sm transition-colors">
            Dashboard
          </Link>
          <Link to="/profiles" className="text-gray-300 hover:text-white text-sm transition-colors">
            Profiles
          </Link>
          <Link to="/search" className="text-gray-300 hover:text-white text-sm transition-colors">
            Search
          </Link>
          <Link
            to="/account"
            className="flex items-center gap-2 text-gray-300 hover:text-white text-sm transition-colors"
          >
            {user?.avatar_url && (
              <img
                src={user.avatar_url}
                alt="avatar"
                className="w-7 h-7 rounded-full"
                referrerPolicy="no-referrer"
              />
            )}
            <span>{user?.username}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar