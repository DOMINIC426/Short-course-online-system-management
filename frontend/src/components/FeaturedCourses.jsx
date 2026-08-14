// src/components/FeaturedCourses.jsx
import { Link } from "react-router-dom";
import CourseCard from "./CourseCard";
import { FEATURED_COURSES } from "../data/homeData";

export default function FeaturedCourses() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-udom-primary">
              Featured programmes
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Professional short courses for career growth
            </h2>
            <p className="mt-3 max-w-2xl text-base text-slate-600">
              Practical, industry-relevant programmes designed for working professionals,
              graduates and public-sector staff.
            </p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-sm font-semibold text-udom-primary transition hover:text-udom-primary-dark"
          >
            View all programmes <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {FEATURED_COURSES.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}
