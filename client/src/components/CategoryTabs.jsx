export default function CategoryTabs({ categories, active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Categories">
      {categories.map(c => {
        const isActive = active === c;
        return (
          <button
            key={c}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(c)}
            className={`whitespace-nowrap rounded-md border px-3 py-1.5 text-[13px] transition-colors duration-150 ${
              isActive
                ? 'border-accent/50 bg-accent/15 text-paper'
                : 'border-border bg-transparent text-muted hover:border-border hover:text-paper'
            }`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
