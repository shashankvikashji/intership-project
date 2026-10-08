export default function EmptyState({ title, body, action }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <h3 className="text-[16px] font-semibold">{title}</h3>
      {body && <p className="mx-auto mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-muted">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SkeletonCard({ horizontal = false }) {
  if (horizontal) {
    return (
      <div className="flex gap-4 border-b border-border py-4" aria-hidden="true">
        <div className="shimmer h-20 w-28 shrink-0 rounded-md" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-3 w-20 rounded bg-surface2" />
          <div className="h-4 w-3/4 rounded bg-surface2" />
          <div className="h-3 w-1/2 rounded bg-surface2" />
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border" aria-hidden="true">
      <div className="shimmer aspect-[16/9]" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-20 rounded bg-surface2" />
        <div className="h-4 w-full rounded bg-surface2" />
        <div className="h-3 w-2/3 rounded bg-surface2" />
      </div>
    </div>
  );
}

export function SkeletonList({ n = 5 }) {
  return (
    <div>
      {Array.from({ length: n }).map((_, i) => (
        <SkeletonCard key={i} horizontal />
      ))}
    </div>
  );
}
