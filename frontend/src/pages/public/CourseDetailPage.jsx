import { useLocation, Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  Banknote,
  BookOpen,
} from "lucide-react";

function formatFee(fee) {
  return `TZS ${Number(fee).toLocaleString()}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "Not specified";

  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CourseDetailPage() {
  const location = useLocation();

  const course = location.state?.course;

  /*
   * If the user opens the detail URL directly,
   * there will be no course in router state.
   */
  if (!course) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">
          Course not found
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          We couldn't find that course
        </h1>

        <p className="mt-3 text-sm text-slate-500">
          Please return to the courses page and select a course again.
        </p>

        <Link
          to="/courses"
          className="mt-6 inline-block text-sm font-semibold text-udom-primary hover:underline"
        >
          ← Back to all courses
        </Link>
      </section>
    );
  }

  const isRegistrationOpen =
    course.status === "REGISTRATION_OPEN";

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">

      {/* Back */}
      <Link
        to="/courses"
        className="text-sm font-semibold text-udom-primary hover:underline"
      >
        ← Back to courses
      </Link>

      {/* Header */}
      <div className="mt-6">

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
            {course.courseCode}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              isRegistrationOpen
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {course.status}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          {course.title}
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          {course.description}
        </p>

      </div>

      {/* Course statistics */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Duration */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <Clock className="h-5 w-5 text-udom-primary" />

          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
            Duration
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {course.duration || "Not specified"}
          </p>
        </div>

        {/* Course Fee */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <Banknote className="h-5 w-5 text-udom-primary" />

          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
            Course fee
          </p>

          <p className="mt-1 font-semibold text-udom-primary">
            {formatFee(course.courseFee)}
          </p>
        </div>

        {/* Minimum Students */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <Users className="h-5 w-5 text-udom-primary" />

          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
            Minimum students
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {course.minStudents ?? "Not specified"}
          </p>
        </div>

        {/* Maximum Students */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <Users className="h-5 w-5 text-udom-primary" />

          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
            Maximum students
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {course.maxStudents ?? "Not specified"}
          </p>
        </div>

      </div>

      {/* Course information */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Course period */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-udom-primary" />

            <h2 className="font-semibold text-slate-900">
              Course schedule
            </h2>
          </div>

          <div className="mt-6 space-y-4">

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Start date
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatDate(course.startDate)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                End date
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatDate(course.endDate)}
              </p>
            </div>

          </div>
        </div>

        {/* Registration */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">

          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-udom-primary" />

            <h2 className="font-semibold text-slate-900">
              Registration period
            </h2>
          </div>

          <div className="mt-6 space-y-4">

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Registration opens
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatDate(course.regOpenDate)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Registration closes
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatDate(course.regCloseDate)}
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Registration action */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Interested in this course?
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Check the registration status and apply when registration is open.
            </p>
          </div>

          {isRegistrationOpen ? (
            <Link
              to={`/courses/${course.courseCode}/apply`}
              state={{ course }}
              className="rounded-xl bg-udom-accent px-6 py-3 text-center text-sm font-semibold text-white transition hover:brightness-95"
            >
              Apply now
            </Link>
          ) : (
            <span className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-center text-sm font-medium text-slate-400">
              Registration closed
            </span>
          )}

        </div>

      </div>

    </section>
  );
}