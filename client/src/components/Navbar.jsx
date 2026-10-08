import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Bookmark, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Lumen home">
      <span className="grid h-7 w-7 place-items-center rounded-md bg-accent/15 border border-accent/30">
        <svg width="15" height="15" viewBox="0 0 32 32" aria-hidden="true">
          <path d="M10 8v13.5L21 8v13.5" stroke="#A78BFA" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-[17px] font-semibold tracking-tight">Lumen</span>
    </Link>
  );
}

export default function Navbar() {
  const { isAuthed } = useAuth();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const link = ({ isActive }) =>
    `text-[14px] transition-colors ${isActive ? 'text-paper font-medium' : 'text-muted hover:text-paper'}`;

  const submit = e => {
    e.preventDefault();
    navigate(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : '/search');
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-ink/90 backdrop-blur">
      <div className="mx-auto flex h-[60px] max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-5 md:flex" aria-label="Primary">
          <NavLink to="/" className={link}>Home</NavLink>
          <NavLink to="/for-you" className={link}>For You</NavLink>
          <NavLink to="/latest" className={link}>Latest</NavLink>
          <NavLink to="/trending" className={link}>Trending</NavLink>
          <NavLink to="/explore" className={link}>Explore</NavLink>
          <NavLink to="/live" className={link}>Live</NavLink>
          <NavLink to="/saved" className={link}>Saved</NavLink>
        </nav>

        <form onSubmit={submit} className="ml-auto hidden min-w-0 flex-1 max-w-xs items-center sm:flex" role="search">
          <div className="relative w-full">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search stories, topics…"
              aria-label="Search stories"
              className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-[13.5px] placeholder:text-muted/70 focus:border-accent/60 focus:outline-none"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <Link to="/saved" aria-label="Saved stories" className="hidden rounded-md p-2 text-muted hover:bg-surface hover:text-paper sm:block">
            <Bookmark size={18} />
          </Link>
          <UserMenu />
          <button className="rounded-md p-2 text-muted hover:bg-surface md:hidden" onClick={() => setOpen(v => !v)} aria-label="Menu" aria-expanded={open}>
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="menu-pop border-t border-border px-4 py-3 md:hidden">
          <form onSubmit={submit} className="mb-3 sm:hidden" role="search">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search stories…"
              aria-label="Search stories"
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus:border-accent/60 focus:outline-none"
            />
          </form>
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {[
              ['/', 'Home'],
              ['/for-you', 'For You'],
              ['/latest', 'Latest'],
              ['/trending', 'Trending'],
              ['/explore', 'Explore'],
              ['/live', 'Live'],
              ['/saved', 'Saved'],
              ['/history', 'History'],
              ['/preferences', 'Interests']
            ].map(([to, label]) => (
              <Link key={to} to={to} onClick={() => setOpen(false)} className="rounded-md px-2 py-2 text-[15px] text-muted hover:bg-surface hover:text-paper">
                {label}
              </Link>
            ))}
            {!isAuthed && (
              <Link to="/login" onClick={() => setOpen(false)} className="rounded-md bg-accent px-3 py-2 text-center text-sm font-medium text-white">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
