import { useState } from "react";
import { Link, NavLink, Navigate, Outlet } from "react-router-dom";
import { LayoutDashboard, BookOpen, Tags, Users, BarChart3, Settings, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const LINKS = [
  ["/market/dashboard", "Dashboard", LayoutDashboard],
  ["/market/courses", "Short Courses", BookOpen],
  ["/market/categories", "Categories", Tags],
  ["/market/instructors", "Instructors", Users],
  ["/market/settings", "Settings", Settings],
];

function Navigation({ onNavigate }) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-5">
      {LINKS.map(([to, label, Icon]) => (
        <NavLink key={to} to={to} onClick={onNavigate} className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
            isActive ? "bg-white/15 text-white" : "text-blue-100 hover:bg-white/10 hover:text-white"
          }`
        }>
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function MarketLayout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "MARKETING_OFFICER") return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col bg-[#07529b] text-white lg:flex">
        <Link to="/market/dashboard" className="flex items-center gap-2 border-b border-white/15 px-5 py-5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-sm font-extrabold text-[#07529b]">SC</span>
          <span className="font-extrabold tracking-wide">SCMS</span>
        </Link>
        <Navigation />
        <div className="border-t border-white/15 p-4">
          <p className="truncate text-xs text-blue-100">{user.email}</p>
          <button onClick={logout} className="mt-3 flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>

      {menuOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#07529b] text-white transition-transform lg:hidden ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-white/15 px-5 py-5">
          <span className="font-extrabold">SCMS</span>
          <button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button>
        </div>
        <Navigation onNavigate={() => setMenuOpen(false)} />
      </aside>

      <div className="lg:pl-56">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8">
          <button className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu /></button>
          <p className="text-sm font-semibold text-slate-500">Market Operations</p>
          <div className="flex items-center gap-3 text-sm font-semibold"><span className="hidden sm:inline">M. Officer</span><span className="grid h-8 w-8 place-items-center rounded-full bg-[#07529b] text-xs text-white">MO</span><button onClick={logout} title="Log out" aria-label="Log out" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-2 text-slate-600 hover:bg-slate-50 hover:text-[#07529b]"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">Log out</span></button></div>
        </header>
        <main className="p-4 sm:p-8"><Outlet /></main>
      </div>
    </div>
  );
}