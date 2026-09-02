
import { useState } from "react";
import { Navigate, Outlet, Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ShieldCheck,
  KeyRound,
  Settings,
  ClipboardList,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";

const ADMIN_LINKS = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/users",
    label: "User Management",
    icon: Users,
  },

  {
    to: "/admin/roles",
    label: "Roles",
    icon: ShieldCheck,
  },
  {
    to: "/admin/permissions",
    label: "Permissions & RBAC",
    icon: KeyRound,
  },
  {
    to: "/admin/settings",
    label: "System Settings",
    icon: Settings,
  },
  {
    to: "/admin/audit-logs",
    label: "Audit Logs",
    icon: ClipboardList,
  },
];

function SidebarContent({ onLinkClick }) {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Brand */}
      <div className="border-b border-slate-200 px-5 py-5">
        <Link
          to="/admin/dashboard"
          onClick={onLinkClick}
          className="flex items-center gap-3"
        >
          <img
            src="/udom-logo.png"
            alt="University of Dodoma"
            className="h-11 w-11 object-contain"
          />

          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900">
              UDOM
            </p>
            <p className="truncate text-xs text-slate-500">
              SCMS Administration
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Administration
        </p>

        {ADMIN_LINKS.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onLinkClick}
              className={({ isActive }) =>
                [
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-udom-primary text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")
              }
            >
              <Icon
                className="h-[18px] w-[18px] shrink-0"
                strokeWidth={2}
              />

              <span className="flex-1">
                {link.label}
              </span>

              <ChevronRight
                className="h-4 w-4 opacity-0 transition group-hover:opacity-60"
              />
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-200 p-3">
        <div className="mb-3 rounded-lg bg-slate-50 px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Signed in as
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-slate-900">
            {user?.email || "Administrator"}
          </p>

          <span className="mt-1 inline-block text-xs font-medium text-udom-primary">
            Administrator
          </span>
        </div>

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign out
        </button>
      </div>
    </>
  );
}

export default function AdminLayout() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-end border-b border-slate-200 px-4 py-3">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
              <SidebarContent
                onLinkClick={() => setMobileOpen(false)}
              />
            </div>
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Short Course Management System
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">
                University of Dodoma
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">
                Administrator
              </p>
              </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-udom-primary text-sm font-bold text-white">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

