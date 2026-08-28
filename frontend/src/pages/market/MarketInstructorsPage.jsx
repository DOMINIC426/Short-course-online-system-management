import { useEffect, useState } from "react";
import { createInstructor, getCourses, getInstructors } from "../../api/marketApi.js";
import { api } from "../../api/backendClient.js";

const initialForm = { firstName: "", lastName: "", email: "", phone: "", courseId: "" };

export default function MarketInstructorsPage() {
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  async function load() {
    const [instructorData, courseData] = await Promise.all([getInstructors(), getCourses()]);
    setInstructors(instructorData);
    setCourses(courseData);
  }

  useEffect(() => { load().catch(() => setMessage("Unable to load instructors or courses.")); }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      await createInstructor({ ...form, courseId: Number(form.courseId) });
      setForm(initialForm);
      setMessage("Instructor created and assigned. Initial password: 123456");
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to create instructor.");
    }
  }

  async function assignExisting(instructor) {
    const courseId = window.prompt(`Enter the course ID to assign ${instructor.name}:`);
    if (!courseId) return;
    try {
      await api.patch(`/api/v1/market/courses/${courseId}/assign-instructor/${instructor.userId}`);
      setMessage(`${instructor.name} assigned successfully.`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to assign instructor.");
    }
  }

  return (
    <section className="mx-auto max-w-7xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#07529b]">Teaching team</p>
      <h1 className="mt-2 text-3xl font-extrabold">Instructors</h1>
      {message && <p className="mt-5 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-[#07529b]">{message}</p>}
      <form onSubmit={submit} className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
        <h2 className="text-lg font-extrabold sm:col-span-2 lg:col-span-3">Create and assign instructor</h2>
        {[["firstName", "First name"], ["lastName", "Last name"], ["email", "Email", "email"], ["phone", "Phone"]].map(([name, label, type = "text"]) => <label key={name} className="text-sm font-semibold">{label}<input required name={name} type={type} value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>)}
        <label className="text-sm font-semibold sm:col-span-2 lg:col-span-3">Assign course<select required name="courseId" value={form.courseId} onChange={(event) => setForm({ ...form, courseId: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal"><option value="">Select course code</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.courseCode} - {course.title}</option>)}</select></label>
        <button className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white sm:col-span-2 lg:col-span-3">Create instructor</button>
      </form>
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-160 text-left text-sm"><thead className="bg-blue-50 text-xs uppercase tracking-wide"><tr><th className="px-5 py-3">Instructor</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Action</th></tr></thead><tbody>{instructors.filter((instructor) => instructor.status === "ACTIVE").map((instructor) => <tr key={instructor.id} className="border-t border-slate-100"><td className="px-5 py-3 font-bold">{instructor.name}</td><td className="px-5 py-3 text-slate-500">{instructor.email}</td><td className="px-5 py-3"><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">Active</span></td><td className="px-5 py-3"><button onClick={() => assignExisting(instructor)} className="rounded-lg bg-[#07529b] px-3 py-1.5 text-xs font-bold text-white">Assign to course</button></td></tr>)}</tbody></table></div></div>
    </section>
  );
}
