import { useEffect, useState } from "react";
import { createInstructor, deleteInstructor, getCourses, getInstructors, removeInstructorFromCourse } from "../../api/marketApi.js";
import { api } from "../../api/backendClient.js";

const initialForm = { firstName: "", lastName: "", email: "", phone: "", courseId: "" };

export default function MarketInstructorsPage() {
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [instructorToAssign, setInstructorToAssign] = useState(null);
  const [courseSearch, setCourseSearch] = useState("");

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

  async function assignExisting(course) {
    if (!instructorToAssign) return;
    try {
      await api.patch(`/api/v1/market/courses/${course.id}/assign-instructor/${instructorToAssign.userId}`);
      await load();
      setMessage(`${instructorToAssign.name} was assigned successfully to ${course.courseCode}.`);
      setInstructorToAssign(null);
      setCourseSearch("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to assign instructor.");
    }
  }

  async function removeAssignment(instructor, course) {
    if (!window.confirm(`Remove ${instructor.name} from ${course.courseCode} - ${course.title}?`)) return;
    try {
      await removeInstructorFromCourse(course.id, instructor.id);
      setMessage(`${instructor.name} was removed from ${course.courseCode}.`);
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to remove instructor from course.");
    }
  }

  async function deleteInstructorAccount(instructor) {
    if (!window.confirm(`Delete instructor ${instructor.name}? This will remove their account.`)) return;
    try {
      await deleteInstructor(instructor.id);
      setMessage(`${instructor.name} was deleted successfully.`);
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to delete instructor.");
    }
  }

  const filteredInstructors = instructors.filter((instructor) =>
    instructor.name.toLowerCase().includes(search.trim().toLowerCase()) ||
    instructor.email.toLowerCase().includes(search.trim().toLowerCase())
  );
  const matchingCourses = courses.filter((course) => `${course.courseCode} ${course.title}`.toLowerCase().includes(courseSearch.trim().toLowerCase()));

  return (
    <section className="mx-auto max-w-7xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#07529b]">Teaching team</p>
      <h1 className="mt-2 text-3xl font-extrabold">Instructors</h1>
      {message && <p role="alert" className="mt-5 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-[#07529b]">{message}</p>}
      <form onSubmit={submit} className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
        <h2 className="text-lg font-extrabold sm:col-span-2 lg:col-span-3">Create and assign instructor</h2>
        {[["firstName", "First name"], ["lastName", "Last name"], ["email", "Email", "email"], ["phone", "Phone"]].map(([name, label, type = "text"]) => <label key={name} className="text-sm font-semibold">{label}<input required name={name} type={type} value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>)}
        <label className="text-sm font-semibold sm:col-span-2 lg:col-span-3">Assign course<select required name="courseId" value={form.courseId} onChange={(event) => setForm({ ...form, courseId: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal"><option value="">Select course code</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.courseCode} - {course.title}</option>)}</select></label>
        <button className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white sm:col-span-2 lg:col-span-3">Create instructor</button>
      </form>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-lg font-extrabold">Instructor assignments</h2>
        <label className="text-sm font-semibold">Search instructor name<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Type a name" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 font-normal sm:w-72" /></label>
      </div>
      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-220 text-left text-sm"><thead className="bg-blue-50 text-xs uppercase tracking-wide"><tr><th className="px-5 py-3">Instructor</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Assigned courses</th><th className="px-5 py-3">Action</th></tr></thead><tbody>{filteredInstructors.map((instructor) => <tr key={instructor.id} className="border-t border-slate-100"><td className="px-5 py-3"><div className="flex items-center gap-3"><div className="font-bold">{instructor.name}</div>{instructor.status === "ACTIVE" ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">Active</span> : <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">{instructor.status}</span>}</div></td><td className="px-5 py-3 text-slate-500">{instructor.email}</td><td className="px-5 py-3"><div className="flex min-w-80 flex-col gap-2">{instructor.assignedCourses?.length ? instructor.assignedCourses.map((course) => <div key={course.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"><span className="font-semibold">{course.courseCode} - {course.title}</span><button type="button" onClick={() => removeAssignment(instructor, course)} className="shrink-0 rounded-md border border-red-200 px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-50">Remove</button></div>) : <span className="text-slate-500">No courses assigned</span>}</div></td><td className="px-5 py-3"><div className="flex flex-col gap-2"><button type="button" onClick={() => setInstructorToAssign(instructor)} className="rounded-lg bg-[#07529b] px-3 py-1.5 text-xs font-bold text-white">Assign to course</button><button type="button" onClick={() => deleteInstructorAccount(instructor)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100">Delete instructor</button></div></td></tr>)}{filteredInstructors.length === 0 && <tr><td colSpan="4" className="px-5 py-6 text-center text-slate-500">No instructors match your search.</td></tr>}</tbody></table></div></div>
      {instructorToAssign && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="assign-course-title"><div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h2 id="assign-course-title" className="text-xl font-extrabold">Assign course</h2><p className="mt-1 text-sm text-slate-600">Choose a course for {instructorToAssign.name}.</p></div><button type="button" onClick={() => { setInstructorToAssign(null); setCourseSearch(""); }} className="text-2xl leading-none text-slate-500 hover:text-slate-900" aria-label="Close">×</button></div><label className="mt-5 block text-sm font-semibold">Search course<input autoFocus value={courseSearch} onChange={(event) => setCourseSearch(event.target.value)} placeholder="Search by code or title" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label><div className="mt-4 max-h-72 space-y-2 overflow-y-auto">{matchingCourses.map((course) => <button type="button" key={course.id} onClick={() => assignExisting(course)} className="w-full rounded-lg border border-slate-200 p-3 text-left hover:border-[#07529b] hover:bg-blue-50"><span className="block font-bold">{course.courseCode}</span><span className="block text-sm text-slate-600">{course.title}</span></button>)}{matchingCourses.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No courses match your search.</p>}</div></div></div>}
    </section>
  );
}
