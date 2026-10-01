import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';

const ALL = ['Technology', 'AI', 'Programming', 'Startups', 'Business', 'Science', 'Finance', 'Gaming', 'Sports', 'Entertainment', 'World', 'Politics', 'Health', 'Education'];

export default function Preferences() {
  const { isAuthed, user, setUser } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAuthed) {
      setLoading(false);
      return;
    }
    api.get('/users/preferences')
      .then(({ data }) => setSelected(data.interests || []))
      .catch(() => setSelected(user?.interests || []))
      .finally(() => setLoading(false));
  }, [isAuthed]);

  const toggle = c => {
    setSaved(false);
    setSelected(prev => (prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]));
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/users/preferences', { interests: selected });
      setSelected(data.interests || selected);
      if (user) setUser({ ...user, interests: data.interests || selected });
      setSaved(true);
      setTimeout(() => navigate('/'), 700);
    } catch {
      alert('Could not save preferences. Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthed) {
    return (
      <div className="pt-10">
        <EmptyState title="Sign in to set interests" body="Your topics tune the home feed ranking." action={<Link to="/login" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white">Sign in</Link>} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl pt-10">
        <div className="h-8 w-64 animate-pulse rounded bg-surface2" />
        <div className="mt-4 grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => <div key={i} className="h-10 animate-pulse rounded-md bg-surface2" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl pt-10">
      <h1 className="text-[28px] font-bold tracking-tight">What are you interested in?</h1>
      <p className="mt-1 text-[14px] text-muted">Pick at least 3. Your feed re-ranks as you read, like and save.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {ALL.map(c => {
          const on = selected.includes(c);
          return (
            <button
              key={c}
              onClick={() => toggle(c)}
              aria-pressed={on}
              className={`rounded-md border px-3.5 py-2 text-[13.5px] transition-colors duration-150 ${
                on ? 'border-accent/60 bg-accent/15 text-paper' : 'border-border text-muted hover:border-[#3a3e4b] hover:text-paper'
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[12.5px] text-muted">{selected.length} selected</p>
      <button
        onClick={save}
        disabled={saving || selected.length === 0}
        className="mt-5 w-full rounded-md bg-accent py-2.5 text-[14px] font-medium text-white hover:bg-accentHover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saved ? 'Your feed is ready ✓' : saving ? 'Saving…' : 'Save and update my feed'}
      </button>
      {saved && <p className="mt-2 text-center text-[13px] text-muted">Taking you back to your feed…</p>}
    </div>
  );
}
