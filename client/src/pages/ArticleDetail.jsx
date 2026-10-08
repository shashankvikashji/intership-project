import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Share2, EyeOff, Bookmark } from 'lucide-react';
import api, { timeAgo, readingTime } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { CompactArticleCard } from '../components/ArticleCards';
import EmptyState from '../components/EmptyState';
import AiSummary from '../components/AiSummary';
import AskLumen from '../components/AskLumen';
import TrustBox from '../components/TrustBox';
import CoverageCluster from '../components/CoverageCluster';
import Reveal from '../components/Reveal';

export default function ArticleDetail() {
  const { id } = useParams();
  const { user, isAuthed, liked, saved, interact } = useAuth();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [reasons, setReasons] = useState({});
  const [cluster, setCluster] = useState([]);
  const [lumenSummary, setLumenSummary] = useState([]);
  const [trust, setTrust] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shared, setShared] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    setDismissed(false);
    (async () => {
      try {
        const [{ data: a }, { data: r }, ctx] = await Promise.all([
          api.get(`/articles/${id}`),
          api.get(`/recommendations/related/${id}`),
          api.get(`/articles/${id}/context`).catch(() => null)
        ]);
        if (!alive) return;
        setArticle(a.article);
        setRelated(r.articles || []);
        setReasons(r.reasons || {});
        if (ctx?.data) {
          setCluster(ctx.data.cluster || []);
          setLumenSummary(ctx.data.lumenSummary || []);
          setTrust(ctx.data.trust || null);
        }
      } catch {
        if (alive) setError('This story could not be loaded. It may have been removed.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  // record a view once the article is shown (signed-in only)
  useEffect(() => {
    if (!article || !isAuthed) return;
    const t = setTimeout(() => {
      api.post('/interactions', { articleId: String(article._id), type: 'VIEW' }).catch(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, [article, isAuthed]);

  const needAuth = useCallback((fn) => (...args) => {
    if (!isAuthed) {
      window.location.href = '/login';
      return;
    }
    return fn(...args);
  }, [isAuthed]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl pt-8" aria-label="Loading story">
        <div className="h-4 w-24 animate-pulse rounded bg-surface2" />
        <div className="mt-3 h-9 w-full animate-pulse rounded bg-surface2" />
        <div className="mt-2 h-5 w-2/3 animate-pulse rounded bg-surface2" />
        <div className="mt-4 h-4 w-64 animate-pulse rounded bg-surface2" />
        <div className="mt-6 aspect-[16/9] animate-pulse rounded-lg bg-surface2" />
        <div className="mt-6 space-y-3">
          {[0, 1, 2, 3, 4].map(i => <div key={i} className="h-4 w-full animate-pulse rounded bg-surface2" />)}
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-3xl pt-10">
        <EmptyState title="Story not found" body={error || 'Try another story.'} action={<Link to="/" className="text-sm text-accentHover hover:underline">Back home</Link>} />
      </div>
    );
  }

  const isLiked = liked.has(String(article._id));
  const isSaved = saved.has(String(article._id));
  const paragraphs = String(article.content || article.description || '').split('\n').filter(Boolean);

  const share = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) await navigator.share({ title: article.title, url });
      else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
      if (isAuthed) api.post('/interactions', { articleId: String(article._id), type: 'SHARE' }).catch(() => {});
    } catch { /* user cancelled */ }
  };

  const skip = needAuth(async () => {
    await interact(article._id, 'SKIP');
    setDismissed(true);
  });

  return (
    <div className="pt-7">
      <div className="mx-auto max-w-3xl">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-accentHover">
          <Link to={`/category/${encodeURIComponent(article.category)}`} className="hover:underline">{article.category}</Link>
        </p>
        <h1 className="mt-2 font-serif text-[30px] font-semibold leading-[1.2] tracking-tight sm:text-[36px]">
          {article.title}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{article.description}</p>
        <p className="mt-4 text-[12.5px] text-muted">
          {article.source || 'Lumen Wire'}
          {article.author ? ` · ${article.author}` : ''} · {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : timeAgo(article.publishedAt)} · {readingTime(article)}
        </p>

        {article.image && (
          <img src={article.image} alt="" className="mt-5 aspect-[16/9] w-full rounded-lg border border-border object-cover" />
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2 border-y border-border py-3" role="toolbar" aria-label="Story actions">
          <button
            onClick={needAuth(() => interact(article._id, isLiked ? 'UNLIKE' : 'LIKE'))}
            aria-pressed={isLiked}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[13px] transition-all duration-150 active:scale-[.97] ${isLiked ? 'border-accent/50 bg-accent/15 text-paper' : 'border-border text-muted hover:text-paper'}`}
          >
            <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} /> {isLiked ? 'Liked' : 'Like'}
          </button>
          <button
            onClick={needAuth(() => interact(article._id, isSaved ? 'UNSAVE' : 'SAVE'))}
            aria-pressed={isSaved}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[13px] transition-all duration-150 active:scale-[.97] ${isSaved ? 'border-accent/50 bg-accent/15 text-paper' : 'border-border text-muted hover:text-paper'}`}
          >
            <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} /> {isSaved ? 'Saved' : 'Save'}
          </button>
          <button onClick={share} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[13px] text-muted transition-all duration-150 hover:text-paper active:scale-[.97]">
            <Share2 size={15} /> {shared ? 'Link copied' : 'Share'}
          </button>
          <button onClick={skip} className="ml-auto flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] text-muted transition-all duration-150 hover:text-paper active:scale-[.97]">
            <EyeOff size={15} /> Not interested
          </button>
        </div>

        {dismissed && (
          <p className="mt-3 rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-muted">
            Noted — you'll see fewer stories like this. <Link to="/" className="text-accentHover hover:underline">Back to feed</Link>
          </p>
        )}

        <div className="article-body mt-6 text-[15.5px]">
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        {article.tags?.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {article.tags.map(t => (
              <Link key={t} to={`/search?q=${encodeURIComponent(t)}`} className="rounded-md border border-border px-2.5 py-1 text-[12.5px] text-muted hover:text-paper">
                #{t}
              </Link>
            ))}
          </div>
        )}

        <Reveal><AiSummary articleId={id} /></Reveal>
        <Reveal><AskLumen articleId={id} /></Reveal>
        <Reveal><CoverageCluster cluster={cluster} summary={lumenSummary} /></Reveal>
        <Reveal><TrustBox trust={trust} /></Reveal>
      </div>

      <Reveal as="aside" className="mx-auto mt-10 max-w-3xl border-t border-border pt-6" aria-label="Related stories">
        <h2 className="text-[18px] font-semibold tracking-tight">More like this</h2>
        <div className="mt-2 grid gap-x-8 sm:grid-cols-2">
          {related.slice(0, 4).map(a => (
            <div key={a._id} className="border-b border-border last:border-0">
              <CompactArticleCard article={a} />
              {reasons[a._id] && <p className="-mt-1 pb-2 pl-[92px] text-[12px] text-muted/90">↳ {reasons[a._id]}</p>}
            </div>
          ))}
        </div>
        {related.length === 0 && <p className="mt-2 text-sm text-muted">No closely related stories yet.</p>}
      </Reveal>
    </div>
  );
}
