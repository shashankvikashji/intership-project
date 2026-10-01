import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-ink text-paper">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-[12.5px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            <span className="font-semibold text-paper/80">Lumen</span> — news that learns what you read.
          </p>
          <p>Demo dataset for development. Connect a news API key to go live.</p>
        </div>
      </footer>
    </div>
  );
}
