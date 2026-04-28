import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'

const AccountPage = () => {
  const { user } = useAuth()

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-white mb-6">Account</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-lg">
        <div className="flex items-center gap-4 mb-6">
          {user?.avatar_url && (
            <img src={user.avatar_url} alt="avatar" className="w-16 h-16 rounded-full border-2 border-indigo-500" />
          )}
          <div>
            <h2 className="text-white font-semibold text-lg">@{user?.username}</h2>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Role', value: user?.role },
            { label: 'Status', value: user?.is_active ? 'Active' : 'Deactivated' },
            { label: 'GitHub ID', value: user?.github_id },
            { label: 'Member since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—' },
            { label: 'Last login', value: user?.last_login_at ? new Date(user.last_login_at).toLocaleString() : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between border-b border-gray-800 pb-3">
              <span className="text-gray-400 text-sm">{label}</span>
              <span className="text-white text-sm capitalize">{value ?? '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default AccountPage