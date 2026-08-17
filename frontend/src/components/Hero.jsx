// src/components/Hero.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/courses?search=${encodeURIComponent(trimmed)}` : "/courses");
  }

  return (
    <section className="bg-udom-primary text-white">
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="inline-block rounded-full bg-udom-accent px-4 py-1 text-xs font-semibold uppercase tracking-wider">
          Professional development for today’s careers
        </p>

        <h1 className="mt-6 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          Advance your skills with practical short courses
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base text-white/80 sm:text-lg">
          Discover career-focused programs designed for students, professionals,
          and organizations seeking relevant, flexible learning for real-world impact.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-9 flex max-w-xl flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="course-search" className="sr-only">
            Search courses
          </label>
          <input
            id="course-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for a course, certificate, or skill"
            className="w-full rounded-md border border-white/20 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-udom-accent"
          />
          <button
            type="submit"
            className="rounded-md bg-udom-accent px-7 py-3 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Search
          </button>
        </form>
      </div>
    </section>
  );
}
