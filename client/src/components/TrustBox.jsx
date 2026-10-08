import { ShieldCheck } from 'lucide-react';

// Transparent source information. Statuses derive from real signals
// (related-source count + freshness) — never a true/false verdict.
const STATUS = {
  'well-supported': { dot: '🟢', label: 'Well supported', hint: 'Covered by several sources and still fresh.' },
  limited: { dot: '🟡', label: 'Limited coverage', hint: 'Few related sources found so far.' },
  insufficient: { dot: '⚪', label: 'Insufficient information', hint: 'Treat single-source details with care.' }
};

export default function TrustBox({ trust }) {
  if (!trust) return null;
  const s = STATUS[trust.status] || STATUS.insufficient;
  const rows = [
    ['Source', trust.source || 'Unknown'],
    ['Author', trust.author || '—'],
    ['Published', trust.publishedAt ? new Date(trust.publishedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'],
    ['Freshness', trust.freshness || 'unknown'],
    ['Related sources', `${trust.sourceCount ?? 0} source${(trust.sourceCount ?? 0) === 1 ? '' : 's'} · ${trust.relatedCount ?? 0} related ${trust.relatedCount === 1 ? 'story' : 'stories'}`]
  ];
  return (
    <section aria-label="Source information" className="mt-6 rounded-lg border border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <ShieldCheck size={15} className="text-accentHover" />
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-paper">Source information</h2>
      </div>
      <dl className="space-y-1.5 px-4 py-3 text-[13.5px]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-3">
            <dt className="w-32 shrink-0 text-muted">{k}</dt>
            <dd className="text-paper/90">
              {k === 'Source' && trust.sourceUrl ? (
                <a href={trust.sourceUrl} target="_blank" rel="noreferrer" className="text-accentHover hover:underline">{v} ↗</a>
              ) : v}
            </dd>
          </div>
        ))}
        <div className="flex gap-3 border-t border-border pt-2">
          <dt className="w-32 shrink-0 text-muted">Status</dt>
          <dd className="text-paper/90" title={s.hint}>{s.dot} {s.label} — <span className="text-muted">{s.hint}</span></dd>
        </div>
      </dl>
    </section>
  );
}
