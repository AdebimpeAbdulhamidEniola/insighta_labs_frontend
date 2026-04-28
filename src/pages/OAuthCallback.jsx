import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { handleOAuthCallback } from '../api/authApi';

function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code) {
      handleOAuthCallback(code, state)
        .then((res) => {
          // Destructure data returned from your backend
          const { access_token, refresh_token, user } = res.data;
          
          // AuthContext login expects: (access_token, refresh_token, userData)
          login(access_token, refresh_token, user);
          
          // Redirect to the protected dashboard
          navigate('/dashboard');
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'OAuth login failed');
        });
    } else {
      setError('No authorization code received');
    }
  }, [searchParams, login, navigate]);

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
      <p className="text-gray-400 text-sm animate-pulse">Authenticating with GitHub...</p>
    </div>
  );
}

export default OAuthCallback;