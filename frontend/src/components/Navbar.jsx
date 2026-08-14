// src/components/Navbar.jsx
import { Link, NavLink } from "react-router-dom";

const NAV_LINKS = [
  { to: "/courses", label: "Courses" },
  { to: "/how-to-apply", label: "How to apply" },
  { to: "/fees", label: "Fees" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-udom-primary shadow-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link to="/" className="flex items-center gap-3">
        <img
            src="/tanzania-emblem.png"
            alt="United Republic of Tanzania emblem"
            className="hidden h-10 w-10 object-contain sm:block"
          />
          <img
            src="/udom-logo.png"
            alt="University of Dodoma logo"
            className="h-10 w-10 object-contain"
          />
          
          <span className="leading-tight text-white">
            <span className="block text-sm font-semibold">
              University of Dodoma
            </span>
            <span className="block text-[11px]  tracking-widest text-white/70">
              Embracing Knowledge
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `text-sm text-white/80 transition hover:text-white ${
                    isActive ? "text-white underline underline-offset-8" : ""
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden rounded-md border border-white/40 px-4 py-2 text-sm text-white transition hover:bg-white/10 sm:block"
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
      </nav>
    </header>
  );
}
