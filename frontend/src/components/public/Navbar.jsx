// src/components/Navbar.jsx
import { Link, NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LayoutDashboard, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/courses", label: "Courses" },
  { href: "/#how-to-apply", label: "How to apply", isHashLink: true },
  { to: "/fees", label: "Fees" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!accountRef.current?.contains(event.target)) {
        setIsAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function closeMenus() {
    setIsMenuOpen(false);
    setIsAccountOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenus();
    navigate("/");
  }

  function handleHowToApplyClick(event) {
    event.preventDefault();
    setIsMenuOpen(false);

    if (location.pathname === "/") {
      window.history.pushState(null, "", "/#how-to-apply");
      document.getElementById("how-to-apply")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    navigate("/#how-to-apply");
  }

  return (
    <header className="sticky top-0 z-50 bg-udom-primary shadow-sm">
      {/* Desktop/Tablet Navbar */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <img
            src="/tanzania-emblem.png"
            alt="United Republic of Tanzania emblem"
            className="h-8 w-8 object-contain sm:h-10 sm:w-10"
          />
          <img
            src="/udom-logo.png"
            alt="University of Dodoma logo"
            className="h-8 w-8 object-contain sm:h-10 sm:w-10"
          />
          
          <span className="leading-tight text-white">
            <span className="block text-xs sm:text-sm font-semibold">
              University of Dodoma
            </span>
            <span className="block text-[10px] sm:text-[11px] tracking-widest text-white/70">
              Embracing Knowledge
            </span>
          </span>
        </Link>

        {/* Desktop Navigation - Hidden on mobile */}
        <ul className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              {link.isHashLink ? (
                <a
                  href={link.href}
                  onClick={handleHowToApplyClick}
                  className="text-sm text-white/80 transition hover:text-white"
                >
                  {link.label}
                </a>
              ) : (
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `text-sm text-white/80 transition hover:text-white ${
                      isActive ? "text-white underline underline-offset-8" : ""
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              )}
            </li>
          ))}
        </ul>

        {/* Desktop Auth Actions - Hidden on mobile */}
        <div className="hidden items-center gap-3 sm:flex">
          {user ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setIsAccountOpen((isOpen) => !isOpen)}
                aria-expanded={isAccountOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <UserCircle className="h-5 w-5" strokeWidth={1.8} />
                Account
                <ChevronDown className={`h-4 w-4 transition ${isAccountOpen ? "rotate-180" : ""}`} />
              </button>

              {isAccountOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg" role="menu">
                  <p className="truncate px-3 py-2 text-xs text-slate-500">
                    {user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user.email}
                  </p>
                  <Link to="/dashboard" onClick={closeMenus} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link to="/applications" onClick={closeMenus} className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem">
                    My applications
                  </Link>
                  <Link to="/profile" onClick={closeMenus} className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem">
                    My profile
                  </Link>
                  <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2 mt-1 text-left text-sm text-slate-600 hover:bg-slate-100" role="menuitem">
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="rounded-md border border-white/40 px-4 py-2 text-sm text-white transition hover:bg-white/10">
                Log in
              </Link>
              <Link to="/register" className="rounded-md bg-udom-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95">
                Apply now
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex lg:hidden flex-col gap-1.5 p-2"
        >
          <span className={`h-0.5 w-6 bg-white transition ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
          <span className={`h-0.5 w-6 bg-white transition ${isMenuOpen ? "opacity-0" : ""}`}></span>
          <span className={`h-0.5 w-6 bg-white transition ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
        </button>
      </nav>

      {/* Mobile Menu - Shows when hamburger is clicked */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-udom-primary-dark">
          <div className="mx-auto max-w-6xl px-6 py-4 space-y-3">
            {/* Mobile Navigation Links */}
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  {link.isHashLink ? (
                    <a
                      href={link.href}
                      onClick={handleHowToApplyClick}
                      className="block py-2 text-sm text-white/80 transition hover:text-white"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <NavLink
                      to={link.to}
                      end={link.end}
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        `block py-2 text-sm text-white/80 transition hover:text-white ${
                          isActive ? "font-semibold text-white" : ""
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>

            {/* Mobile Auth Actions */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              {user ? (
                <>
                  <p className="px-4 py-1 text-xs text-white/60">
                    Signed in as {user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user.email}
                  </p>
                  <Link to="/dashboard" onClick={closeMenus} className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
                    <LayoutDashboard className="h-4 w-4" />
                    Account dashboard
                  </Link>
                  <Link to="/applications" onClick={closeMenus} className="rounded-md px-4 py-2 text-sm text-white/80 hover:bg-white/10">
                    My applications
                  </Link>
                  <Link to="/profile" onClick={closeMenus} className="rounded-md px-4 py-2 text-sm text-white/80 hover:bg-white/10">
                    My profile
                  </Link>
                  <button type="button" onClick={handleLogout} className="flex items-center gap-2 rounded-md px-4 py-2 text-left text-sm text-white/80 hover:bg-white/10">
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenus} className="rounded-md border border-white/40 px-4 py-2 text-sm text-white transition hover:bg-white/10 text-center">
                    Log in
                  </Link>
                  <Link to="/register" onClick={closeMenus} className="rounded-md bg-udom-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 text-center">
                    Apply now
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
