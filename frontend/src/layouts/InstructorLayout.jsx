import { useEffect, useRef, useState } from "react";
import { Outlet, Navigate, Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Megaphone,
  Award,
  UserCircle,
  Menu,
  X,
  LogOut,
  Bell,
} from "lucide-react";

const INSTRUCTOR_LINKS = [
  { to: "/instructor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/instructor/courses", label: "Assigned Courses", icon: BookOpen },
  { to: "/instructor/students", label: "Enrolled Students", icon: Users },
  { to: "/instructor/announcements", label: "Send Announcements", icon: Megaphone },
  { to: "/instructor/certificates", label: "Manage Certificates Eligibility", icon: Award },
  { to: "/instructor/profile", label: "My Profile", icon: UserCircle },
];

function SidebarLinks({ links, onLinkClick }) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-white/12 text-white shadow-sm ring-1 ring-white/10"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
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

export default function InstructorLayout() {
  const { user, logout } = useAuth();
  const userMenuRef = useRef(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const displayName = user && user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user?.email || "Instructor";

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "IN";

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }

    function handleEscapeKey(event) {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsDrawerOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    document.body.style.overflow = isDrawerOpen ? "hidden" : "";

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only INSTRUCTOR role can access this layout
  if (String(user.role || "").toUpperCase() !== "INSTRUCTOR") {
    const rolePathMap = {
      ADMIN: "/admin/dashboard",
      COORDINATOR: "/coordinator/dashboard",
      STUDENT: "/dashboard",
      MARKETING_OFFICER: "/market/dashboard",
    };
    const redirectPath = rolePathMap[user.role];
    if (redirectPath) {
      return <Navigate to={redirectPath} replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#edf2f8] text-slate-800">
      {/* Desktop Sidebar */}
      <aside className="hidden w-[290px] flex-shrink-0 flex-col bg-[#0b4d94] text-white sm:flex">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
            <img src="/udom-logo.png" alt="University of Dodoma logo" className="h-8 w-8" />
          </div>
          <div className="leading-tight">
            <p className="text-[1.05rem] font-bold">University of Dodoma</p>
            <p className="text-[11px] text-white/75">Embracing Knowledge</p>
          </div>
        </div>

        <SidebarLinks links={INSTRUCTOR_LINKS} />
      </aside>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setIsDrawerOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col bg-[#0b4d94] text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
                  <img src="/udom-logo.png" alt="University of Dodoma logo" className="h-7 w-7" />
                </div>
                <span className="text-sm font-bold">Instructor Portal</span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-lg p-2 text-white/80 transition hover:bg-white/5"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarLinks links={INSTRUCTOR_LINKS} onLinkClick={() => setIsDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Top Header Navbar */}
        <header className="flex h-[90px] items-center justify-between border-b border-slate-200 bg-white px-5 shadow-sm sm:px-8">
          <div className="flex items-center gap-3 sm:hidden">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <div className="hidden flex-1 sm:block" />

          <div className="flex items-center gap-3">
            {/* Announcement / Notification Bell */}
            <Link
              to="/instructor/announcements"
              onClick={() => setIsUserMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
              aria-label="Announcements"
            >
              <Bell className="h-4 w-4" strokeWidth={2} />
            </Link>

            {/* Profile Avatar Menu Dropdown */}
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((value) => !value)}
                className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5 text-left shadow-sm transition hover:bg-slate-100"
              >
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0b4d94] text-xs font-bold text-white">
                    {initials}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.18)] animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                </div>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-3 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  <div className="flex items-center gap-3 px-2 py-2">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b4d94] text-sm font-bold text-white">
                        {initials}
                      </div>
                      <span
                        className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.14),0_0_18px_rgba(52,211,153,0.9)] animate-pulse"
                        aria-label="online status"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-600">
                        Online
                      </p>
                    </div>
                  </div>

                  

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={2} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Outlet Render Area */}
        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}