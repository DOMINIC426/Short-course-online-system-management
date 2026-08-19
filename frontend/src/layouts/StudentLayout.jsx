import { useState } from "react";
import { Outlet, Navigate, Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { LayoutDashboard, FileText, CreditCard, CalendarCheck, Award, UserCircle, Menu, X, LogOut, BookOpen } from "lucide-react";

const PORTAL_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses", label: "Browse courses", icon: BookOpen },
  { to: "/applications", label: "My applications", icon: FileText },
  { to: "/payments", label: "My payments", icon: CreditCard },
  { to: "/attendance", label: "My attendance", icon: CalendarCheck },
  { to: "/results", label: "My results", icon: Award },
  { to: "/certificates", label: "My certificates", icon: Award },
  { to: "/profile", label: "My profile", icon: UserCircle },
];

function SidebarLinks({ onLinkClick }) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {PORTAL_LINKS.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-udom-primary/10 text-udom-primary"
                  : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
            {link.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

function LogoutButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
    >
      <LogOut className="h-4 w-4" strokeWidth={2} />
      Log out
    </button>
  );
}

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white sm:flex">
        <Link to="/" className="flex items-center gap-2 border-b border-slate-200 px-6 py-5">
          <img src="/udom-logo.png" alt="University of Dodoma logo" className="h-8 w-8" />
          <span className="text-sm font-semibold text-slate-900">Student Portal</span>
        </Link>
        <SidebarLinks />
        <div className="border-t border-slate-200 px-3 py-4">
          <p className="px-3 text-xs text-slate-500">Signed in as</p>
          <p className="truncate px-3 text-sm font-semibold text-slate-900">
            {user.fullName || user.username}
          </p>
          <LogoutButton onClick={logout} />
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsDrawerOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <span className="text-sm font-semibold text-slate-900">Student Portal</span>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-500" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarLinks onLinkClick={() => setIsDrawerOpen(false)} />
            <div className="border-t border-slate-200 px-3 py-4">
              <p className="truncate px-3 text-sm font-semibold text-slate-900">
               {user.firstName ? `${user.firstName} ${user.lastName}`.trim() : user.username}
              </p>
              <LogoutButton onClick={logout} />
            </div>
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:hidden">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </button>
          <span className="text-sm font-semibold text-slate-900">Student Portal</span>
          <div className="w-9" />
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}