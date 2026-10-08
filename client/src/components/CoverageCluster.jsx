import { Link } from 'react-router-dom';
import { Newspaper } from 'lucide-react';
import { CompactArticleCard } from './ArticleCards';

// Topic cluster: other stories about the same event, grouped by
// keyword/topic similarity on the backend — never unrelated stories.
export default function CoverageCluster({ cluster, summary }) {
  if (!cluster || cluster.length === 0) return null;
  const bySource = cluster.map(a => a.source).filter(Boolean);
  return (
    <section aria-label="Different coverage" className="mt-6 rounded-lg border border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Newspaper size={15} className="text-accentHover" />
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-paper">Different coverage</h2>
        <span className="ml-auto text-[11.5px] text-muted">{cluster.length} related {cluster.length === 1 ? 'story' : 'stories'}</span>
      </div>
      <div className="px-4 py-3">
        {summary?.length > 0 && (
          <div className="mb-3 rounded-md bg-ink px-3 py-2.5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted">Lumen summary</p>
            <ul className="mt-1 space-y-1">
              {summary.map((p, i) => <li key={i} className="text-[13.5px] leading-relaxed text-paper/90">• {p}</li>)}
            </ul>
          </div>
        )}
        <div className="grid gap-x-8 sm:grid-cols-2">
          {cluster.map(a => (
            <div key={a._id} className="border-b border-border py-1 last:border-0">
              <CompactArticleCard article={a} />
              {a.source && <p className="-mt-1 pb-1 pl-[92px] text-[12px] text-muted/90">via {a.source}</p>}
            </div>
          ))}
        </div>
        {bySource.length > 0 && (
          <p className="mt-2 text-[12px] text-muted">Sources in this cluster: {[...new Set(bySource)].join(' · ')}</p>
        )}
      </div>
    </section>
  );
}
