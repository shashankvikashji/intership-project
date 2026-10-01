import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../lib/api';
import { HorizontalArticleCard } from '../components/ArticleCards';
import { SkeletonList } from '../components/EmptyState';
import EmptyState from '../components/EmptyState';

function useDebounced(value, ms) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const initial = params.get('q') || '';
  const [q, setQ] = useState(initial);
  const [category, setCategory] = useState(params.get('category') || 'All');
  const [sort, setSort] = useState('relevance');
  const [results, setResults] = useState([]);
  const [reasons, setReasons] = useState({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const dq = useDebounced(q, 350);

  useEffect(() => { setQ(params.get('q') || ''); }, [params]);

  const sorted = useMemo(() => {
    const arr = [...results];
    if (sort === 'newest') arr.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    return arr;
  }, [results, sort]);

  useEffect(() => {
    if (!dq.trim() && category === 'All') {
      setResults([]);
      setSearched(false);
      return;
    }
    let alive = true;
    setLoading(true);
    const run = async () => {
      try {
        if (sort === 'personal' || !dq.trim()) {
          // personalized ranking path
          const { data } = await api.get('/recommendations/feed', { params: { limit: 24 } });
          let arts = data.articles || [];
          if (dq.trim()) {
            const needle = dq.toLowerCase();
            arts = arts.filter(a => `${a.title} ${a.description} ${a.category} ${(a.tags || []).join(' ')}`.toLowerCase().includes(needle));
          }
          if (category !== 'All') arts = arts.filter(a => a.category === category);
          if (alive) {
            setResults(arts);
            setReasons(data.reasons || {});
            setSearched(true);
          }
        } else {
          const { data } = await api.get('/articles', {
            params: { search: dq.trim() || undefined, category: category === 'All' ? undefined : category, limit: 30, sort: sort === 'newest' ? 'newest' : undefined }
          });
          if (alive) {
            setResults(data.articles || []);
            setReasons({});
            setSearched(true);
          }
        }
      } catch {
        if (alive) setResults([]);
      } finally {
        if (alive) setLoading(false);
      }
    };
    run();
    return () => { alive = false; };
  }, [dq, category, sort]);

  const submit = e => {
    e.preventDefault();
    setParams(q.trim() ? { q: q.trim() } : {});
  };

  return (
    <div className="pt-7">
      <h1 className="text-[30px] font-bold tracking-tight">Search</h1>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row" role="search">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Try “open source”, “sleep”, “passkeys”…"
            aria-label="Search stories"
            className="h-11 w-full rounded-md border border-border bg-surface pl-10 pr-3 text-[14px] focus:border-accent/60 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select value={category} onChange={e => setCategory(e.target.value)} aria-label="Filter by category" className="h-11 rounded-md border border-border bg-surface px-3 text-[13.5px]">
            {['All', 'Technology', 'AI', 'Programming', 'Startups', 'Business', 'Science', 'Finance', 'Gaming', 'Sports', 'Entertainment', 'World', 'Politics', 'Health', 'Education'].map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All topics' : c}</option>
            ))}
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort results" className="h-11 rounded-md border border-border bg-surface px-3 text-[13.5px]">
            <option value="relevance">Relevance</option>
            <option value="newest">Newest</option>
            <option value="personal">Most relevant to me</option>
          </select>
        </div>
      </form>

      <div className="mt-6">
        {loading ? (
          <SkeletonList n={4} />
        ) : !searched ? (
          <EmptyState
            title="Search stories, topics and sources"
            body="Results match titles, descriptions, tags and categories. Try a topic you follow."
          />
        ) : sorted.length === 0 ? (
          <EmptyState
            title="No stories found"
            body="Try a different keyword or category."
            action={<Link to="/explore" className="text-sm text-accentHover hover:underline">Browse explore instead</Link>}
          />
        ) : (
          <>
            <p className="text-[13px] text-muted">{sorted.length} {sorted.length === 1 ? 'result' : 'results'}</p>
            <div className="divide-y divide-border">
              {sorted.map(a => <HorizontalArticleCard key={a._id} article={a} reason={reasons[a._id]} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
