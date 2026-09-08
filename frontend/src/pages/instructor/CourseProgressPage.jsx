import React, { useEffect, useState } from "react";
import { instructorApi } from "../../api/instructorApi";
import {
  BarChart3,
  CheckCircle,
  Save,
  AlertTriangle,
  X,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";

export default function CourseProgressPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Form input states according to API endpoint specifications
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [topicsCompleted, setTopicsCompleted] = useState("");
  const [topicsRemaining, setTopicsRemaining] = useState("");
  const [challenges, setChallenges] = useState("");
  const [remarks, setRemarks] = useState("");
  const [expectedCompletionDate, setExpectedCompletionDate] = useState("");

  // Loading & Toast states
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [toast, setToast] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getCourseId = (course) => {
    return course?.id || course?.courseId || course?._id || course?.code || course?.courseCode;
  };

  const getCourseProgress = (course) => {
    if (!course) return 0;
    const rawVal =
      course.progressPercentage ??
      course.progressPercent ??
      course.progress ??
      course.completionPercentage ??
      0;
    return Math.min(100, Math.max(0, Number(rawVal) || 0));
  };

  const populateForm = (course) => {
    if (!course) return;
    setProgressPercentage(getCourseProgress(course));
    setTopicsCompleted(course.topicsCompleted || course.completedTopics || "");
    setTopicsRemaining(course.topicsRemaining || "");
    setChallenges(course.challenges || "");
    setRemarks(course.remarks || course.notes || "");
    setExpectedCompletionDate(course.expectedCompletionDate || "");
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
      console.error("Failed to load assigned courses:", error);
      showToast("Failed to fetch assigned courses.", "error");
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    populateForm(course);
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    const courseId = getCourseId(selectedCourse);
    if (!courseId) {
      showToast("Please select a valid course.", "error");
      return;
    }

    const numericProgress = Math.min(
      100,
      Math.max(0, Number(progressPercentage) || 0)
    );

    setUpdatingProgress(true);
    try {
      const payload = {
        progressPercentage: numericProgress,
        topicsCompleted,
        topicsRemaining,
        challenges,
        remarks,
        expectedCompletionDate,
      };

      const res = await instructorApi.updateCourseProgress(courseId, payload);
      const updatedData = res?.data || res;

      if (updatedData && typeof updatedData === "object" && getCourseId(updatedData)) {
        setSelectedCourse(updatedData);
        populateForm(updatedData);
      }

      showToast("Course progress updated successfully.", "success");
      await loadCourses(courseId);
    } catch (error) {
      console.error("Failed to update course progress:", error);
      showToast(
        error?.response?.data?.message || "Failed to submit course progress.",
        "error"
      );
    } finally {
      setUpdatingProgress(false);
    }
  };

  const handleConfirmCompletion = async () => {
    setShowConfirmModal(false);
    const courseId = getCourseId(selectedCourse);
    if (!courseId) return;

    try {
      await instructorApi.markCourseCompleted(courseId);
      showToast("Course marked as COMPLETED successfully.", "success");
      await loadCourses(courseId);
    } catch (error) {
      console.error("Failed to complete course:", error);
      showToast(
        error?.response?.data?.message || "Failed to complete course.",
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
      {/* Notification Toast */}
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
            className="ml-2 rounded-lg p-1 hover:bg-black/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
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
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCompletion}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Confirm Completion
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Course Progress</h1>
        <p className="mt-1 text-sm text-slate-500">
          Record topics covered, ongoing challenges, and completion milestones.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Course List Sidebar */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Select Course
          </h2>
          {courses.map((course, idx) => {
            const currentId = getCourseId(course);
            return (
              <div
                key={currentId || idx}
                onClick={() => handleSelectCourse(course)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  selectedCourseId === currentId
                    ? "border-[#0b4d94] bg-blue-50/50 ring-1 ring-[#0b4d94]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0b4d94]">
                    {course.courseCode || course.code || "COURSE"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {getCourseProgress(course)}%
                  </span>
                </div>
                <h3 className="mt-1 text-sm font-bold text-slate-900">
                  {course.title}
                </h3>
              </div>
            );
          })}
        </div>

        {/* Progress Form Area */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#0b4d94]">
                  {selectedCourse.courseCode || selectedCourse.code}
                </span>
                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  {selectedCourse.title}
                </h2>
              </div>
              {selectedCourse.status !== "COMPLETED" && (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark Completed
                </button>
              )}
            </div>

            {/* Visual Progress Bar */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Current Overall Progress</span>
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

          {/* Form */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BarChart3 className="h-5 w-5 text-[#0b4d94]" />
              <h3 className="text-base font-bold text-slate-900">
                Record Course Progress
              </h3>
            </div>

            <form onSubmit={handleUpdateProgress} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Progress Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={progressPercentage}
                    onChange={(e) => setProgressPercentage(e.target.value)}
                    placeholder="e.g. 75"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0b4d94] focus:ring-2 focus:ring-[#0b4d94]/20 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Expected Completion Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={expectedCompletionDate}
                      onChange={(e) => setExpectedCompletionDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0b4d94] focus:ring-2 focus:ring-[#0b4d94]/20 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Topics Completed
                </label>
                <textarea
                  rows={2}
                  value={topicsCompleted}
                  onChange={(e) => setTopicsCompleted(e.target.value)}
                  placeholder="e.g. Java basics, Spring Boot fundamentals, REST APIs"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0b4d94] focus:ring-2 focus:ring-[#0b4d94]/20 outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Topics Remaining
                </label>
                <textarea
                  rows={2}
                  value={topicsRemaining}
                  onChange={(e) => setTopicsRemaining(e.target.value)}
                  placeholder="e.g. Security and deployment"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0b4d94] focus:ring-2 focus:ring-[#0b4d94]/20 outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Challenges
                </label>
                <input
                  type="text"
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="e.g. Lab room availability, slow connection"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0b4d94] focus:ring-2 focus:ring-[#0b4d94]/20 outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Course progressing well"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0b4d94] focus:ring-2 focus:ring-[#0b4d94]/20 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={updatingProgress}
                className="flex items-center gap-1.5 rounded-lg bg-[#0b4d94] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#083b71] disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {updatingProgress ? "Saving..." : "Save Progress"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}