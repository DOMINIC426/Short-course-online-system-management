import React, { useEffect, useState } from "react";
import { instructorApi } from "../../api/instructorApi";
import { Search, Filter, Eye } from "lucide-react";

export default function InstructorStudentsPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("ALL");
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

  useEffect(() => {
    Promise.all([
      instructorApi.getRegisteredStudents(),
      instructorApi.getAssignedCourses(),
    ]).then(([studentData, courseData]) => {
      setStudents(studentData);
      setCourses(courseData);
    });
  }, []);

  const filteredStudents = students.filter((student) => {
    const matchesCourse =
      selectedCourseFilter === "ALL" || student.courseId === selectedCourseFilter;
    const matchesPayment =
      selectedPaymentFilter === "ALL" || student.paymentStatus === selectedPaymentFilter;
    const matchesSearch =
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCourse && matchesPayment && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Registered Students</h1>
        <p className="text-slate-500 text-sm mt-1">
          View enrolled students, check payment statuses, and review details.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm outline-none bg-transparent"
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 outline-none"
          >
            <option value="ALL">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <select
            value={selectedPaymentFilter}
            onChange={(e) => setSelectedPaymentFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 outline-none"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="FULLY_PAID">Fully Paid</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="UNPAID">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Payment Status</th>
              <th className="p-4">Control No.</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{student.fullName}</td>
                  <td className="p-4 text-xs text-slate-500">
                    <div>{student.email}</div>
                    <div>{student.phone}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        student.paymentStatus === "FULLY_PAID"
                          ? "bg-emerald-100 text-emerald-700"
                          : student.paymentStatus === "PARTIALLY_PAID"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {student.paymentStatus.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-mono text-slate-600">
                    {student.paymentControlNumber}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedStudentDetail(student)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400 text-xs">
                  No students matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Student Details Modal */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Student Details</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-800">Name:</span>{" "}
                {selectedStudentDetail.fullName}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Email:</span>{" "}
                {selectedStudentDetail.email}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Phone:</span>{" "}
                {selectedStudentDetail.phone}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Registration Date:</span>{" "}
                {selectedStudentDetail.registrationDate}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Amount Paid:</span> TZS{" "}
                {selectedStudentDetail.amountPaid.toLocaleString()} / TZS{" "}
                {selectedStudentDetail.totalFee.toLocaleString()}
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}