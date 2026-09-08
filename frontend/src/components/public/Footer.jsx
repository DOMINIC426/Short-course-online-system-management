// src/components/Footer.jsx
import { Link } from "react-router-dom";

const QUICK_LINKS = [
  { to: "/courses", label: "All short courses" },
  { to: "/#how-to-apply", label: "Application process" },
];

export default function Footer() {
  return (
    <footer className="bg-udom-primary-dark text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              University of Dodoma
            </p>
            <h3 className="mt-3 text-2xl font-bold text-white">
              Short courses for practical growth
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Flexible, career-focused learning designed for professionals and
              graduates seeking relevant skills and recognised certification.
            </p>
          </div>

          <div className="lg:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Quick links
            </p>
            <ul className="mt-4 space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/80 hover:text-white hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <p className="mx-auto max-w-6xl px-6 py-5 text-center text-xs text-white/60">
          &copy; {new Date().getFullYear()} University of Dodoma &middot; Short
          Course Management System
        </p>
      </div>
    </footer>
  );
}
