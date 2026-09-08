import { useEffect, useState } from "react";
import { deleteInstructor, getInstructors, removeInstructorFromCourse } from "../../api/marketApi.js";

export default function ManageInstructorsPage() {
  const [instructors, setInstructors] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedCourses, setSelectedCourses] = useState({});

  async function load() {
    try {
      setInstructors(await getInstructors());
    } catch {
      setMessage("Unable to load instructors.");
    }
  }

  useEffect(() => { load(); }, []);

  async function removeInstructor(instructor) {
    if (!window.confirm(`Delete instructor ${instructor.name}? This also removes their course assignments.`)) return;
    try {
      await deleteInstructor(instructor.id);
      setMessage(`${instructor.name} was deleted successfully.`);
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to delete instructor.");
    }
  }

  async function removeCourseAssignment(instructor) {
    const selectedCourseId = selectedCourses[instructor.id] ?? instructor.assignedCourses?.[0]?.id;
    const course = instructor.assignedCourses?.find((item) => item.id === Number(selectedCourseId));
    if (!course) return;
    if (!window.confirm(`Remove ${instructor.name} from ${course.courseCode} - ${course.title}?`)) return;

    try {
      await removeInstructorFromCourse(course.id, instructor.id);
      setMessage(`${instructor.name} was removed from ${course.courseCode}.`);
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to remove instructor from course.");
    }
  }

  return (
    <section className="mx-auto max-w-7xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#07529b]">Teaching team</p>
      <h1 className="mt-2 text-3xl font-extrabold">Manage instructors</h1>
      <p className="mt-2 text-slate-600">View every instructor, their assigned courses, and remove an instructor when needed.</p>
      {message && <p role="alert" className="mt-5 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-[#07529b]">{message}</p>}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-200 text-left text-sm">
            <thead className="bg-blue-50 text-xs uppercase tracking-wide"><tr><th className="px-5 py-3">Instructor</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Courses taught</th><th className="px-5 py-3">Action</th></tr></thead>
            <tbody>
              {instructors.map((instructor) => <tr key={instructor.id} className="border-t border-slate-100">
                <td className="px-5 py-4 font-bold">{instructor.name}</td>
                <td className="px-5 py-4 text-slate-500">{instructor.email}</td>
                <td className="px-5 py-4">{instructor.assignedCourses?.length ? <div className="flex min-w-90 items-center gap-2"><select value={selectedCourses[instructor.id] ?? instructor.assignedCourses[0].id} onChange={(event) => setSelectedCourses({ ...selectedCourses, [instructor.id]: Number(event.target.value) })} className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold"><option value="" disabled>Select course</option>{instructor.assignedCourses.map((course) => <option key={course.id} value={course.id}>{course.courseCode} - {course.title}</option>)}</select><button onClick={() => removeCourseAssignment(instructor)} className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50">Remove</button></div> : <span className="text-slate-500">No course</span>}</td>
                <td className="px-5 py-4"><button onClick={() => removeInstructor(instructor)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50">Delete</button></td>
              </tr>)}
              {instructors.length === 0 && <tr><td colSpan="4" className="px-5 py-6 text-center text-slate-500">No instructors found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
