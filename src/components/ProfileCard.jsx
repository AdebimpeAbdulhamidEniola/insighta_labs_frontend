import { Link } from 'react-router-dom'

const ProfileCard = ({ profile }) => (
  <Link
    to={`/profiles/${profile.id}`}
    className="block bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-indigo-500 transition-colors"
  >
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold text-white">{profile.name}</h3>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        profile.gender === 'male'
          ? 'bg-blue-900 text-blue-300'
          : 'bg-pink-900 text-pink-300'
      }`}>
        {profile.gender}
      </span>
    </div>
    <div className="text-sm text-gray-400 space-y-1">
      <p>Age: <span className="text-gray-300">{profile.age} · {profile.age_group}</span></p>
      <p>Country: <span className="text-gray-300">{profile.country_name ?? profile.country_id}</span></p>
    </div>
  </Link>
)

export default ProfileCard