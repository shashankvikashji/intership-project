import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { ArticleCard } from '../components/ArticleCards';
import { SkeletonCard } from '../components/EmptyState';
import EmptyState from '../components/EmptyState';

export default function Category() {
  const { name } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.get('/articles', { params: { category: name, limit: 24 } })
      .then(({ data }) => { if (alive) setArticles(data.articles || []); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [name]);

  return (
    <div className="pt-7">
      <p className="text-[13px] text-muted"><Link to="/explore" className="hover:text-paper">Explore</Link> / {name}</p>
      <h1 className="mt-1 text-[30px] font-bold tracking-tight">{name}</h1>
      <p className="mt-1 text-[14px] text-muted">{articles.length} {articles.length === 1 ? 'story' : 'stories'}</p>
      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : articles.length === 0 ? (
        <div className="mt-6"><EmptyState title={`No ${name} stories yet`} body="Check back later or browse other topics." action={<Link to="/explore" className="text-sm text-accentHover hover:underline">Back to explore</Link>} /></div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map(a => <ArticleCard key={a._id} article={a} />)}
        </div>
      )}
    </div>
  );
}
