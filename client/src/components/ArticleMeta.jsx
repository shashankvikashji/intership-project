import { timeAgo, readingTime } from '../lib/api';

export default function ArticleMeta({ article, light = false }) {
  if (!article) return null;
  const cls = light ? 'text-muted' : 'text-muted';
  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] ${cls}`}>
      <span className="font-medium text-paper/80">{article.source || 'Lumen Wire'}</span>
      <span aria-hidden="true">·</span>
      <span>{timeAgo(article.publishedAt)}</span>
      <span aria-hidden="true">·</span>
      <span>{readingTime(article)}</span>
    </div>
  );
}
