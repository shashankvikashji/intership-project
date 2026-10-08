import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { HorizontalArticleCard } from '../components/ArticleCards';
import { SkeletonList } from '../components/EmptyState';
import EmptyState from '../components/EmptyState';

export default function Saved() {
  const { isAuthed, saved } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    let alive = true;
    if (!isAuthed) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get('/articles', { params: { limit: 50 } })
      .then(({ data }) => {
        if (!alive) return;
        const ids = new Set([...saved].map(String));
        setArticles((data.articles || []).filter(a => ids.has(String(a._id))));
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [isAuthed, saved]);

  const visible = useMemo(() => {
    if (!filter.trim()) return articles;
    const needle = filter.toLowerCase();
    return articles.filter(a => `${a.title} ${a.description} ${a.category}`.toLowerCase().includes(needle));
  }, [articles, filter]);

  if (!isAuthed) {
    return (
      <div className="pt-10">
        <EmptyState
          title="Sign in to see saved stories"
          body="Bookmarks sync to your account so they follow you across devices."
          action={<Link to="/login" className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accentHover">Sign in</Link>}
        />
      </div>
    );
  }

  return (
    <div className="pt-7">
      <h1 className="text-[30px] font-bold tracking-tight">Saved stories</h1>
      <p className="mt-1 text-[14px] text-muted">{articles.length} bookmarked</p>
      {articles.length > 3 && (
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter saved stories…"
          aria-label="Filter saved stories"
          className="mt-4 h-10 w-full max-w-sm rounded-md border border-border bg-surface px-3 text-sm focus:border-accent/60 focus:outline-none"
        />
      )}
      <div className="mt-4">
        {loading ? (
          <SkeletonList n={4} />
        ) : visible.length === 0 && !filter ? (
          <EmptyState title="No saved stories yet" body="Save an article and it will appear here." action={<Link to="/" className="text-sm text-accentHover hover:underline">Find something to read</Link>} />
        ) : visible.length === 0 ? (
          <EmptyState title="Nothing matches that filter" body="Try a different keyword." />
        ) : (
          <div className="stagger divide-y divide-border border-t border-border">
            {visible.map(a => <HorizontalArticleCard key={a._id} article={a} />)}
          </div>
        )}
      </div>
    </div>
  );
}
