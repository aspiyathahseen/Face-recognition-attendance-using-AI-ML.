import React, { useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    const endpoint = mode === 'signup' ? 'signup' : 'login';

    try {
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Request failed');
        return;
      }

      if (mode === 'signup') {
        setInfo(data.message || 'Account created. You can now sign in.');
        setMode('signin');
        setPassword('');
      } else {
        onLoginSuccess();
      }
    } catch (err) {
      setError('Unable to reach backend. Is Flask running?');
    } finally {
      setLoading(false);
    }
  };

  const isSignup = mode === 'signup';

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="card w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-slate-900">
            {isSignup ? 'Admin Sign Up' : 'Admin Sign In'}
          </h1>
          <button
            type="button"
            onClick={() => {
              setMode(isSignup ? 'signin' : 'signup');
              setError('');
              setInfo('');
            }}
            className="text-[11px] text-blue-600 hover:text-blue-700 underline"
          >
            {isSignup ? 'Have an account? Sign in' : 'New admin? Create account'}
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          {isSignup
            ? 'Create an admin account to access the dashboard.'
            : 'Sign in with your admin account to manage attendance.'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Username</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          {info && !error && <p className="text-xs text-emerald-600">{info}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? (isSignup ? 'Creating account...' : 'Signing in...') : isSignup ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

