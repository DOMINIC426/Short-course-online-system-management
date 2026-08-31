import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MY_COURSES, STUDENTS_BY_INTAKE } from "../../data/instructorData.js";
import EligibilityBadge from "../../components/instructor/EligibilityBadge.jsx";

export default function CertificateEligibilityPage() {
  const { intakeId } = useParams();
  const course = MY_COURSES.find((c) => String(c.intakeId) === intakeId);
  const [students, setStudents] = useState(STUDENTS_BY_INTAKE[intakeId] || []);

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">Course not found</h1>
        <Link to="/instructor/dashboard" className="mt-4 inline-block text-sm font-semibold text-udom-primary hover:underline">
          ← Back to my courses
        </Link>
      </div>
    );
  }

  function toggleEligibility(studentId) {
    // TEMPORARY: local toggle — replace with POST /api/v1/instructor/students/:id/eligibility
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, certificateEligibility: s.certificateEligibility === "ELIGIBLE" ? "NOT_ELIGIBLE" : "ELIGIBLE" }
          : s
      )
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
      <Link to="/instructor/dashboard" className="text-sm font-semibold text-udom-primary hover:underline">
        ← Back to my courses
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">{course.courseName}</h1>
      <p className="mt-1 text-sm text-slate-500">Manage certificate eligibility for each student</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Student</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((s) => (
              <tr key={s.id}>
                <td className="px-5 py-4 font-medium text-slate-900">{s.firstName} {s.lastName}</td>
                <td className="px-5 py-4">
                  <EligibilityBadge status={s.certificateEligibility} />
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => toggleEligibility(s.id)}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {s.certificateEligibility === "ELIGIBLE" ? "Mark not eligible" : "Mark eligible"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}