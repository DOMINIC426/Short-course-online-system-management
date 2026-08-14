// src/components/CourseCard.jsx
import { Link } from "react-router-dom";

export default function CourseCard({ course }) {
  const almostFull = course.seatsLeft <= 10;

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-udom-primary/40 hover:shadow-xl">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-udom-primary">
          {course.college} • {course.code}
        </span>
        {almostFull && (
          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-udom-accent">
            {course.seatsLeft} seats left
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {course.tags?.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-600"
          >
            {tag}
          </span>
        ))}
      </div>

      <h3 className="mt-4 text-xl font-bold leading-snug text-slate-900">
        {course.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {course.summary}
      </p>

      <dl className="mt-6 space-y-3 border-t border-slate-100 pt-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-500">Duration</dt>
          <dd className="font-medium text-slate-800">{course.duration}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-500">Mode</dt>
          <dd className="text-right font-medium text-slate-800">{course.mode}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-500">Fee</dt>
          <dd className="font-bold text-slate-900">{course.fee}</dd>
        </div>
      </dl>

      <Link
        to={`/courses/${course.id}`}
        className="mt-6 inline-flex items-center justify-center rounded-xl border border-udom-primary px-4 py-2.5 text-sm font-semibold text-udom-primary transition hover:bg-udom-primary hover:text-white"
      >
        View details
      </Link>
    </article>
  );
}
