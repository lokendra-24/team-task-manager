import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Zap } from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Projects",  path: "/projects",  icon: FolderKanban   },
  { name: "Tasks",     path: "/tasks",      icon: CheckSquare    },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-200 bg-white">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-100 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
            <Zap size={16} fill="currentColor" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">TaskFlow</span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3 pt-4">
          <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Menu
          </p>
          {NAV_ITEMS.map(({ name, path, icon: Icon }) => {
            const active = location.pathname.startsWith(path);
            return (
              <Link
                key={name}
                to={path}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  size={17}
                  className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                <span>{name}</span>
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="shrink-0 border-t border-slate-100 p-3">
          <div className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-sm font-bold text-white shadow-sm">
              {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">{user?.full_name}</p>
              <p className="truncate text-xs capitalize text-slate-400">{user?.role}</p>
            </div>
            <button
              title="Logout"
              onClick={() => { logout(); navigate("/login"); }}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 opacity-0 transition-all duration-150
                         hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ml-64 flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-end gap-3 border-b border-slate-200 bg-white/80 px-8 backdrop-blur-sm">
          <span className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            Live
          </span>
        </header>

        {/* Page content */}
        <div className="flex-1 p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
