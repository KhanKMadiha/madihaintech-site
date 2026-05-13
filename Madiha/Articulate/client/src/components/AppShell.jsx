import { Link, useLocation } from "react-router-dom";

export default function AppShell({ children, streak }) {
  const { pathname } = useLocation();
  const { weekCount, allTimeCount } = streak;

  const nav = [
    { to: "/", label: "Today" },
    { to: "/favourites", label: "Library" },
    { to: "/settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col pb-24 md:pb-8">
      <header className="border-b border-border bg-paper/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex flex-col min-w-0">
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-inkMuted">Daily practice</span>
            <span className="font-serif text-xl text-ink truncate">Articulate</span>
          </Link>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="font-sans text-[10px] uppercase tracking-wider text-inkMuted">This week</p>
              <p className="font-sans text-lg font-semibold text-ink tabular-nums">{weekCount}</p>
            </div>
            <div className="w-px h-8 bg-border" aria-hidden />
            <div className="text-right">
              <p className="font-sans text-[10px] uppercase tracking-wider text-inkMuted">All time</p>
              <p className="font-sans text-lg font-semibold text-ink tabular-nums">{allTimeCount}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">{children}</main>

      <nav
        className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-paper/95 backdrop-blur-md md:hidden"
        aria-label="Primary"
      >
        <div className="max-w-2xl mx-auto flex">
          {nav.map(({ to, label }) => {
            const active = pathname === to || (to !== "/" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`flex-1 py-3 text-center text-sm font-medium ${
                  active ? "text-accent" : "text-inkMuted"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="hidden md:block border-t border-border">
        <div className="max-w-2xl mx-auto px-4 py-6 flex gap-8 text-sm text-inkMuted">
          {nav.map(({ to, label }) => (
            <Link key={to} to={to} className="hover:text-accent transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
