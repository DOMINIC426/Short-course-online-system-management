import React, { useEffect, useState } from "react";
import { instructorApi } from "../../api/instructorApi";
import {
  Award,
  CheckCircle,
  XCircle,
  BookOpen,
  X,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function InstructorCertificatesPage() {
  // Master lists and selected course state
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal dialog state for capturing eligibility status and mandatory reason
  const [activeModalStudent, setActiveModalStudent] = useState(null);
  const [targetStatus, setTargetStatus] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Per-student inline action status: { [studentKey]: { message, type: 'success' | 'error' } }
  const [inlineFeedback, setInlineFeedback] = useState({});

  // Global top banner message for course-level operations
  const [courseError, setCourseError] = useState("");

  // Safely extract numeric course ID across various API formats
  const getCourseId = (course) => {
    return course?.id || course?.courseId || course?._id;
  };

  // Safely extract enrollment ID from student object
  const getEnrollmentId = (student) => {
    return (
      student?.enrollmentId ||
      student?.enrollment_id ||
      student?.id ||
      student?.studentId
    );
  };

  // Set inline feedback for a specific student card/row
  const setStudentFeedback = (studentKey, message, type = "error") => {
    setInlineFeedback((prev) => ({
      ...prev,
      [studentKey]: { message, type },
    }));
  };

  // Clear feedback for a specific student
  const clearStudentFeedback = (studentKey) => {
    setInlineFeedback((prev) => {
      const next = { ...prev };
      delete next[studentKey];
      return next;
    });
  };

  // Fetch instructor assigned courses on initial page mount
  useEffect(() => {
    async function fetchCourses() {
      try {
        setCourseError("");
        const courseData = await instructorApi.getAssignedCourses();
        const courseList = Array.isArray(courseData)
          ? courseData
          : courseData?.data || [];
        setCourses(courseList);

        if (courseList.length > 0) {
          setSelectedCourseId(getCourseId(courseList[0]));
        }
      } catch (error) {
        console.error("Failed to load assigned courses:", error);
        setCourseError("Failed to load assigned courses from backend server.");
      }
    }
    fetchCourses();
  }, []);

  // Fetch enrolled students for selected course
  const loadStudents = async (courseId) => {
    if (!courseId) return;
    setLoading(true);
    setInlineFeedback({});
    setCourseError("");

    try {
      const data = await instructorApi.getEnrolledStudents(courseId);
      const studentList = Array.isArray(data) ? data : data?.data || [];
      setStudents(studentList);
    } catch (error) {
      console.error("Failed to load enrolled students:", error);
      setCourseError("Failed to fetch student enrollment records for this course.");
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

  // Open modal dialog for specifying status and reason
  const handleOpenModal = (student, status) => {
    const studentKey = getEnrollmentId(student);
    clearStudentFeedback(studentKey);

    setActiveModalStudent(student);
    setTargetStatus(status);

    if (status === "ELIGIBLE") {
      setReason("Student completed requirements and payment is fully paid");
    } else {
      setReason("Requirements or payment outstanding");
    }
  };

  const handleCloseModal = () => {
    setActiveModalStudent(null);
    setTargetStatus("");
    setReason("");
  };

  // Submit PUT request to update certificate eligibility
  const handleSubmitEligibility = async (e) => {
    e.preventDefault();

    if (!activeModalStudent || !selectedCourseId) return;

    const enrollmentId = getEnrollmentId(activeModalStudent);

    if (!enrollmentId) {
      setStudentFeedback("global", "Missing student enrollment ID.", "error");
      handleCloseModal();
      return;
    }

    setSubmitting(true);

    try {
      // Backend Request Payload
      const payload = {
        status: targetStatus, // "ELIGIBLE" or "NOT_ELIGIBLE"
        reason: reason.trim(),
      };

      console.log("Submitting Certificate Eligibility Payload:", {
        courseId: selectedCourseId,
        enrollmentId,
        payload,
      });

      // API Call: PUT /api/v1/instructor/courses/{courseId}/students/{enrollmentId}/certificate-eligibility
      await instructorApi.updateCertificateEligibility(
        selectedCourseId,
        enrollmentId,
        payload
      );

      // Display inline success message directly on student card/row
      setStudentFeedback(
        enrollmentId,
        `Eligibility successfully set to ${
          targetStatus === "ELIGIBLE" ? "Eligible" : "Not Eligible"
        }.`,
        "success"
      );

      handleCloseModal();

      // Synchronize list with database
      await loadStudents(selectedCourseId);
    } catch (error) {
      console.error("Certificate eligibility update error:", error?.response?.data || error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update certificate eligibility. Check network or server logs.";

      // Attach inline error message directly to student card
      setStudentFeedback(enrollmentId, errorMessage, "error");
      handleCloseModal();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Manage Certificate Eligibility
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review student progress and approve/disapprove certificate issuance for your course.
        </p>
      </div>

      {/* Global Course Alert */}
      {courseError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-900">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{courseError}</span>
        </div>
      )}

      {/* Course Selector Card */}
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <BookOpen className="h-5 w-5 text-[#0b4d94]" />
        <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">
          Select Course:
        </label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#0b4d94]"
        >
          {courses.map((c) => {
            const id = getCourseId(c);
            return (
              <option key={id} value={id}>
                {c.title} ({c.courseCode || c.code})
              </option>
            );
          })}
        </select>
      </div>

      {/* Students Table Container */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {loading ? (
          <div className="p-6 text-center text-sm text-slate-500">
            Loading enrolled students...
          </div>
        ) : students.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">
            No enrolled students found for this course.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="p-4">Student Details</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">Eligibility Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student, idx) => {
                const enrollmentId = getEnrollmentId(student) || idx;
                const status =
                  student.certificateEligibility ||
                  student.eligibilityStatus ||
                  student.status;
                const feedback = inlineFeedback[enrollmentId];

                return (
                  <React.Fragment key={enrollmentId}>
                    <tr className="transition-colors hover:bg-slate-50/80">
                      <td className="p-4">
                        <div className="font-medium text-slate-900">
                          {student.fullName ||
                            `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
                            "Unnamed Student"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          ID: {enrollmentId}
                        </div>
                      </td>

                      <td className="p-4 text-xs">
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-semibold ${
                            student.paymentStatus === "FULLY_PAID" ||
                            student.paymentStatus === "PAID"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {student.paymentStatus || "PENDING"}
                        </span>
                      </td>

                      <td className="p-4 text-xs font-bold">
                        {status === "ELIGIBLE" && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <Award className="h-4 w-4" /> Eligible
                          </span>
                        )}
                        {status === "NOT_ELIGIBLE" && (
                          <span className="text-rose-600">Not Eligible</span>
                        )}
                        {(!status || status === "PENDING") && (
                          <span className="text-slate-400">Pending Review</span>
                        )}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(student, "ELIGIBLE")}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Set Eligible
                        </button>
                        <button
                          onClick={() => handleOpenModal(student, "NOT_ELIGIBLE")}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Set Not Eligible
                        </button>
                      </td>
                    </tr>

                    {/* Inline Card Feedback Section */}
                    {feedback && (
                      <tr>
                        <td colSpan={4} className="bg-slate-50/50 px-4 py-2 border-t border-slate-100">
                          <div
                            className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium ${
                              feedback.type === "success"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-red-50 text-red-800 border border-red-200"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {feedback.type === "success" ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                              )}
                              <span>{feedback.message}</span>
                            </div>
                            <button
                              onClick={() => clearStudentFeedback(enrollmentId)}
                              className="p-0.5 hover:bg-black/5 rounded"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Reason Dialog Modal */}
      {activeModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle
                  className={`h-5 w-5 ${
                    targetStatus === "ELIGIBLE"
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                />
                <h3 className="text-base font-bold text-slate-900">
                  Update Certificate Eligibility
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEligibility} className="space-y-4">
              <div>
                <p className="text-xs text-slate-500">
                  Setting certificate eligibility for{" "}
                  <span className="font-bold text-slate-800">
                    {activeModalStudent.fullName ||
                      `${activeModalStudent.firstName || ""} ${
                        activeModalStudent.lastName || ""
                      }`.trim()}
                  </span>{" "}
                  to:
                </p>
                <span
                  className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold ${
                    targetStatus === "ELIGIBLE"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {targetStatus === "ELIGIBLE" ? "ELIGIBLE" : "NOT_ELIGIBLE"}
                </span>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Reason / Justification
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0b4d94] focus:ring-2 focus:ring-[#0b4d94]/20 outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50 ${
                    targetStatus === "ELIGIBLE"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {submitting ? "Saving..." : "Save Eligibility"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}