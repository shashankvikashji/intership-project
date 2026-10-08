import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-3">
      <p className="text-[12px] uppercase tracking-[0.06em] text-muted">{label}</p>
      <p className="mt-1 font-serif text-[26px] font-semibold">{value}</p>
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api.get('/admin/stats')
      .then(({ data }) => { if (alive) setStats(data); })
      .catch(err => {
        if (!alive) return;
        setError(err.response?.status === 403
          ? 'This account does not have admin access.'
          : 'Could not load dashboard stats.');
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <div className="pt-8">
        <div className="h-8 w-56 animate-pulse rounded bg-surface2" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-surface2" />)}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="pt-10">
        <EmptyState
          title="Admin dashboard unavailable"
          body={error || 'Try again later.'}
          action={<Link to="/" className="text-sm text-accentHover hover:underline">Back home</Link>}
        />
      </div>
    );
  }

  return (
    <div className="pt-7">
      <h1 className="text-[30px] font-bold tracking-tight">Admin dashboard</h1>
      <p className="mt-1 text-[14px] text-muted">Signed in as {user?.email}. Read-only operational metrics.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Users" value={stats.users.total} />
        <Stat label="Articles" value={stats.articles.total} />
        <Stat label="Bookmarks" value={stats.engagement.bookmarks} />
        <Stat label="Views" value={stats.engagement.views} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-surface px-4 py-3">
          <h2 className="text-[15px] font-semibold">Most viewed categories</h2>
          {stats.topCategories.length === 0 && <p className="mt-2 text-[13px] text-muted">No reads recorded yet.</p>}
          <ul className="mt-2 space-y-1.5">
            {stats.topCategories.map(c => (
              <li key={c.name} className="flex justify-between text-[13.5px]">
                <span>{c.name}</span><span className="text-muted">{c.views} reads</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-border bg-surface px-4 py-3">
          <h2 className="text-[15px] font-semibold">Top stories by reads</h2>
          {stats.topArticles.length === 0 && <p className="mt-2 text-[13px] text-muted">No reads recorded yet.</p>}
          <ul className="mt-2 space-y-1.5">
            {stats.topArticles.map(a => (
              <li key={a._id} className="text-[13.5px]">
                <Link to={`/article/${a._id}`} className="hover:underline">{a.title}</Link>
                <span className="text-muted"> · {a.views} reads</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-border bg-surface px-4 py-3">
          <h2 className="text-[15px] font-semibold">Recent users</h2>
          <ul className="mt-2 space-y-1.5">
            {stats.users.recent.map(u => (
              <li key={u.email} className="flex justify-between text-[13.5px]">
                <span>{u.name} <span className="text-muted">· {u.email}</span></span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-border bg-surface px-4 py-3">
          <h2 className="text-[15px] font-semibold">News provider status</h2>
          <dl className="mt-2 space-y-1 text-[13.5px]">
            <div className="flex gap-2"><dt className="w-24 text-muted">Provider</dt><dd>{stats.news.provider}</dd></div>
            <div className="flex gap-2"><dt className="w-24 text-muted">Live key</dt><dd>{stats.news.configured ? 'configured' : 'not set — seed fallback'}</dd></div>
            <div className="flex gap-2"><dt className="w-24 text-muted">Mode</dt><dd>{stats.news.demoMode ? 'in-memory demo' : 'MongoDB'}</dd></div>
            <div className="flex gap-2"><dt className="w-24 text-muted">Engagement</dt><dd>{stats.engagement.likes} likes · {stats.engagement.shares} shares</dd></div>
          </dl>
        </section>
      </div>
    </div>
  );
}
