import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Search, Users } from "lucide-react";

const COURSE = {
  name: "Data Analysis for Evidence-Based Decision Making",
  code: "SCM-DA-2026",
  intake: "September 2026 intake",
};

const STUDENTS = [
  { id: "STD-001", name: "Amina Hassan", email: "amina.hassan@example.com", enrollment: "Active", attendance: 92, payments: "Paid" },
  { id: "STD-002", name: "Baraka Mollel", email: "baraka.mollel@example.com", enrollment: "Active", attendance: 84, payments: "Partially paid" },
  { id: "STD-003", name: "Neema Joseph", email: "neema.joseph@example.com", enrollment: "Active", attendance: 76, payments: "Paid" },
  { id: "STD-004", name: "Juma Ally", email: "juma.ally@example.com", enrollment: "Active", attendance: 88, payments: "Paid" },
];

export default function CourseStudentsPage() {
  const { courseId } = useParams();
  const [search, setSearch] = useState("");
  const [enrollment, setEnrollment] = useState("All students");

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return STUDENTS.filter((student) => {
      const matchesSearch = !query || `${student.id} ${student.name} ${student.email}`.toLowerCase().includes(query);
      const matchesEnrollment = enrollment === "All students" || student.enrollment === enrollment;
      return matchesSearch && matchesEnrollment;
    });
  }, [search, enrollment]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <Link to="/instructor/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-udom-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Back to my courses</Link>
      <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">Assigned course roster</p><h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Course students</h1><p className="mt-2 text-sm text-slate-600">{COURSE.name} &middot; {COURSE.code} &middot; {COURSE.intake} &middot; Course ID {courseId}</p></div>
        <Link to={`/instructor/courses/${courseId}`} className="inline-flex items-center justify-center rounded-md bg-udom-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-udom-primary-dark">Open course workspace</Link>
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
        <label className="relative flex-1"><span className="sr-only">Search students</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by student name, ID, or email" className="w-full rounded-md border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-udom-primary focus:ring-2 focus:ring-udom-primary/20" /></label>
        <label><span className="sr-only">Filter students by enrollment</span><select value={enrollment} onChange={(event) => setEnrollment(event.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-udom-primary sm:w-40"><option>All students</option><option>Active</option><option>Withdrawn</option></select></label>
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-udom-primary"><Users className="h-5 w-5" /></span><div><h2 className="font-semibold text-slate-900">Enrolled students</h2><p className="mt-1 text-xs text-slate-500">{filteredStudents.length} of {STUDENTS.length} students shown</p></div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Student</th><th className="px-5 py-3">Enrollment</th><th className="px-5 py-3">Attendance</th><th className="px-5 py-3">Payment status</th><th className="px-5 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredStudents.map((student) => <tr key={student.id}><td className="px-5 py-4"><p className="font-semibold text-slate-800">{student.name}</p><p className="mt-1 text-xs text-slate-500">{student.id} &middot; {student.email}</p></td><td className="px-5 py-4"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{student.enrollment}</span></td><td className="px-5 py-4"><span className={student.attendance < 80 ? "font-semibold text-red-600" : "font-semibold text-emerald-700"}>{student.attendance}%</span></td><td className="px-5 py-4 text-xs text-slate-600">{student.payments}</td><td className="px-5 py-4"><Link to={`/instructor/courses/${courseId}`} className="text-xs font-semibold text-udom-primary hover:underline">Attendance &amp; scores</Link></td></tr>)}</tbody></table></div>
        {filteredStudents.length === 0 && <div className="p-10 text-center text-sm text-slate-500">No students match your search.</div>}
      </section>
    </div>
  );
}
