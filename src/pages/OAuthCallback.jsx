import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../api/authApi';

function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const hasCalledApi = useRef(false);

  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token'); // ✅ Fix 2: was missing

  const error =
    !accessToken || !refreshToken
      ? 'Authentication failed: No tokens found in callback URL.'
      : null;

  useEffect(() => {
    if (error) return;
    if (hasCalledApi.current) return;
    hasCalledApi.current = true;

    sessionStorage.setItem('access_token', accessToken);

    getMe()
      .then((res) => {
        login(accessToken, refreshToken, res.data);
        navigate('/dashboard');
      })
      .catch((err) => {
        console.error('Failed to fetch user after OAuth:', err);
        navigate('/login');
      });
  }, [accessToken, refreshToken, login, navigate, error]);

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
      <p className="text-gray-400 text-sm animate-pulse">Finalizing login...</p>
    </div>
  );
}

export default OAuthCallback;