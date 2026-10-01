import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not sign in. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const demo = async () => {
    setError('');
    setBusy(true);
    try {
      await demoLogin();
      navigate('/');
    } catch {
      setError('Demo sign-in failed. Is the API running? (npm run dev:server)');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm pt-12">
      <h1 className="text-[26px] font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-[14px] text-muted">Sign in to get your personalized feed.</p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        {error && <p role="alert" className="rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-[13px] text-red-200">{error}</p>}
        <div>
          <label htmlFor="email" className="mb-1 block text-[13px] text-muted">Email</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-accent/60 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-[13px] text-muted">Password</label>
          <input id="password" type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-accent/60 focus:outline-none" />
        </div>
        <button disabled={busy} className="h-10 w-full rounded-md bg-accent text-sm font-medium text-white hover:bg-accentHover disabled:opacity-50">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <button onClick={demo} disabled={busy} className="mt-2 h-10 w-full rounded-md border border-border text-sm text-muted hover:text-paper disabled:opacity-50">
        Try the demo account instead
      </button>
      <p className="mt-4 text-center text-[13.5px] text-muted">
        New here? <Link to="/register" className="text-accentHover hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
