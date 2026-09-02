import React, { useEffect, useState } from "react";
import { instructorApi } from "../../api/instructorApi";
import { Award, CheckCircle, XCircle } from "lucide-react";

export default function InstructorCertificatesPage() {
  const [students, setStudents] = useState([]);

  const loadStudents = async () => {
    const data = await instructorApi.getRegisteredStudents();
    setStudents(data);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleSetEligibility = async (studentId, status) => {
    await instructorApi.updateCertificateEligibility(studentId, status);
    loadStudents();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Certificate Eligibility</h1>
        <p className="text-slate-500 text-sm mt-1">
          Review student progress and approve/disapprove certificate issuance.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-4">Student Name</th>
              <th className="p-4">Payment Status</th>
              <th className="p-4">Eligibility Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-medium text-slate-900">{student.fullName}</td>
                <td className="p-4 text-xs">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full ${
                      student.paymentStatus === "FULLY_PAID"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {student.paymentStatus}
                  </span>
                </td>
                <td className="p-4 text-xs font-bold">
                  {student.certificateEligibility === "ELIGIBLE" && (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Award className="w-4 h-4" /> Eligible
                    </span>
                  )}
                  {student.certificateEligibility === "NOT_ELIGIBLE" && (
                    <span className="text-rose-600">Not Eligible</span>
                  )}
                  {student.certificateEligibility === "PENDING" && (
                    <span className="text-slate-400">Pending Review</span>
                  )}
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleSetEligibility(student.id, "ELIGIBLE")}
                    className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg inline-flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Set Eligible
                  </button>
                  <button
                    onClick={() => handleSetEligibility(student.id, "NOT_ELIGIBLE")}
                    className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg inline-flex items-center gap-1 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Set Not Eligible
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