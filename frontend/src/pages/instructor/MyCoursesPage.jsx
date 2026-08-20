import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CalendarDays, Search, Users } from "lucide-react";

const COURSES = [
  {
    id: 1,
    name: "Data Analysis for Evidence-Based Decision Making",
    code: "SCM-DA-2026",
    intake: "September 2026 intake",
    schedule: "Mon & Wed, 09:00 - 11:00",
    room: "Room 204",
    students: 42,
    progress: 68,
    nextTopic: "Regression analysis",
    status: "In progress",
  },
  {
    id: 2,
    name: "Project Planning and Management",
    code: "SCM-PP-2026",
    intake: "August 2026 intake",
    schedule: "Tue & Thu, 10:00 - 12:00",
    room: "Room 108",
    students: 36,
    progress: 84,
    nextTopic: "Project risk management",
    status: "In progress",
  },
  {
    id: 3,
    name: "Research Methods in Public Administration",
    code: "SCM-RM-2026",
    intake: "Weekend intake",
    schedule: "Saturday, 14:00 - 15:30",
    room: "Online class",
    students: 50,
    progress: 35,
    nextTopic: "Research design",
    status: "In progress",
  },
  {
    id: 4,
    name: "Public Procurement and Contract Management",
    code: "SCM-PC-2026",
    intake: "June 2026 intake",
    schedule: "Completed",
    room: "Room 301",
    students: 28,
    progress: 100,
    nextTopic: "Final results submitted",
    status: "Completed",
  },
];

export default function MyCoursesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All courses");

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return COURSES.filter((course) => {
      const matchesStatus = status === "All courses" || course.status === status;
      const matchesSearch = !query || `${course.name} ${course.code} ${course.intake}`.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [search, status]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">Teaching workspace</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">My courses</h1>
          <p className="mt-2 text-sm text-slate-600">Manage your assigned courses, teaching progress, and student groups.</p>
        </div>
        <Link to="/instructor" className="text-sm font-semibold text-udom-primary hover:underline">Back to dashboard</Link>
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search courses</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by course, code, or intake" className="w-full rounded-md border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-udom-primary focus:ring-2 focus:ring-udom-primary/20" />
        </label>
        <label>
          <span className="sr-only">Filter courses by status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-udom-primary sm:w-44">
            <option>All courses</option>
            <option>In progress</option>
            <option>Completed</option>
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {filteredCourses.map((course) => (
          <article key={course.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-udom-primary"><BookOpen className="h-5 w-5" /></span>
                <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{course.code}</p><h2 className="mt-1 font-semibold leading-5 text-slate-900">{course.name}</h2></div>
              </div>
              <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${course.status === "Completed" ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-700"}`}>{course.status}</span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <p><Users className="mr-2 inline h-4 w-4 text-slate-400" />{course.students} enrolled students</p>
              <p><CalendarDays className="mr-2 inline h-4 w-4 text-slate-400" />{course.intake}</p>
            </div>
            <p className="mt-3 text-xs text-slate-500">{course.schedule} &middot; {course.room}</p>

            <div className="mt-5"><div className="flex justify-between text-xs text-slate-500"><span>Teaching progress</span><span>{course.progress}%</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-udom-primary" style={{ width: `${course.progress}%` }} /></div><p className="mt-2 text-xs text-slate-500">Next: {course.nextTopic}</p></div>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <Link to={`/instructor/courses/${course.id}`} className="rounded-md bg-udom-primary px-3 py-2 text-xs font-semibold text-white hover:bg-udom-primary-dark">Open course</Link>
              <Link to={`/instructor/courses/${course.id}/students`} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">View students</Link>
            </div>
          </article>
        ))}
      </div>

      {filteredCourses.length === 0 && <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No courses match your search.</div>}
    </div>
  );
}
