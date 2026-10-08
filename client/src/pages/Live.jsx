import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, Newspaper, ExternalLink, Radio, RefreshCw } from 'lucide-react';
import api, { timeAgo } from '../lib/api';
import CategoryTabs from '../components/CategoryTabs';
import EmptyState, { SkeletonCard } from '../components/EmptyState';

// Auto-refresh cadence. The server caches GNews for 5 min, so a 15-min
// visible-tab-only poll costs at most ~4 upstream requests/hour per query
// — well inside the free tier (~100 req/day).
const AUTO_REFRESH_MS = 15 * 60 * 1000;
// Tab-focus refetch only fires when data is older than this (avoids a
// request on every tab switch).
const FOCUS_STALENESS_MS = 5 * 60 * 1000;

const DEFAULT_CATS = ['General', 'Technology', 'Business', 'Sports', 'Science', 'Health'];

function useDebounced(value, ms) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="100%" height="100%" fill="#1c1f2a"/><g fill="none" stroke="#5b6172" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" transform="translate(296,140) scale(3)"><path d="M4 5h16v11H4z"/><path d="M8 5V3h12v10"/><path d="M7 9h10M7 12h10M7 15h6"/></g></svg>`
  );

function LiveImage({ article }) {
  const [src, setSrc] = useState(article.image || FALLBACK_IMG);
  useEffect(() => { setSrc(article.image || FALLBACK_IMG); }, [article.image]);
  return (
    <div className="overflow-hidden">
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => { if (src !== FALLBACK_IMG) setSrc(FALLBACK_IMG); }}
        className="card-img aspect-[16/9] w-full object-cover"
      />
    </div>
  );
}

function LiveCard({ article }) {
  return (
    <article className="group lift flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors duration-200 hover:border-[#3a3e4b] hover:bg-surface2/50">
      <LiveImage article={article} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-accentHover">
            {article.category}
          </span>
          {article.live && (
            <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accentHover">
              <Radio size={11} /> Live
            </span>
          )}
        </div>
        <h3 className="mt-1.5 line-clamp-2 text-[16px] font-semibold leading-snug tracking-tight">
          {article.title}
        </h3>
        {article.description && (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">{article.description}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-3 text-[12px] text-muted">
          <span className="font-medium text-paper/80">{article.source || 'Unknown source'}</span>
          <span aria-hidden="true">·</span>
          <span>{timeAgo(article.publishedAt)}</span>
        </div>
        {article.url ? (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] font-medium text-paper transition-colors hover:border-accent/50 hover:text-accentHover"
          >
            Read original <ExternalLink size={13} />
          </a>
        ) : (
          <span className="mt-3 inline-flex w-fit items-center gap-1.5 text-[13px] text-muted">
            <Newspaper size={14} /> Source link unavailable
          </span>
        )}
      </div>
    </article>
  );
}

export default function Live() {
  const [cats] = useState(DEFAULT_CATS);
  const [active, setActive] = useState('General');
  const [q, setQ] = useState('');
  const [articles, setArticles] = useState([]);
  const [meta, setMeta] = useState({ source: 'seed', configured: false });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [rateLimited, setRateLimited] = useState(false);
  const [now, setNow] = useState(Date.now());

  const articlesRef = useRef([]);
  articlesRef.current = articles;

  const dq = useDebounced(q, 400);
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  const fetchLive = useCallback(async ({ background = false, fresh = false } = {}) => {
    if (background) setRefreshing(true);
    else { setLoading(true); setError(''); }
    setNotice('');
    try {
      const { data } = await api.get('/live', {
        params: { category: active, q: dq.trim() || undefined, pageSize: 12, fresh: fresh ? '1' : undefined }
      });
      const sorted = [...(data.articles || [])].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      setArticles(sorted);
      setMeta({ source: data.source, configured: data.configured, stale: data.stale });
      setLastUpdated(data.fetchedAt || new Date().toISOString());
      setRateLimited(false);
      if (!background) setError('');
    } catch (err) {
      const limited = err.response?.status === 429 || err.response?.data?.rateLimited;
      const msg = err.response?.data?.error || 'Could not load live headlines. Check your connection and retry.';
      if (limited) setRateLimited(true);
      if (background && articlesRef.current.length > 0) {
        // Background refresh failed: keep showing the current headlines.
        setNotice(limited
          ? 'Rate limit reached — auto-refresh paused. Showing last headlines.'
          : 'Could not refresh just now. Showing last headlines.');
      } else {
        setArticles([]);
        setError(msg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [active, dq]);

  // Initial load + refetch when filters change.
  useEffect(() => {
    let alive = true;
    (async () => { if (alive) await fetchLive(); })();
    return () => { alive = false; };
  }, [fetchLive]);

  // Periodic refresh — visible tab only, paused while rate-limited.
  useEffect(() => {
    if (rateLimited) return undefined;
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') fetchLive({ background: true });
    }, AUTO_REFRESH_MS);
    return () => clearInterval(t);
  }, [fetchLive, rateLimited]);

  // Refetch when the tab regains focus, but only if data is stale.
  useEffect(() => {
    const onVisible = () => {
      if (rateLimited || document.visibilityState !== 'visible' || !lastUpdated) return;
      if (Date.now() - new Date(lastUpdated).getTime() > FOCUS_STALENESS_MS) {
        fetchLive({ background: true });
      }
    };
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchLive, rateLimited, lastUpdated]);

  // Ticker so "Last updated Xm ago" stays fresh without API calls.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  void now;

  return (
    <div className="pt-7">
      <p className="text-[14px] text-muted">{today}</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-[30px] font-bold tracking-tight sm:text-[34px]">Today&apos;s headlines</h1>
        {meta.source === 'gnews' ? (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-accentHover">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Live from GNews
          </span>
        ) : (
          !loading && (
            <span className="text-[13px] text-muted">Showing demo stories — add a GNews key for live news</span>
          )
        )}
      </div>
      <p className="mt-1 text-[14px] text-muted">Fresh stories as they happen, with links to the original reporting.</p>

      <div className="relative mt-4 max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search today's news…"
          aria-label="Search live news"
          className="h-11 w-full rounded-md border border-border bg-surface pl-10 pr-3 text-[14px] placeholder:text-muted/70 focus:border-accent/60 focus:outline-none"
        />
      </div>

      <div className="mt-4">
        <CategoryTabs categories={cats} active={active} onChange={setActive} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-[13px] text-muted" title={lastUpdated ? new Date(lastUpdated).toLocaleString() : undefined}>
          {loading
            ? 'Fetching headlines…'
            : lastUpdated
              ? <>Last updated {timeAgo(lastUpdated)}{meta.stale ? ' (cached copy)' : ''}</>
              : 'Not updated yet'}
        </p>
        <button
          onClick={() => fetchLive({ fresh: true })}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] font-medium text-paper transition-colors hover:border-accent/50 hover:text-accentHover disabled:cursor-wait disabled:opacity-60"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : undefined} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
        {rateLimited && !loading && (
          <span className="text-[13px] text-muted">Rate limit reached — auto-refresh paused, retry manually later.</span>
        )}
      </div>

      {notice && !loading && (
        <p className="mt-3 rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-muted">{notice}</p>
      )}

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="mt-6">
          <EmptyState
            title="Live news is unavailable"
            body={error}
            action={
              <button
                onClick={() => fetchLive()}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accentHover"
              >
                Retry
              </button>
            }
          />
        </div>
      ) : articles.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No headlines right now" body="Try a different topic or search term." />
        </div>
      ) : (
        <div className="stagger mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map(a => <LiveCard key={a._id} article={a} />)}
        </div>
      )}
    </div>
  );
}
