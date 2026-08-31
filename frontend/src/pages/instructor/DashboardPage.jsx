import { Link } from "react-router-dom";
import { MY_COURSES } from "../../data/instructorData.js";
import { MapPin, Users, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">Instructor</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">My courses</h1>
      <p className="mt-2 text-sm text-slate-600">Courses currently assigned to you.</p>

      <div className="mt-8 space-y-4">
        {MY_COURSES.map((course) => (
          <div key={course.intakeId} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{course.courseName}</p>
                <p className="mt-0.5 text-xs text-slate-500">{course.intakeName}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  course.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700" :
                  course.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" :
                  "bg-slate-100 text-slate-500"
                }`}
              >
                {course.status.replace(/_/g, " ")}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {course.venue}</span>
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {course.studentCount} students</span>
              <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> {course.progressPercent}% complete</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to={`/instructor/courses/${course.intakeId}/students`}
                className="rounded-lg border border-udom-primary px-3.5 py-2 text-xs font-semibold text-udom-primary hover:bg-udom-primary hover:text-white"
              >
                View students
              </Link>
              <Link
                to={`/instructor/courses/${course.intakeId}/progress`}
                className="rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Update progress
              </Link>
              <Link
                to={`/instructor/courses/${course.intakeId}/certificates`}
                className="rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Certificate eligibility
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}