import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import api from '../lib/api';
import { HorizontalArticleCard } from '../components/ArticleCards';
import { SkeletonCard } from '../components/EmptyState';
import EmptyState from '../components/EmptyState';

export default function Trending() {
  const [articles, setArticles] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api.get('/trending', { params: { limit: 15 } })
      .then(({ data }) => {
        if (!alive) return;
        setArticles(data.articles || []);
        setScores(data.scores || {});
      })
      .catch(() => { if (alive) setError('Could not load trending stories.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return (
    <div className="pt-7">
      <div className="flex items-center gap-2">
        <Flame size={22} className="text-accentHover" />
        <h1 className="text-[30px] font-bold tracking-tight">Trending</h1>
      </div>
      <p className="mt-1 text-[14px] text-muted">Ranked by real reader engagement — views, likes, saves and shares — with a freshness boost.</p>
      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="mt-6"><EmptyState title="Something went wrong" body={error} /></div>
      ) : articles.length === 0 ? (
        <div className="mt-6"><EmptyState title="Nothing trending yet" body="Read and like stories and they will surface here." /></div>
      ) : (
        <div className="stagger mt-4 divide-y divide-border">
          {articles.map((a, i) => {
            const s = scores[a._id];
            const detail = s ? `${s.views} reads · ${s.likes} likes · ${s.saves} saves` : '';
            return (
              <div key={a._id} className="flex items-start gap-3">
                <span className="mt-4 w-7 shrink-0 text-center font-serif text-[22px] font-semibold text-muted/70">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <HorizontalArticleCard article={a} />
                  {detail && <p className="-mt-2 pb-3 text-[12px] text-muted">{detail}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
