import { useEffect, useState } from 'react';
import api from '../lib/api';
import CategoryTabs from '../components/CategoryTabs';
import { FeaturedArticle, ArticleCard } from '../components/ArticleCards';
import { SkeletonCard } from '../components/EmptyState';
import EmptyState from '../components/EmptyState';

const DEFAULT_CATS = ['All', 'Technology', 'AI', 'Programming', 'Startups', 'Business', 'Science', 'Finance', 'Gaming', 'Sports', 'Entertainment', 'World', 'Politics', 'Health', 'Education'];

export default function Explore() {
  const [cats, setCats] = useState(DEFAULT_CATS);
  const [active, setActive] = useState('All');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/articles/categories').then(({ data }) => {
      const names = (data.categories || []).map(c => c.name);
      if (names.length) {
        const ordered = ['All', ...DEFAULT_CATS.slice(1).filter(c => names.includes(c)), ...names.filter(n => !DEFAULT_CATS.includes(n))];
        setCats(ordered);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api.get('/articles', { params: { category: active === 'All' ? undefined : active, limit: 24 } })
      .then(({ data }) => { if (alive) setArticles(data.articles || []); })
      .catch(() => { if (alive) setError('Could not load stories.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [active]);

  const [first, ...rest] = articles;

  return (
    <div className="pt-7">
      <h1 className="text-[30px] font-bold tracking-tight">Explore</h1>
      <p className="mt-1 text-[14px] text-muted">Find something outside your usual feed.</p>
      <div className="mt-4">
        <CategoryTabs categories={cats} active={active} onChange={setActive} />
      </div>

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="mt-6"><EmptyState title="Something went wrong" body={error} /></div>
      ) : articles.length === 0 ? (
        <div className="mt-6"><EmptyState title="No stories here yet" body="Try a different category." /></div>
      ) : (
        <>
          {active === 'All' && first && (
            <div className="mt-6"><FeaturedArticle article={first} /></div>
          )}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(active === 'All' ? rest : articles).map(a => <ArticleCard key={a._id} article={a} />)}
          </div>
        </>
      )}
    </div>
  );
}
