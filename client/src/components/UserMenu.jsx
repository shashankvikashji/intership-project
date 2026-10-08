import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UserMenu() {
  const { user, isAuthed, logout } = useAuth();

  if (!isAuthed) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/login" className="hidden rounded-md px-3 py-1.5 text-[13.5px] text-muted hover:text-paper sm:block">
          Sign in
        </Link>
        <Link to="/register" className="rounded-md bg-accent px-3 py-1.5 text-[13.5px] font-medium text-white hover:bg-accentHover">
          Get started
        </Link>
      </div>
    );
  }

  const initial = (user?.name || user?.email || 'U').trim().charAt(0).toUpperCase();
  return (
    <div className="group relative">
      <Link
        to="/profile"
        aria-label="Profile"
        className="grid h-8 w-8 place-items-center rounded-full border border-border bg-surface2 text-[13px] font-semibold text-paper hover:border-accent/50"
      >
        {initial}
      </Link>
      <div className="invisible absolute right-0 top-full w-48 translate-y-1 rounded-lg border border-border bg-surface p-1 opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:translate-y-2 group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="px-3 py-2">
          <p className="truncate text-[13.5px] font-medium">{user?.name}</p>
          <p className="truncate text-xs text-muted">{user?.email}</p>
        </div>
        <div className="h-px bg-border" />
        <Link to="/profile" className="block rounded-md px-3 py-2 text-[13.5px] text-muted hover:bg-surface2 hover:text-paper">Profile</Link>
        <Link to="/preferences" className="block rounded-md px-3 py-2 text-[13.5px] text-muted hover:bg-surface2 hover:text-paper">Interests</Link>
        <Link to="/history" className="block rounded-md px-3 py-2 text-[13.5px] text-muted hover:bg-surface2 hover:text-paper">History</Link>
        {(user?.role === 'admin') && (
          <Link to="/admin" className="block rounded-md px-3 py-2 text-[13.5px] text-muted hover:bg-surface2 hover:text-paper">Admin dashboard</Link>
        )}
        <button onClick={logout} className="block w-full rounded-md px-3 py-2 text-left text-[13.5px] text-muted hover:bg-surface2 hover:text-paper">
          Sign out
        </button>
      </div>
    </div>
  );
}
