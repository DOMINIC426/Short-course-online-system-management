// src/components/Navbar.jsx
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/courses", label: "Courses" },
  { href: "/#how-to-apply", label: "How to apply", isHashLink: true },
  { to: "/fees", label: "Fees" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

        {/* Desktop Auth Buttons - Hidden on mobile */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            to="/login"
            className="rounded-md border border-white/40 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-md bg-udom-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Apply now
          </Link>
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

            {/* Mobile Auth Buttons */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-md border border-white/40 px-4 py-2 text-sm text-white transition hover:bg-white/10 text-center"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-md bg-udom-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 text-center"
              >
                Apply now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
