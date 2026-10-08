import { useEffect, useState } from 'react';
import api from '../lib/api';
import { HorizontalArticleCard } from '../components/ArticleCards';
import { SkeletonCard } from '../components/EmptyState';
import EmptyState from '../components/EmptyState';

const PAGE_SIZE = 12;

export default function Latest() {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.get('/articles', { params: { limit: PAGE_SIZE, sort: 'newest', page: 1 } })
      .then(({ data }) => {
        if (!alive) return;
        setArticles(data.articles || []);
        setPage(data.page || 1);
        setPages(data.pages || 1);
      })
      .catch(() => { if (alive) setError('Could not load latest stories.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const loadMore = async () => {
    setMoreLoading(true);
    try {
      const { data } = await api.get('/articles', { params: { limit: PAGE_SIZE, sort: 'newest', page: page + 1 } });
      setArticles(prev => [...prev, ...(data.articles || [])]);
      setPage(data.page || page + 1);
      setPages(data.pages || pages);
    } catch {
      setError('Could not load more stories.');
    } finally {
      setMoreLoading(false);
    }
  };

  return (
    <div className="pt-7">
      <h1 className="text-[30px] font-bold tracking-tight">Latest news</h1>
      <p className="mt-1 text-[14px] text-muted">Every story in reverse-chronological order — no ranking applied.</p>
      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error && articles.length === 0 ? (
        <div className="mt-6"><EmptyState title="Something went wrong" body={error} /></div>
      ) : (
        <>
          <div className="stagger mt-4 divide-y divide-border">
            {articles.map(a => <HorizontalArticleCard key={a._id} article={a} />)}
          </div>
          {page < pages && (
            <button
              onClick={loadMore}
              disabled={moreLoading}
              className="mt-6 w-full rounded-md border border-border py-2.5 text-[14px] text-muted hover:text-paper disabled:opacity-50"
            >
              {moreLoading ? 'Loading…' : 'Load more'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
