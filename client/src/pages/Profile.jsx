import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';

export default function Profile() {
  const { user, isAuthed, setUser, logout, liked, saved } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  if (!isAuthed) {
    return (
      <div className="pt-10">
        <EmptyState title="You're browsing as a guest" body="Sign in to manage your profile, interests and saved stories." action={<Link to="/login" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white">Sign in</Link>} />
      </div>
    );
  }

  const saveName = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.patch('/users/profile', { name: name.trim() });
      setUser(data.user);
      setEditing(false);
      setMsg('Profile updated.');
      setTimeout(() => setMsg(''), 2500);
    } catch {
      setMsg('Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const initial = (user?.name || 'U').charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-xl pt-8">
      <h1 className="text-[28px] font-bold tracking-tight">Profile</h1>

      <section className="mt-6 rounded-lg border border-border bg-surface p-5" aria-label="Account">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-full border border-border bg-surface2 text-lg font-semibold">{initial}</span>
          <div className="min-w-0">
            {editing ? (
              <div className="flex gap-2">
                <input value={name} onChange={e => setName(e.target.value)} aria-label="Name" className="h-9 w-48 rounded-md border border-border bg-ink px-2.5 text-sm focus:border-accent/60 focus:outline-none" />
                <button onClick={saveName} disabled={saving} className="rounded-md bg-accent px-3 text-sm font-medium text-white disabled:opacity-50">{saving ? '…' : 'Save'}</button>
                <button onClick={() => { setEditing(false); setName(user?.name || ''); }} className="rounded-md px-2 text-sm text-muted">Cancel</button>
              </div>
            ) : (
              <>
                <p className="truncate text-[16px] font-semibold">{user?.name}</p>
                <p className="truncate text-[13px] text-muted">{user?.email}</p>
              </>
            )}
          </div>
          {!editing && (
            <button onClick={() => { setName(user?.name || ''); setEditing(true); }} className="ml-auto rounded-md border border-border px-3 py-1.5 text-[13px] text-muted hover:text-paper">
              Edit
            </button>
          )}
        </div>
        {msg && <p className="mt-3 text-[13px] text-muted">{msg}</p>}
        <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
          <div><dt className="text-[12px] text-muted">Interests</dt><dd className="text-[16px] font-semibold">{user?.interests?.length || 0}</dd></div>
          <div><dt className="text-[12px] text-muted">Liked</dt><dd className="text-[16px] font-semibold">{liked.size}</dd></div>
          <div><dt className="text-[12px] text-muted">Saved</dt><dd className="text-[16px] font-semibold">{saved.size}</dd></div>
        </dl>
      </section>

      <section className="mt-4 rounded-lg border border-border bg-surface p-5" aria-label="Interests">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Interests</h2>
          <Link to="/preferences" className="text-[13px] text-accentHover hover:underline">Edit</Link>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(user?.interests || []).length === 0 && <p className="text-[13.5px] text-muted">No interests yet.</p>}
          {(user?.interests || []).map(i => (
            <span key={i} className="rounded-md border border-border bg-ink px-2.5 py-1 text-[12.5px]">{i}</span>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-border bg-surface p-5" aria-label="Account actions">
        <h2 className="text-[15px] font-semibold">Account</h2>
        <div className="mt-3 flex gap-2">
          <Link to="/history" className="rounded-md border border-border px-3 py-1.5 text-[13px] text-muted hover:text-paper">Reading history</Link>
          <button onClick={logout} className="rounded-md border border-border px-3 py-1.5 text-[13px] text-muted hover:text-paper">Sign out</button>
        </div>
      </section>
    </div>
  );
}
