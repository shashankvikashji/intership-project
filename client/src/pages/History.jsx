import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { HorizontalArticleCard } from '../components/ArticleCards';
import { SkeletonList } from '../components/EmptyState';
import EmptyState from '../components/EmptyState';

function groupLabel(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const startOf = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(now) - startOf(d)) / 864e5);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return 'Earlier this week';
  return 'Older';
}

export default function History() {
  const { isAuthed } = useAuth();
  const [items, setItems] = useState([]); // { article, readAt }
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: h }, { data: all }] = await Promise.all([
        api.get('/interactions/history'),
        api.get('/articles', { params: { limit: 50 } })
      ]);
      const byId = new Map((all.articles || []).map(a => [String(a._id), a]));
      setItems((h.history || []).map(x => ({ ...x, article: byId.get(String(x.articleId)) })).filter(x => x.article));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAuthed) load(); else setLoading(false); }, [isAuthed]);

  const clear = async () => {
    if (!confirm('Clear your reading history?')) return;
    await api.delete('/interactions/history');
    setItems([]);
  };

  if (!isAuthed) {
    return (
      <div className="pt-10">
        <EmptyState title="Sign in to see history" body="Your reading history is private to your account." action={<Link to="/login" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white">Sign in</Link>} />
      </div>
    );
  }

  const groups = ['Today', 'Yesterday', 'Earlier this week', 'Older']
    .map(g => ({ label: g, rows: items.filter(i => groupLabel(i.createdAt) === g) }))
    .filter(g => g.rows.length);

  return (
    <div className="pt-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight">Reading history</h1>
          <p className="mt-1 text-[14px] text-muted">{items.length} {items.length === 1 ? 'story' : 'stories'} read</p>
        </div>
        {items.length > 0 && (
          <button onClick={clear} className="rounded-md border border-border px-3 py-1.5 text-[13px] text-muted hover:text-paper">
            Clear history
          </button>
        )}
      </div>
      <div className="mt-4">
        {loading ? <SkeletonList n={5} /> : items.length === 0 ? (
          <EmptyState title="Nothing here yet" body="Stories you open will show up here, grouped by day." action={<Link to="/" className="text-sm text-accentHover hover:underline">Back to your feed</Link>} />
        ) : (
          groups.map(g => (
            <section key={g.label} className="mt-6 first:mt-2">
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">{g.label}</h2>
              <div className="divide-y divide-border border-t border-border">
                {g.rows.map(r => (
                  <HorizontalArticleCard key={r._id || r.articleId} article={r.article} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
