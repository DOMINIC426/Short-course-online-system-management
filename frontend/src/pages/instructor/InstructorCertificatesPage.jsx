import React, { useEffect, useState } from "react";
import { instructorApi } from "../../api/instructorApi";
import { Award, CheckCircle, XCircle, BookOpen } from "lucide-react";

export default function InstructorCertificatesPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load instructor's assigned courses on initial mount
  useEffect(() => {
    async function fetchCourses() {
      try {
        // Calls API Endpoint: GET /api/v1/instructor/courses
        const courseData = await instructorApi.getAssignedCourses();
        const courseList = Array.isArray(courseData) ? courseData : [];
        setCourses(courseList);

        if (courseList.length > 0) {
          setSelectedCourseId(courseList[0].id);
        }
      } catch (error) {
        console.error("Failed to load assigned courses:", error);
      }
    }
    fetchCourses();
  }, []);

  // Load students belonging to the selected course
  const loadStudents = async (courseId) => {
    if (!courseId) return;
    setLoading(true);
    try {
      // Calls API Endpoint: GET /api/v1/instructor/courses/{courseId}/students
      const data = await instructorApi.getEnrolledStudents(courseId);
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load enrolled students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      loadStudents(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleSetEligibility = async (studentId, status) => {
    try {
      // Calls API Endpoint: PUT /api/v1/instructor/courses/{courseId}/students/{studentId}/certificate-eligibility
      await instructorApi.updateCertificateEligibility(selectedCourseId, studentId, {
        eligibilityStatus: status,
      });
      alert(`Certificate eligibility updated to ${status}.`);
      await loadStudents(selectedCourseId);
    } catch (error) {
      console.error("Failed to update certificate eligibility:", error);
      alert("Failed to update eligibility status. Please try again.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Certificate Eligibility</h1>
        <p className="text-slate-500 text-sm mt-1">
          Review student progress and approve/disapprove certificate issuance for your assigned course.
        </p>
      </div>

      {/* Course Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <BookOpen className="w-5 h-5 text-blue-600" />
        <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">
          Select Course:
        </label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} ({c.courseCode || c.code})
            </option>
          ))}
        </select>
      </div>

      {/* Student List Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-6 text-center text-slate-500 text-sm">
            Loading enrolled students...
          </div>
        ) : students.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm">
            No students found for this course.
          </div>
        ) : (
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
                  <td className="p-4 font-medium text-slate-900">
                    {student.fullName || `${student.firstName || ""} ${student.lastName || ""}`.trim()}
                  </td>
                  <td className="p-4 text-xs">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full ${
                        student.paymentStatus === "FULLY_PAID" || student.paymentStatus === "PAID"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {student.paymentStatus || "PENDING"}
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
                    {(!student.certificateEligibility ||
                      student.certificateEligibility === "PENDING") && (
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
        )}
      </div>
    </div>
  );
}