import { useEffect, useRef, useState } from "react";
import { Outlet, Navigate, Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Award,
  UserCircle,
  ClipboardCheck,
  MessageSquare,
  Menu,
  X,
  LogOut,
  BookOpen,
  Megaphone,
  Bell,
  User,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

// Sidebar Links configuration for Student role
const STUDENT_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student/courses", label: "Browse courses", icon: BookOpen },
  { to: "/applications", label: "My courses", icon: FileText },
  { to: "/payments", label: "My payments", icon: CreditCard },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/certificates", label: "Certificate status", icon: Award },
  { to: "/student/profile", label: "My profile", icon: UserCircle },
];

// Sidebar Links configuration for Instructor role
const INSTRUCTOR_LINKS = [
  { to: "/instructor", label: "Dashboard", icon: LayoutDashboard },
  { to: "/instructor/courses", label: "My courses", icon: FileText },
  { to: "/instructor/submissions", label: "Submissions", icon: ClipboardCheck },
  { to: "/instructor/messages", label: "Messages", icon: MessageSquare },
  { to: "/student/profile", label: "My profile", icon: UserCircle },
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

function LogoutButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/8 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-white"
    >
      <LogOut className="h-4 w-4" strokeWidth={2} />
      Log out
    </button>
  );
}

export default function StudentLayout() {
  const { user, logout } = useAuth();

  const displayName =
    user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : user?.first_name ||
        user?.name ||
        user?.email ||
        "Student";

  const location = useLocation();
  const userMenuRef = useRef(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Profile completion validation logic: Checks for essential profile fields
  const isProfileIncomplete =
    !user?.levelOfEducation || !user?.nationality || !user?.identificationNumber;

  const isInstructor =
    String(user?.role || "").toUpperCase() === "INSTRUCTOR";

  const portalLinks =
    isInstructor ? INSTRUCTOR_LINKS : STUDENT_LINKS;

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "JD";

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

  // Only STUDENT role can access this layout
  if (user.role !== "STUDENT") {
    const rolePathMap = {
      ADMIN: "/admin/dashboard",
      COORDINATOR: "/coordinator/dashboard",
      INSTRUCTOR: "/instructor/dashboard",
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
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden w-[290px] flex-shrink-0 flex-col bg-[#0b4d94] text-white sm:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
            <img src="/udom-logo.png" alt="University of Dodoma logo" className="h-8 w-8" />
          </div>
          <div className="leading-tight">
            <p className="text-[1.05rem] font-bold">University of Dodoma</p>
            <p className="text-[11px] text-white/75">Embracing Knowledge</p>
          </div>
        </div>

        <SidebarLinks links={portalLinks} />
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
                <span className="text-sm font-bold">Student Portal</span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-lg p-2 text-white/80 transition hover:bg-white/5"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarLinks links={portalLinks} onLinkClick={() => setIsDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        {/* Top Navigation Header */}
        <header className="flex h-[90px] items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 shadow-xs sm:px-8">
          <div className="flex items-center gap-3 sm:hidden">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* Top Center: Animated Incomplete Profile Marquee Banner           */}
          {/* ----------------------------------------------------------------- */}
          {isProfileIncomplete ? (
            <div className="mx-2 flex flex-1 max-w-2xl items-center overflow-hidden">
              <Link
                to="/student/profile"
                className="group flex w-full items-center gap-3 rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50 via-amber-50/90 to-orange-50 px-4 py-2 text-xs shadow-2xs transition hover:border-amber-400 hover:bg-amber-100/70"
                title="Click to update your profile"
              >
                {/* Static Alert Icon with Ping Animation on Badge */}
                <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                  </span>
                  <AlertTriangle className="h-4 w-4" />
                </div>

                {/* Developer Note:
                    - `overflow-hidden` clips the text scrolling outside the banner container.
                    - `animate-marquee` handles the horizontal scrolling text animation.
                    - `pl-[100%]` makes text enter smoothly from the far right edge of the text box.
                */}
                <div className="relative flex-1 overflow-hidden whitespace-nowrap">
                  <span className="animate-marquee inline-block pl-[100%] font-semibold text-amber-950">
                    Action Required: Please complete your profile details (Education Level, Nationality &amp; National ID) to enable short course enrollment.
                  </span>
                </div>

                {/* Static Call-To-Action Link Button */}
                <div className="flex shrink-0 items-center gap-1.5 font-bold text-[#0b4d94] group-hover:underline">
                  <span>Update Profile</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            </div>
          ) : (
            <div className="hidden flex-1 sm:block" />
          )}

          {/* Right Header Navigation Elements */}
          <div className="flex shrink-0 items-center gap-3">
            <Link
              to="/announcements"
              onClick={() => setIsUserMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
              aria-label="Announcements"
            >
              <Bell className="h-4 w-4" strokeWidth={2} />
            </Link>

            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((value) => !value)}
                className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5 text-left shadow-xs transition hover:bg-slate-100"
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
                  <div className="flex items-center gap-3 border-b border-slate-100 px-2 pb-3 pt-2">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b4d94] text-sm font-bold text-white">
                        {initials}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.14),0_0_18px_rgba(52,211,153,0.9)] animate-pulse" aria-label="online status">
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

                  <Link
                    to="/student/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <User className="h-4 w-4" strokeWidth={2} />
                    My profile
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={2} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}