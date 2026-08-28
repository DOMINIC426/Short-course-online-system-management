import { useEffect, useState } from "react";
import { Trash2, Eye, EyeOff, Plus } from "lucide-react";
import { createCourse, deleteCourse, getCourses, setCourseStatus } from "../../api/marketApi.js";

const initialForm = { courseCode: "", title: "", description: "", duration: "", startDate: "", endDate: "", regOpenDate: "", regCloseDate: "", courseFee: "", maxStudents: "", minStudents: "" };

export default function MarketCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  async function loadCourses() { setCourses(await getCourses()); }
  useEffect(() => { loadCourses().catch(() => setMessage("Unable to load courses.")); }, []);

  function updateField(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function submit(event) {
    event.preventDefault();
    try { await createCourse({ ...form, courseFee: Number(form.courseFee), maxStudents: Number(form.maxStudents), minStudents: Number(form.minStudents) }); setForm(initialForm); setShowForm(false); setMessage("Course created successfully."); await loadCourses(); } catch (error) { setMessage(error.response?.data?.message || "Unable to create course."); }
  }
  async function remove(id) { if (!window.confirm("Delete this course?")) return; await deleteCourse(id); await loadCourses(); }
  async function toggle(course) { await setCourseStatus(course.id, course.status !== "PUBLISHED"); await loadCourses(); }

  return <section className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#07529b]">Catalogue</p><h1 className="mt-2 text-3xl font-extrabold">Short Courses</h1><p className="mt-2 text-sm text-slate-500">Create, publish, and maintain the public course catalogue.</p></div><button onClick={() => setShowForm(!showForm)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Add new course</button></div>
    {message && <p className="mt-5 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-[#07529b]">{message}</p>}
    {showForm && <form onSubmit={submit} className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3">{[["courseCode","Course code"],["title","Title"],["duration","Duration"],["startDate","Start date","date"],["endDate","End date","date"],["regOpenDate","Registration opens","date"],["regCloseDate","Registration closes","date"],["courseFee","Course fee","number"],["maxStudents","Maximum students","number"],["minStudents","Minimum students","number"]].map(([name,label,type="text"]) => <label key={name} className="text-sm font-semibold text-slate-700">{label}<input required name={name} type={type} value={form[name]} onChange={updateField} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-[#07529b]" /></label>)}<label className="text-sm font-semibold text-slate-700 sm:col-span-2 lg:col-span-3">Description<textarea required name="description" value={form.description} onChange={updateField} className="mt-1 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-[#07529b]" /></label><button className="rounded-lg bg-[#07529b] px-4 py-2.5 text-sm font-bold text-white sm:col-span-2 lg:col-span-3">Create course</button></form>}
    <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-blue-50 text-xs uppercase tracking-wide text-slate-600"><tr><th className="px-5 py-3">Code</th><th className="px-5 py-3">Title</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Duration</th><th className="px-5 py-3">Fee</th><th className="px-5 py-3">Capacity</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Actions</th></tr></thead><tbody>{courses.map((course) => <tr key={course.id} className="border-t border-slate-100"><td className="px-5 py-3 font-bold text-[#07529b]">{course.courseCode}</td><td className="px-5 py-3 font-semibold">{course.title}</td><td className="px-5 py-3 text-slate-500">{course.categoryName || "Uncategorised"}</td><td className="px-5 py-3">{course.duration}</td><td className="px-5 py-3">TZS {Number(course.courseFee).toLocaleString()}</td><td className="px-5 py-3">{course.maxStudents}</td><td className="px-5 py-3"><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">{course.status}</span></td><td className="px-5 py-3"><div className="flex gap-2"><button title="Toggle visibility" onClick={() => toggle(course)} className="rounded p-1 text-[#07529b] hover:bg-blue-50">{course.status === "PUBLISHED" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button><button title="Delete course" onClick={() => remove(course.id)} className="rounded p-1 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div></div>
  </section>;
}