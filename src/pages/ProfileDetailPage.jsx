import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProfileById } from '../api/profilesApi'
import Layout from '../components/Layout'

const Field = ({ label, value }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
    <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
    <p className="text-white mt-1 font-medium">{value ?? '—'}</p>
  </div>
)

const ProfileDetailPage = () => {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getProfileById(id)
      .then((res) => setProfile(res.data.data))
      .catch((e) => setError(e.response?.data?.message || 'Profile not found'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <Layout>
      <Link to="/profiles" className="text-indigo-400 hover:text-indigo-300 text-sm mb-6 inline-block">
        ← Back to profiles
      </Link>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : profile ? (
        <>
          <h1 className="text-3xl font-bold text-white mb-6">{profile.name}</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <Field label="Gender" value={profile.gender} />
            <Field label="Gender Probability" value={`${(profile.gender_probability * 100).toFixed(1)}%`} />
            <Field label="Age" value={profile.age} />
            <Field label="Age Group" value={profile.age_group} />
            <Field label="Country" value={profile.country_name ?? profile.country_id} />
            <Field label="Country Code" value={profile.country_id} />
            <Field label="Country Probability" value={`${(profile.country_probability * 100).toFixed(1)}%`} />
            <Field label="Created" value={new Date(profile.created_at).toLocaleDateString()} />
          </div>
          <p className="text-gray-600 text-xs mt-6">ID: {profile.id}</p>
        </>
      ) : null}
    </Layout>
  )
}

export default ProfileDetailPage