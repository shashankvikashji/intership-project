import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { FeaturedArticle, ArticleCard } from '../components/ArticleCards';
import { SkeletonCard } from '../components/EmptyState';
import EmptyState from '../components/EmptyState';

// Dedicated personalized feed with an honest explanation of the ranking.
export default function ForYou() {
  const { isAuthed, user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [reasons, setReasons] = useState({});
  const [personalized, setPersonalized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.get('/recommendations/feed', { params: { limit: 15 } })
      .then(({ data }) => {
        if (!alive) return;
        setArticles(data.articles || []);
        setReasons(data.reasons || {});
        setPersonalized(Boolean(data.personalized));
      })
      .catch(() => { if (alive) setError('Could not load your feed.'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const [featured, ...rest] = articles;

  return (
    <div className="pt-7">
      <h1 className="text-[30px] font-bold tracking-tight">For you</h1>
      <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-muted">
        Ranked by a rule-based score — your interests, reading history, recency and popularity.
        Every pick carries a short reason. No black-box ML.
      </p>
      {!personalized && !loading && (
        <p className="mt-3 rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-muted">
          {isAuthed ? (
            <>Add <Link to="/preferences" className="text-accentHover hover:underline">interests</Link> and read a few stories to personalize this feed.</>
          ) : (
            <><Link to="/login" className="text-accentHover hover:underline">Sign in</Link> and pick interests for picks tuned to you.</>
          )}
        </p>
      )}
      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="mt-6"><EmptyState title="Something went wrong" body={error} /></div>
      ) : articles.length === 0 ? (
        <div className="mt-6"><EmptyState title="Your feed is empty" body="New stories will appear here." /></div>
      ) : (
        <>
          {featured && <div className="anim-fade-up mt-6"><FeaturedArticle article={featured} reason={reasons[featured._id]} /></div>}
          <div className="stagger mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map(a => <ArticleCard key={a._id} article={a} reason={reasons[a._id]} />)}
          </div>
          <p className="mt-6 text-[12.5px] text-muted">
            Interests: {(user?.interests?.length ? user.interests : ['not set']).join(' · ')}
          </p>
        </>
      )}
    </div>
  );
}
