import { useParams, Link } from "react-router-dom";
import { FEATURED_COURSES } from "../../data/homeData.js";

function formatFee(fee) {
  return `TZS ${Number(fee).toLocaleString()}`;
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const course = FEATURED_COURSES.find((c) => String(c.id) === id);

  if (!course) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">
          Not found
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          We couldn't find that course
        </h1>
        <Link
          to="/courses"
          className="mt-6 inline-block text-sm font-semibold text-udom-primary hover:underline"
        >
          Back to all courses
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <Link to="/courses" className="text-sm font-semibold text-udom-primary hover:underline">
        ← Back to courses
      </Link>

      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-udom-primary">
        {course.categoryName} &middot; {course.courseCode}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
        {course.name}
      </h1>
      <p className="mt-4 text-slate-600">{course.description}</p>

      <dl className="mt-8 grid grid-cols-2 gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Duration</dt>
          <dd className="mt-1 font-semibold text-slate-900">
            {course.durationValue} {course.durationUnit}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Mode</dt>
          <dd className="mt-1 font-semibold text-slate-900">{course.deliveryMode}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Fee</dt>
          <dd className="mt-1 font-semibold text-slate-900">{formatFee(course.defaultFee)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Status</dt>
          <dd className="mt-1 font-semibold text-slate-900">{course.status}</dd>
        </div>
      </dl>

      <Link
        to={`/courses/${course.id}/apply`}
        className="mt-8 inline-block rounded-xl bg-udom-accent px-6 py-3 text-sm font-semibold text-white hover:brightness-95"
      >
        Apply now
      </Link>
    </section>
  );
}