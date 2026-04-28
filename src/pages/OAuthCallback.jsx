import  { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../api/authApi';

function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const hasCalledApi = useRef(false);

  // ✅ Extract tokens
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  // ✅ Derive error instead of storing in state
  const error =
    !accessToken || !refreshToken
      ? 'Authentication failed: No tokens found in callback URL.'
      : null;

  useEffect(() => {
    // 🚫 Stop if tokens are missing
    if (error) return;

    // 🚫 Prevent double execution (React Strict Mode)
    if (hasCalledApi.current) return;
    hasCalledApi.current = true;

    // ✅ Store token temporarily
    sessionStorage.setItem('access_token', accessToken);

    // ✅ Fetch user
    getMe()
      .then((res) => {
        login(accessToken, refreshToken, res.data);
        navigate('/dashboard');
      })
      .catch((err) => {
        console.error('Failed to fetch user after OAuth:', err);
        navigate('/login'); // redirect instead of state update
      });
  }, [accessToken, refreshToken, login, navigate, error]);

  // ✅ Render error UI
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="bg-gray-900 border border-red-900/50 p-6 rounded-xl text-center">
          <p className="text-red-400 font-medium">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 text-sm text-indigo-400 hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  // ✅ Loading UI
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
      <p className="text-gray-400 text-sm animate-pulse">
        Finalizing login...
      </p>
    </div>
  );
}

export default OAuthCallback;