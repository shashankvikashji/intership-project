import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { FeaturedArticle, ArticleCard, HorizontalArticleCard } from '../components/ArticleCards';
import { SkeletonCard } from '../components/EmptyState';
import EmptyState from '../components/EmptyState';

function greeting(name) {
  const h = new Date().getHours();
  const part = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  return name ? `Good ${part}, ${name.split(' ')[0]}` : `Good ${part}`;
}

export default function Home() {
  const { user, isAuthed } = useAuth();
  const [feed, setFeed] = useState(null);
  const [reasons, setReasons] = useState({});
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [rec, lat] = await Promise.all([
          api.get('/recommendations/feed', { params: { limit: 13 } }),
          api.get('/articles', { params: { limit: 6, sort: 'newest' } })
        ]);
        if (!alive) return;
        setFeed(rec.data.articles || []);
        setReasons(rec.data.reasons || {});
        setLatest(lat.data.articles || []);
      } catch {
        if (alive) setError('Could not load stories. Check your connection and retry.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <div className="pt-8">
        <div className="h-7 w-56 animate-pulse rounded bg-surface2" />
        <div className="mt-2 h-5 w-80 animate-pulse rounded bg-surface2" />
        <div className="mt-6 animate-pulse overflow-hidden rounded-lg border border-border">
          <div className="aspect-[21/9] bg-surface2" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-10">
        <EmptyState
          title="Something went wrong"
          body={error}
          action={<button onClick={() => window.location.reload()} className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accentHover">Retry</button>}
        />
      </div>
    );
  }

  const [featured, ...rest] = feed || [];
  const grid = rest.slice(0, 6);
  const more = rest.slice(6);

  return (
    <div className="relative pt-7">
      <div className="hero-glow" aria-hidden="true" />
      <p className="anim-fade-up text-[14px] text-muted" style={{ '--i': 0 }}>{greeting(user?.name)}</p>
      <div className="anim-fade-up mt-1 flex flex-wrap items-end justify-between gap-2" style={{ '--i': 1 }}>
        <h1 className="text-[30px] font-bold tracking-tight sm:text-[34px]">Stories picked for you</h1>
        {!isAuthed && (
          <Link to="/login" className="text-[13.5px] text-accentHover hover:underline">
            Sign in for better picks →
          </Link>
        )}
      </div>
      <p className="mt-1 text-[14px] text-muted">Based on your interests and recent reading.</p>

      {featured && (
        <div className="mt-6">
          <FeaturedArticle article={featured} reason={reasons[featured._id]} />
        </div>
      )}

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-[20px] font-semibold tracking-tight">Recommended for you</h2>
        <Link to="/explore" className="text-[13px] text-muted hover:text-paper">Explore all →</Link>
      </div>
      <div className="stagger mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {grid.map(a => <ArticleCard key={a._id} article={a} reason={reasons[a._id]} />)}
      </div>

      {more.length > 0 && (
        <>
          <h2 className="mt-10 text-[20px] font-semibold tracking-tight">More in your feed</h2>
          <div className="stagger mt-2 divide-y divide-border">
            {more.map(a => <HorizontalArticleCard key={a._id} article={a} reason={reasons[a._id]} />)}
          </div>
        </>
      )}

      <div className="mt-10 border-t border-border pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold tracking-tight">Latest, unranked</h2>
          <span className="text-[12.5px] text-muted">Chronological — no personalization</span>
        </div>
        <div className="stagger mt-2 divide-y divide-border">
          {latest.slice(0, 4).map(a => <HorizontalArticleCard key={a._id} article={a} />)}
        </div>
      </div>
    </div>
  );
}
