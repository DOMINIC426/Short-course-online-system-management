import React, { useEffect, useState } from "react";
import { instructorApi } from "../../api/instructorApi";
import {
  Send,
  Megaphone,
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
} from "lucide-react";

export default function InstructorAnnouncementsPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audienceType, setAudienceType] = useState("ALL");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [expiryDate, setExpiryDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Safe identifier extractor
  const getCourseId = (course) => {
    if (!course) return "";
    return (
      course.id ||
      course.courseId ||
      course._id ||
      course.code ||
      course.courseCode ||
      ""
    );
  };

  useEffect(() => {
    instructorApi
      .getAssignedCourses()
      .then((data) => {
        const courseList = Array.isArray(data) ? data : data?.data || [];
        setCourses(courseList);
        if (courseList.length > 0) {
          const firstId = getCourseId(courseList[0]);
          setSelectedCourse(firstId);
        }
      })
      .catch((error) => {
        console.error("Failed to load courses:", error);
        showToast("Failed to load assigned courses.", "error");
      });
  }, []);

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      showToast("Please select a course first.", "error");
      return;
    }
    if (!title.trim() || !content.trim()) {
      showToast("Please fill in both the title and message fields.", "error");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSend = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);

    try {
      // Formatted payload exact match for POST /api/v1/instructor/courses/{courseId}/announcements
      const payload = {
        title: title.trim(),
        message: content.trim(),
        audienceType: audienceType,
        selectedStudentIds: selectedStudentIds,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
      };

      await instructorApi.sendAnnouncement(selectedCourse, payload);
      showToast("Announcement successfully broadcasted to students!", "success");
      
      // Reset form
      setTitle("");
      setContent("");
      setExpiryDate("");
      setSelectedStudentIds([]);
      setAudienceType("ALL");
    } catch (error) {
      console.error("Failed to send announcement:", error);
      showToast(
        error?.response?.data?.message ||
          "Failed to send announcement. Please check server connection.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCourseObject = courses.find(
    (c) => getCourseId(c) === selectedCourse
  );

  return (
    <div className="relative mx-auto max-w-3xl space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all animate-in fade-in slide-in-from-top-3 ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0 text-red-600" />
          )}
          <p className="text-xs font-semibold">{toast.message}</p>
          <button
            onClick={() => setToast(null)}
            className={`ml-2 rounded-lg p-1 transition ${
              toast.type === "success"
                ? "hover:bg-emerald-100 text-emerald-700"
                : "hover:bg-red-100 text-red-700"
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Confirm Broadcast
              </h3>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Are you sure you want to send this announcement to{" "}
              <span className="font-semibold text-slate-900">
                {audienceType === "ALL"
                  ? "All Enrolled Students"
                  : "Selected Students"}
              </span>{" "}
              for{" "}
              <span className="font-semibold text-slate-900">
                "{selectedCourseObject?.title || "Selected Course"}"
              </span>
              ?
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSend}
                className="rounded-xl bg-[#0b4d94] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#083b71]"
              >
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Broadcast Announcement
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Send urgent updates or course notes directly to enrolled students.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Megaphone className="h-5 w-5 text-[#0b4d94]" />
          <h2 className="font-bold text-slate-900">Create Announcement</h2>
        </div>

        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#0b4d94] focus:ring-2 focus:ring-[#0b4d94]/20"
              required
            >
              {courses.length === 0 && (
                <option value="">No assigned courses available</option>
              )}
              {courses.map((c, idx) => {
                const cId = getCourseId(c);
                const code = c.courseCode || c.code || "COURSE";
                return (
                  <option key={cId || `opt-${idx}`} value={cId}>
                    {c.title} ({code})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Target Audience
            </label>
            <select
              value={audienceType}
              onChange={(e) => setAudienceType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#0b4d94] focus:ring-2 focus:ring-[#0b4d94]/20"
            >
              <option value="ALL">All Enrolled Students</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g. Class Reminder"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0b4d94] focus:ring-2 focus:ring-[#0b4d94]/20"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Message
            </label>
            <textarea
              rows={4}
              placeholder="Type your announcement message here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0b4d94] focus:ring-2 focus:ring-[#0b4d94]/20"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0b4d94] focus:ring-2 focus:ring-[#0b4d94]/20"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b4d94] py-2.5 text-sm font-semibold text-white transition hover:bg-[#083b71] disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Sending..." : "Send Announcement"}
          </button>
        </form>
      </div>
    </div>
  );
}