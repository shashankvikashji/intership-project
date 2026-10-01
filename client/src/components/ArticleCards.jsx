import { Link } from 'react-router-dom';
import ArticleMeta from './ArticleMeta';
import BookmarkButton from './BookmarkButton';

function Category({ name }) {
  return (
    <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-accentHover">
      {name}
    </span>
  );
}

export function WhyThis({ text }) {
  if (!text) return null;
  return <p className="mt-1.5 text-[12px] text-muted/90">↳ {text}</p>;
}

// Variant A — large featured
export function FeaturedArticle({ article, reason }) {
  if (!article) return null;
  return (
    <Link
      to={`/article/${article._id}`}
      className="group grid overflow-hidden rounded-lg border border-border bg-surface transition-colors duration-200 hover:border-[#3a3e4b] md:grid-cols-2"
    >
      <div className="overflow-hidden">
        <img
          src={article.image}
          alt=""
          loading="lazy"
          className="card-img aspect-[16/10] h-full w-full object-cover md:aspect-auto md:min-h-[300px]"
        />
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <Category name={article.category} />
        <h2 className="mt-2 font-serif text-[26px] font-semibold leading-[1.2] tracking-tight sm:text-[30px]">
          {article.title}
        </h2>
        <p className="mt-3 line-clamp-2 text-[14px] leading-relaxed text-muted">{article.description}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <ArticleMeta article={article} />
          <BookmarkButton articleId={article._id} />
        </div>
        <WhyThis text={reason} />
      </div>
    </Link>
  );
}

// Variant B — standard grid card
export function ArticleCard({ article, reason }) {
  if (!article) return null;
  return (
    <Link
      to={`/article/${article._id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors duration-200 hover:border-[#3a3e4b] hover:bg-surface2/50"
    >
      <div className="overflow-hidden">
        <img src={article.image} alt="" loading="lazy" className="card-img aspect-[16/9] w-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <Category name={article.category} />
        <h3 className="mt-1.5 line-clamp-2 text-[16px] font-semibold leading-snug tracking-tight">
          {article.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">{article.description}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <ArticleMeta article={article} />
          <BookmarkButton articleId={article._id} size={16} />
        </div>
        <WhyThis text={reason} />
      </div>
    </Link>
  );
}

// Variant C — horizontal row (explore / search / history)
export function HorizontalArticleCard({ article, reason, right }) {
  if (!article) return null;
  return (
    <Link
      to={`/article/${article._id}`}
      className="group flex gap-4 border-b border-border py-5 transition-colors duration-150 last:border-0 hover:bg-surface/40"
    >
      <div className="min-w-0 flex-1">
        <Category name={article.category} />
        <h3 className="mt-1 line-clamp-2 text-[16.5px] font-semibold leading-snug tracking-tight group-hover:underline group-hover:decoration-border group-hover:underline-offset-4">
          {article.title}
        </h3>
        <p className="mt-1 line-clamp-1 text-[13px] text-muted sm:line-clamp-2">{article.description}</p>
        <div className="mt-2">
          <ArticleMeta article={article} />
          <WhyThis text={reason} />
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <div className="overflow-hidden rounded-md">
          <img
            src={article.image}
            alt=""
            loading="lazy"
            className="card-img h-[84px] w-[120px] object-cover sm:h-[96px] sm:w-[150px]"
          />
        </div>
        {right || <BookmarkButton articleId={article._id} size={16} />}
      </div>
    </Link>
  );
}

// Variant D — compact (sidebar "more like this")
export function CompactArticleCard({ article }) {
  if (!article) return null;
  return (
    <Link to={`/article/${article._id}`} className="group flex gap-3 py-3">
      <img src={article.image} alt="" loading="lazy" className="h-16 w-20 shrink-0 rounded-md object-cover" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-accentHover">{article.category}</p>
        <h4 className="line-clamp-2 text-[13.5px] font-medium leading-snug group-hover:underline group-hover:underline-offset-2">
          {article.title}
        </h4>
        <p className="mt-0.5 text-[12px] text-muted">{article.source}</p>
      </div>
    </Link>
  );
}
