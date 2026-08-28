import { Link } from "react-router-dom";

function formatFee(fee) {
  return `TZS ${Number(fee).toLocaleString()}`;
}

export default function CourseCard({ course }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-udom-primary/50 hover:shadow-lg">
      {/* Badge: category + code */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-udom-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-udom-primary">
          {course.categoryName}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
          {course.courseCode}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-4 text-xl font-bold leading-snug text-slate-900">
        {course.courseName}
      </h3>

      {/* Description – fixed height to keep cards aligned */}
      <p className="mt-2.5 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600">
        {course.description}
      </p>

      {/* Meta info */}
      <dl className="mt-auto space-y-2.5 border-t border-slate-100 pt-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-500">Duration</dt>
          <dd className="font-medium text-slate-800">
            {course.durationValue} {course.durationUnit}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-500">Fee</dt>
          <dd className="font-bold text-udom-primary">{formatFee(course.defaultFee)}</dd>
        </div>
      </dl>

      {/* CTA */}
      <Link
        to={`/courses/${course.id}`}
        className="mt-6 inline-flex items-center justify-center rounded-xl border border-udom-primary bg-udom-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:border-udom-accent hover:bg-udom-accent hover:text-white focus:outline-none focus:ring-2 focus:ring-udom-primary/40"
      >
        View details
      </Link>
    </article>
  );
}