import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, Clock3, Plus, Users } from "lucide-react";
import { getCourses } from "../../api/marketApi.js";

const cards = [
  ["Total short courses", "BookOpen", "bg-orange-500"],
  ["Published courses", "CheckCircle2", "bg-blue-700"],
  ["Draft courses", "Clock3", "bg-slate-700"],
  ["Available seats", "Users", "bg-emerald-600"],
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
    <section className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#07529b]">Market workspace</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight">Dashboard</h1><p className="mt-2 text-sm text-slate-500">A clear view of your course catalogue and current capacity.</p></div>
        <Link to="/market/courses" className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-orange-600"><Plus className="h-4 w-4" /> Add new course</Link>
      </div>
      {error && <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, icon, color], index) => { const Icon = { BookOpen, CheckCircle2, Clock3, Users }[icon]; return <div key={label} className={`${color} rounded-xl p-5 text-white shadow-sm`}><Icon className="h-6 w-6 opacity-90" /><p className="mt-7 text-xs font-semibold uppercase tracking-wide text-white/75">{label}</p><p className="mt-1 text-3xl font-extrabold">{values[index]}</p></div>; })}
      </div>
      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h2 className="font-extrabold">Recent courses</h2><Link to="/market/courses" className="text-sm font-bold text-[#07529b]">Manage all</Link></div><div className="overflow-x-auto"><table className="w-full min-w-160 text-left text-sm"><thead className="bg-blue-50 text-xs uppercase tracking-wide text-slate-600"><tr><th className="px-5 py-3">Course</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Fee</th><th className="px-5 py-3">Status</th></tr></thead><tbody>{courses.slice(0, 5).map((course) => <tr key={course.id} className="border-t border-slate-100"><td className="px-5 py-3 font-semibold">{course.title}</td><td className="px-5 py-3 text-slate-500">{course.categoryName || "Uncategorised"}</td><td className="px-5 py-3">TZS {Number(course.courseFee).toLocaleString()}</td><td className="px-5 py-3"><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">{course.status}</span></td></tr>)}</tbody></table></div></div>
    </section>
  );
}