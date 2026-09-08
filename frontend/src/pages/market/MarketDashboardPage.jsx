import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, Clock3, Plus, Users } from "lucide-react";
import { getCourses } from "../../api/marketApi.js";

const cards = [
  ["Total short courses", "BookOpen", "bg-orange-300"],
  ["Published courses", "CheckCircle2", "bg-blue-300"],
  ["Draft courses", "Clock3", "bg-orange-300"],
  ["Available seats", "Users", "bg-blue-300"],
];

export default function MarketDashboardPage() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getCourses().then(setCourses).catch(() => setError("Courses could not be loaded."));
  }, []);

  const published = courses.filter((course) => course.status === "PUBLISHED").length;
  const drafts = courses.filter((course) => course.status === "DRAFT").length;
  const seats = courses.reduce((total, course) => total + (course.maxStudents || 0), 0);
  const values = [courses.length, published, drafts, seats];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Market workspace</p>
          <h1 className="mt-3 text-4xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="mt-3 text-base text-gray-600">A clear view of your course catalogue and current capacity.</p>
        </div>
        <Link to="/market/courses" className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all">
          <Plus className="h-5 w-5" /> Add new course
        </Link>
      </div>

      {error && <p className="mb-6 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-200">{error}</p>}

      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, icon, color], index) => { 
          const Icon = { BookOpen, CheckCircle2, Clock3, Users }[icon]; 
          return (
            <div key={label} className={`${color} rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-shadow`}>
              <Icon className="h-8 w-8 opacity-90" />
              <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-white/80">{label}</p>
              <p className="mt-2 text-4xl font-extrabold">{values[index]}</p>
            </div>
          ); 
        })}
      </div>

      <div className="mt-12 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-extrabold text-gray-900">Recent courses</h2>
          <Link to="/market/courses" className="text-sm font-bold text-blue-600 hover:text-blue-800">Manage all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-left text-sm">
            <thead className="bg-blue-50 text-xs font-bold uppercase tracking-wider text-gray-700">
              <tr>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Fee</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {courses.slice(0, 5).map((course) => (
                <tr key={course.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{course.title}</td>
                  <td className="px-6 py-4 text-gray-600">{course.categoryName || "Uncategorised"}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">TZS {Number(course.courseFee).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${course.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {course.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}