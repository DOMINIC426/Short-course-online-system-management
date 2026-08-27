import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Check, ClipboardCheck, Users } from "lucide-react";

const COURSE = {
  name: "Data Analysis for Evidence-Based Decision Making",
  code: "SCM-DA-2026",
  intake: "September 2026 intake",
  passMark: 50,
};

 

function formatLabel(value) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export default function CourseWorkspacePage() {
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState("attendance");
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [savedMessage, setSavedMessage] = useState("");
  const [scoreErrors, setScoreErrors] = useState({});

  function updateAttendance(studentId, attendance) {
    setStudents((current) => current.map((student) => student.id === studentId ? { ...student, attendance } : student));
    setSavedMessage("");
  }

  function updateScore(studentId, score) {
    setStudents((current) => current.map((student) => student.id === studentId ? { ...student, score } : student));
    setScoreErrors((current) => ({ ...current, [studentId]: "" }));
    setSavedMessage("");
  }

  function saveAttendance() {
    setSavedMessage("Attendance saved for the selected session.");
  }

  function saveScores() {
    const errors = {};
    students.forEach((student) => {
      if (student.score !== "" && (Number(student.score) < 0 || Number(student.score) > 100)) {
        errors[student.id] = "Score must be between 0 and 100.";
      }
    });
    setScoreErrors(errors);
    setSavedMessage(Object.keys(errors).length === 0 ? "Assessment scores saved as pending review." : "");
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <Link to="/instructor/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-udom-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Back to my courses</Link>
      <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">Assigned course</p><h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{COURSE.name}</h1><p className="mt-2 text-sm text-slate-600">{COURSE.code} &middot; {COURSE.intake} &middot; Course ID {courseId}</p></div>
        <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700"><Users className="h-5 w-5" /> {students.length} enrolled students</div>
      </div>

      <div className="mt-8 border-b border-slate-200"><nav className="flex gap-6" aria-label="Course workspace tabs">
        <button onClick={() => setActiveTab("attendance")} className={`border-b-2 px-1 pb-3 text-sm font-semibold ${activeTab === "attendance" ? "border-udom-primary text-udom-primary" : "border-transparent text-slate-500"}`}><ClipboardCheck className="mr-2 inline h-4 w-4" />Attendance</button>
        <button onClick={() => setActiveTab("assessment")} className={`border-b-2 px-1 pb-3 text-sm font-semibold ${activeTab === "assessment" ? "border-udom-primary text-udom-primary" : "border-transparent text-slate-500"}`}><Check className="mr-2 inline h-4 w-4" />Assessment scores</button>
      </nav></div>

      {savedMessage && <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><Check className="h-4 w-4" />{savedMessage}</div>}

      {activeTab === "attendance" ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center"><div><h2 className="font-semibold text-slate-900">Mark session attendance</h2><p className="mt-1 text-xs text-slate-500">Session: Regression analysis &middot; 20 August 2026</p></div><button onClick={saveAttendance} className="rounded-md bg-udom-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-udom-primary-dark">Save attendance</button></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Enrolled student</th><th className="px-5 py-3">Attendance status</th></tr></thead><tbody className="divide-y divide-slate-100">{students.map((student) => <tr key={student.id}><td className="px-5 py-4 font-medium text-slate-800">{student.name}</td><td className="px-5 py-4"><select value={student.attendance} onChange={(event) => updateAttendance(student.id, event.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"><option value="PRESENT">Present</option><option value="ABSENT">Absent</option><option value="LATE">Late</option><option value="EXCUSED">Excused</option></select></td></tr>)}</tbody></table></div>
        </section>
      ) : (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center"><div><h2 className="font-semibold text-slate-900">Enter assessment scores</h2><p className="mt-1 text-xs text-slate-500">Assignment 1 &middot; Maximum score: 100 &middot; Pass mark: {COURSE.passMark}</p></div><button onClick={saveScores} className="rounded-md bg-udom-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-udom-primary-dark">Save scores</button></div>
          <div className="flex items-start gap-2 border-b border-amber-100 bg-amber-50 p-4 text-xs text-amber-800"><AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />Scores are saved as pending review. Approved or locked results cannot be edited normally.</div>
          <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Enrolled student</th><th className="px-5 py-3">Score / 100</th><th className="px-5 py-3">Result</th></tr></thead><tbody className="divide-y divide-slate-100">{students.map((student) => { const score = student.score === "" ? null : Number(student.score); const invalid = Boolean(scoreErrors[student.id]); return <tr key={student.id}><td className="px-5 py-4 font-medium text-slate-800">{student.name}</td><td className="px-5 py-4"><input type="number" min="0" max="100" value={student.score} onChange={(event) => updateScore(student.id, event.target.value)} className={`w-28 rounded-md border px-3 py-2 text-sm ${invalid ? "border-red-400" : "border-slate-300"}`} />{invalid && <p className="mt-1 text-xs text-red-600">{scoreErrors[student.id]}</p>}</td><td className="px-5 py-4 text-xs font-semibold">{score === null ? <span className="text-slate-400">Not entered</span> : <span className={score >= COURSE.passMark ? "text-emerald-700" : "text-red-600"}>{score >= COURSE.passMark ? "Pass" : "Fail"}</span>}</td></tr>; })}</tbody></table></div>
        </section>
      )}
    </div>
  );
}
