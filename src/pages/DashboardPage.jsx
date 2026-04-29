import { useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { getProfiles } from '../api/profilesApi'
import Layout from '../components/Layout'

const StatCard = ({ label, value, color = 'indigo' }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
    <p className="text-sm text-gray-400">{label}</p>
    <p className={`text-3xl font-bold mt-1 text-${color}-400`}>{value}</p>
  </div>
)

const DashboardPage = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProfiles({ limit: 1 })
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, <span className="text-indigo-400">@{user?.username}</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Role: <span className="capitalize text-gray-300">{user?.role}</span>
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Loading stats…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total Profiles" value={stats?.total ?? '—'} color="indigo" />
          <StatCard label="Total Pages" value={stats?.total_pages ?? '—'} color="violet" />
          <StatCard label="Your Role" value={user?.role ?? '—'} color="emerald" />
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a href="/profiles" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg p-5 block transition-colors">
          <h3 className="font-semibold">Browse Profiles →</h3>
          <p className="text-indigo-200 text-sm mt-1">Filter, sort, and paginate through all profiles</p>
        </a>
        <a href="/search" className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg p-5 block transition-colors">
          <h3 className="font-semibold">Natural Language Search →</h3>
          <p className="text-gray-400 text-sm mt-1">Try "young males from Nigeria"</p>
        </a>
      </div>
    </Layout>
  )
}

export default DashboardPage