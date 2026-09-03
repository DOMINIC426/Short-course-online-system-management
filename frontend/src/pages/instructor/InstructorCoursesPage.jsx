import React, { useEffect, useState } from "react";
import { instructorApi } from "../../api/instructorApi";
import {
  MapPin,
  BarChart3,
  CheckCircle,
  Save,
  AlertTriangle,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Form states
  const [venue, setVenue] = useState("");
  const [venueReason, setVenueReason] = useState("");
  const [progress, setProgress] = useState(0);
  const [completedTopics, setCompletedTopics] = useState("");
  const [remarks, setRemarks] = useState("");

  // Loading states
  const [updatingVenue, setUpdatingVenue] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState(false);

  // Toast Notification state
  const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'error' }

  // Confirmation Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Helper to extract course identifier safely
  const getCourseId = (course) => {
    return (
      course?.id ||
      course?.courseId ||
      course?._id ||
      course?.code ||
      course?.courseCode
    );
  };

  // Helper to extract course progress percentage safely
  const getCourseProgress = (course) => {
    if (!course) return 0;
    const rawVal =
      course.progressPercent ??
      course.progressPercentage ??
      course.progress ??
      course.completionPercentage ??
      0;
    return Math.min(100, Math.max(0, Number(rawVal) || 0));
  };

  const populateForm = (course) => {
    if (!course) return;
    setVenue(course.venue || course.venueId || course.location || "");
    setVenueReason("");
    setProgress(getCourseProgress(course));
    setCompletedTopics(
      Array.isArray(course.completedTopics)
        ? course.completedTopics.join(", ")
        : Array.isArray(course.topicsCompleted)
        ? course.topicsCompleted.join(", ")
        : course.completedTopics || course.topicsCompleted || ""
    );
    setRemarks(course.remarks || course.notes || "");
  };

  const loadCourses = async (preferredCourseId = null) => {
    try {
      const data = await instructorApi.getAssignedCourses();
      const courseList = Array.isArray(data) ? data : data?.data || [];
      setCourses(courseList);

      if (courseList.length > 0) {
        const targetId =
          preferredCourseId || getCourseId(selectedCourse) || getCourseId(courseList[0]);

        const updatedSelected =
          courseList.find((c) => getCourseId(c) === targetId) || courseList[0];

        setSelectedCourse(updatedSelected);
        populateForm(updatedSelected);
      }
    } catch (error) {
      console.error("Failed to fetch assigned courses:", error);
      showToast("Failed to load assigned courses.", "error");
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    populateForm(course);
  };

  const handleUpdateVenue = async (e) => {
    e.preventDefault();
    const courseId = getCourseId(selectedCourse);
    if (!courseId) {
      showToast("Invalid course selected.", "error");
      return;
    }

    setUpdatingVenue(true);
    try {
      const payload = {
        venue: venue,
        venueId: venue,
        reason: venueReason,
        venueReason: venueReason,
      };

      await instructorApi.updateVenue(courseId, payload);
      showToast("Venue updated successfully and students notified.", "success");
      setVenueReason("");
      await loadCourses(courseId);
    } catch (error) {
      console.error("Failed to update venue:", error);
      showToast(
        error?.response?.data?.message ||
          "Failed to update venue. Please check server constraints.",
        "error"
      );
    } finally {
      setUpdatingVenue(false);
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    const courseId = getCourseId(selectedCourse);
    if (!courseId) {
      showToast("Invalid course selected.", "error");
      return;
    }

    const numericProgress = Math.min(100, Math.max(0, Number(progress) || 0));

    // Support both comma-separated string and array payloads if required by backend
    const topicsArray = completedTopics
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setUpdatingProgress(true);
    try {
      const payload = {
        progressPercentage: numericProgress,
        progressPercent: numericProgress,
        progress: numericProgress,
        topicsCompleted: completedTopics,
        completedTopics: completedTopics,
        topicsCompletedList: topicsArray,
        remarks: remarks,
        notes: remarks,
      };

      const res = await instructorApi.updateCourseProgress(courseId, payload);
      
      // Update selected course state directly from API response if returned
      const updatedData = res?.data || res;
      if (updatedData && typeof updatedData === "object" && getCourseId(updatedData)) {
        setSelectedCourse(updatedData);
        populateForm(updatedData);
      }

      showToast("Course progress updated successfully.", "success");
      await loadCourses(courseId);
    } catch (error) {
      console.error("Failed to update progress:", error);
      showToast(
        error?.response?.data?.message || "Failed to update course progress.",
        "error"
      );
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleConfirmCompletion = async () => {
    setShowConfirmModal(false);
    const courseId = getCourseId(selectedCourse);
    if (!courseId) {
      showToast("Invalid course selected.", "error");
      return;
    }

    try {
      await instructorApi.markCourseCompleted(courseId);
      showToast("Course marked as COMPLETED successfully.", "success");
      await loadCourses(courseId);
    } catch (error) {
      console.error("Failed to mark course as completed:", error);
      showToast(
        error?.response?.data?.message || "Failed to mark course as completed.",
        "error"
      );
    }
  };

  if (!selectedCourse) {
    return (
      <div className="flex h-64 items-center justify-center font-medium text-slate-500">
        Loading courses...
      </div>
    );
  }

  const selectedCourseId = getCourseId(selectedCourse);
  const currentProgressPercent = getCourseProgress(selectedCourse);

  return (
    <div className="relative mx-auto max-w-6xl space-y-6">
      {/* Refined Toast Notification */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Mark Course as Completed?
              </h3>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Are you sure you want to mark{" "}
              <span className="font-semibold text-slate-900">
                "{selectedCourse.title}"
              </span>{" "}
              as completed? This action will finalize the intake status.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCompletion}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700"
              >
                Confirm Completion
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Manage Assigned Courses
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Update venues, record topics covered, and submit completion reports.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Course Selector List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Your Courses
          </h2>
          {courses.map((course, idx) => {
            const currentId = getCourseId(course);
            const uniqueKey = currentId || `course-idx-${idx}`;
            return (
              <div
                key={uniqueKey}
                onClick={() => handleSelectCourse(course)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  selectedCourseId === currentId
                    ? "border-[#0b4d94] bg-blue-50/50 shadow-xs ring-1 ring-[#0b4d94]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0b4d94]">
                    {course.courseCode || course.code || "COURSE"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {course.status || "ACTIVE"}
                  </span>
                </div>
                <h3 className="mt-1 text-sm font-bold text-slate-900">
                  {course.title}
                </h3>
                <p className="mt-2 text-xs text-slate-500">
                  Venue: {course.venue || course.venueId || course.location || "Not set"}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Course Action Forms */}
        <div className="space-y-6 lg:col-span-2">
          {/* Top Header & Progress Overview Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#0b4d94]">
                  {selectedCourse.courseCode || selectedCourse.code}
                </span>
                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  {selectedCourse.title}
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Category: {selectedCourse.category || "N/A"} | Enrolled:{" "}
                  {selectedCourse.totalEnrolled ??
                    selectedCourse.enrolledCount ??
                    0}
                </p>
              </div>
              {selectedCourse.status !== "COMPLETED" && (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark Completed
                </button>
              )}
            </div>

            {/* Live Progress Bar Indicator */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Overall Course Progress</span>
                <span className="text-[#0b4d94]">{currentProgressPercent}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-[#0b4d94] transition-all duration-500 ease-out"
                  style={{ width: `${currentProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Form 1: Update Venue */}
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="h-5 w-5 text-[#0b4d94]" />
              <h3 className="text-base font-bold text-slate-900">Update Venue</h3>
            </div>
            <form onSubmit={handleUpdateVenue} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    New Venue Location
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g. Lab 3B, Main Block"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0b4d94] focus:ring-2 focus:ring-[#0b4d94]/20"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Reason for Change
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maintenance work"
                    value={venueReason}
                    onChange={(e) => setVenueReason(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0b4d94] focus:ring-2 focus:ring-[#0b4d94]/20"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={updatingVenue}
                className="flex items-center gap-1.5 rounded-lg bg-[#0b4d94] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#083b71] disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {updatingVenue ? "Saving..." : "Save Venue Change"}
              </button>
            </form>
          </div>

          {/* Form 2: Submit Progress */}
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BarChart3 className="h-5 w-5 text-[#0b4d94]" />
              <h3 className="text-base font-bold text-slate-900">
                Submit Course Progress
              </h3>
            </div>
            <form onSubmit={handleUpdateProgress} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Completion Percentage (%)
                </label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setProgress("");
                      } else {
                        const num = Math.min(100, Math.max(0, Number(val)));
                        setProgress(num);
                      }
                    }}
                    placeholder="0 - 100"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0b4d94] focus:ring-2 focus:ring-[#0b4d94]/20"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                    %
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Completed Topics (Comma separated)
                </label>
                <textarea
                  rows={2}
                  value={completedTopics}
                  onChange={(e) => setCompletedTopics(e.target.value)}
                  placeholder="e.g. Module 1, React Hooks, Context API"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0b4d94] focus:ring-2 focus:ring-[#0b4d94]/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Progress Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Additional notes for admins or students..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#0b4d94] focus:ring-2 focus:ring-[#0b4d94]/20"
                />
              </div>

              <button
                type="submit"
                disabled={updatingProgress}
                className="flex items-center gap-1.5 rounded-lg bg-[#0b4d94] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#083b71] disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {updatingProgress ? "Updating..." : "Update Progress"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}