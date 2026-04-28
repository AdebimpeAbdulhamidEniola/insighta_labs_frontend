import { useState } from 'react'
import { searchProfiles } from '../api/profilesApi'
import Layout from '../components/Layout'
import ProfileCard from '../components/ProfileCard'
import Pagination from '../components/Pagination'

const SearchPage = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [page, setPage] = useState(1)

  const handleSearch = async (e, overridePage = 1) => {
    if (e) e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const res = await searchProfiles({ q: query.trim(), page: overridePage, limit: 12 })
      setResults(res.data.data)
      setMeta(res.data)
      setPage(overridePage)
    } catch (e) {
      setError(e.response?.data?.message || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (p) => handleSearch(null, p)

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-white mb-6">Natural Language Search</h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "young males from Nigeria"'
          className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 placeholder-gray-600"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-6 py-3 rounded-lg disabled:opacity-50 transition-colors"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {searched && !loading && (
        <>
          <p className="text-gray-400 text-sm mb-4">
            {meta.total ?? 0} results for "{query}"
          </p>
          {results.length === 0 ? (
            <p className="text-gray-500 text-sm">No profiles matched your search.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((p) => <ProfileCard key={p.id} profile={p} />)}
              </div>
              <Pagination page={page} totalPages={meta.total_pages} onPageChange={handlePageChange} />
            </>
          )}
        </>
      )}

      {!searched && (
        <div className="text-center py-16">
          <p className="text-gray-600 text-sm">Type a natural language query to search profiles.</p>
          <p className="text-gray-700 text-xs mt-2">Examples: "adult females", "young adults from US", "seniors over 60"</p>
        </div>
      )}
    </Layout>
  )
}

export default SearchPage