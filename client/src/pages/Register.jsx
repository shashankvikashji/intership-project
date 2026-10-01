import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/preferences');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create your account. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm pt-12">
      <h1 className="text-[26px] font-bold tracking-tight">Create your account</h1>
      <p className="mt-1 text-[14px] text-muted">Pick your interests next — your feed tunes itself after that.</p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        {error && <p role="alert" className="rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-[13px] text-red-200">{error}</p>}
        <div>
          <label htmlFor="name" className="mb-1 block text-[13px] text-muted">Name</label>
          <input id="name" required maxLength={60} value={name} onChange={e => setName(e.target.value)} placeholder="Shashank" className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-accent/60 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-[13px] text-muted">Email</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-accent/60 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-[13px] text-muted">Password</label>
          <input id="password" type="password" required minLength={6} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-accent/60 focus:outline-none" />
        </div>
        <button disabled={busy} className="h-10 w-full rounded-md bg-accent text-sm font-medium text-white hover:bg-accentHover disabled:opacity-50">
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p className="mt-4 text-center text-[13.5px] text-muted">
        Already have an account? <Link to="/login" className="text-accentHover hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
