// src/pages/ProfilesPage.jsx
import { useEffect, useState, useCallback, startTransition } from 'react'
import { useAuth } from '../context/useAuth'
import { getProfiles, createProfile, deleteProfile, exportProfiles } from '../api/profilesApi'
import Layout from '../components/Layout'
import ProfileCard from '../components/ProfileCard'
import Pagination from '../components/Pagination'

const GENDERS = ['', 'male', 'female']
const AGE_GROUPS = ['', 'child', 'teenager', 'young adult', 'adult', 'senior']

const ProfilesPage = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [profiles, setProfiles] = useState([])
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  // Filters
  const [page, setPage] = useState(1)
  const [gender, setGender] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [country, setCountry] = useState('')
  const [minAge, setMinAge] = useState('')
  const [maxAge, setMaxAge] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [order, setOrder] = useState('asc')

  // Admin: create profile
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const triggerRefresh = () => setRefreshKey((k) => k + 1)

  const buildParams = useCallback(() => {
    const params = { page, limit: 12 }
    if (gender) params.gender = gender
    if (ageGroup) params.age_group = ageGroup
    if (country) params.country = country
    if (minAge) params.min_age = minAge
    if (maxAge) params.max_age = maxAge
    if (sortBy) params.sort_by = sortBy
    if (order) params.order = order
    return params
  }, [page, gender, ageGroup, country, minAge, maxAge, sortBy, order])

  useEffect(() => {
    let cancelled = false
    const params = buildParams()

    startTransition(() => {
      setLoading(true)
      setError('')
    })

    getProfiles(params)
      .then((res) => {
        if (!cancelled) {
          setProfiles(res.data.data || [])
          setMeta(res.data)
          setLoading(false)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.response?.data?.message || 'Failed to load profiles')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [buildParams, refreshKey])

  // Helper: reset page and set filter value
  const setFilter = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    setCreateError('')
    try {
      await createProfile(newName.trim())
      setNewName('')
      triggerRefresh()
    } catch (e) {
      setCreateError(e.response?.data?.message || 'Failed to create profile')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this profile?')) return
    try {
      await deleteProfile(id)
      triggerRefresh()
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed')
    }
  }

  const handleExport = async () => {
    try {
      const params = {}
      if (gender) params.gender = gender
      if (country) params.country = country
      const res = await exportProfiles(params)
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `profiles_${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Export failed')
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Profiles</h1>
        <button
          onClick={handleExport}
          className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors"
        >
          Export CSV
        </button>
      </div>

      {/* Admin: create profile */}
      {isAdmin && (
        <div className="mb-6">
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New profile name…"
              className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={creating}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-5 py-2 rounded-lg disabled:opacity-50 transition-colors"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
          </form>
          {createError && <p className="text-red-400 text-sm mt-2">{createError}</p>}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <select
          value={gender}
          onChange={(e) => setFilter(setGender)(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
        >
          {GENDERS.map((g) => (
            <option key={g} value={g}>{g || 'All genders'}</option>
          ))}
        </select>

        <select
          value={ageGroup}
          onChange={(e) => setFilter(setAgeGroup)(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
        >
          {AGE_GROUPS.map((a) => (
            <option key={a} value={a}>{a || 'All age groups'}</option>
          ))}
        </select>

        <input
          type="text"
          value={country}
          onChange={(e) => setFilter(setCountry)(e.target.value)}
          placeholder="Country code (e.g. NG)"
          className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
        />

        <input
          type="number"
          value={minAge}
          onChange={(e) => setFilter(setMinAge)(e.target.value)}
          placeholder="Min age"
          className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
        />

        <input
          type="number"
          value={maxAge}
          onChange={(e) => setFilter(setMaxAge)(e.target.value)}
          placeholder="Max age"
          className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
        />

        <div className="flex gap-1">
          <select
            value={sortBy}
            onChange={(e) => setFilter(setSortBy)(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="">Sort by…</option>
            <option value="age">Age</option>
            <option value="name">Name</option>
            <option value="created_at">Created</option>
          </select>
          <select
            value={order}
            onChange={(e) => setFilter(setOrder)(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="asc">↑</option>
            <option value="desc">↓</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : (
        <>
          <p className="text-gray-400 text-sm mb-4">{meta.total ?? 0} profiles found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((p) => (
              <div key={p.id} className="relative group">
                <ProfileCard profile={p} />
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="absolute top-3 right-3 text-xs text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
          <Pagination page={meta.page} totalPages={meta.total_pages} onPageChange={setPage} />
        </>
      )}
    </Layout>
  )
}

export default ProfilesPage