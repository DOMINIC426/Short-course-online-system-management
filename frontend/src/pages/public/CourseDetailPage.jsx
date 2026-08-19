import { useParams, Link } from "react-router-dom";
import { FEATURED_COURSES, COURSE_INTAKES } from "../../data/homeData.js";
import { Calendar, MapPin, Users } from "lucide-react";

function formatFee(fee) {
  return `TZS ${Number(fee).toLocaleString()}`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const course = FEATURED_COURSES.find((c) => String(c.id) === id);
  const intakes = COURSE_INTAKES.filter((i) => String(i.courseId) === id);

  if (!course) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">Not found</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">We couldn't find that course</h1>
        <Link to="/courses" className="mt-6 inline-block text-sm font-semibold text-udom-primary hover:underline">
          ← Back to all courses
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <Link to="/courses" className="text-sm font-semibold text-udom-primary hover:underline">
        ← Back to courses
      </Link>

      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-udom-primary">
        {course.categoryName} &middot; {course.courseCode}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">{course.courseName}</h1>
      <p className="mt-4 text-slate-600">{course.description}</p>

      <dl className="mt-8 grid grid-cols-2 gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Duration</dt>
          <dd className="mt-1 font-semibold text-slate-900">
            {course.durationValue} {course.durationUnit}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Training hours</dt>
          <dd className="mt-1 font-semibold text-slate-900">{course.trainingHours} hrs</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Default fee</dt>
          <dd className="mt-1 font-semibold text-slate-900">{formatFee(course.defaultFee)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Pass mark</dt>
          <dd className="mt-1 font-semibold text-slate-900">{course.passMark}%</dd>
        </div>
      </dl>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">Who this course is for</p>
          <p className="mt-1 text-sm text-slate-600">{course.targetAudience}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">Prerequisites</p>
          <p className="mt-1 text-sm text-slate-600">{course.preRequest}</p>
        </div>
      </div>

      {/* Intakes */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Available intakes</h2>
        <p className="mt-1 text-sm text-slate-600">
          Choose an intake below to apply. You can only apply to intakes that are open.
        </p>

        {intakes.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No intakes are currently scheduled for this course.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {intakes.map((intake) => {
              const isOpen = intake.status === "OPEN";
              return (
                <div
                  key={intake.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{intake.name}</p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          isOpen ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {intake.status}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {formatDate(intake.startDate)} – {formatDate(intake.endDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {intake.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> Capacity {intake.capacity}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Register by {formatDate(intake.registrationDeadline)} &middot; {formatFee(intake.fee)}
                    </p>
                  </div>

                  {isOpen ? (
                    <Link
                      to={`/intakes/${intake.id}/apply`}
                      className="flex-shrink-0 rounded-xl bg-udom-accent px-5 py-2.5 text-center text-sm font-semibold text-white hover:brightness-95"
                    >
                      Apply now
                    </Link>
                  ) : (
                    <span className="flex-shrink-0 rounded-xl border border-slate-200 px-5 py-2.5 text-center text-sm font-medium text-slate-400">
                      Registration closed
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}