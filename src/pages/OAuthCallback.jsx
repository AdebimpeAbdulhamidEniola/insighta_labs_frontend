import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../api/authApi';

function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Get tokens directly from the URL query string
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');

    if (accessToken && refreshToken) {
      // 2. Temporarily store token to fetch user profile
      sessionStorage.setItem('access_token', accessToken);
      
      // 3. Fetch the actual user data using the new token
      getMe()
        .then((res) => {
          // 4. Update Context with tokens and user data
          login(accessToken, refreshToken, res.data);
          // 5. Redirect to dashboard
          navigate('/dashboard');
        })
        .catch((err) => {
          console.error('Failed to fetch user after OAuth:', err);
          setError('Session established but failed to load user profile.');
        });
    } else {
      setError('Authentication failed: No tokens found in callback URL.');
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
      <p className="text-gray-400 text-sm animate-pulse">Finalizing login...</p>
    </div>
  );
}

export default OAuthCallback;