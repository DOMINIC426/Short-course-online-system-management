import React, { useEffect, useState } from "react";
import { instructorApi } from "../../api/instructorApi";
import { MapPin, Save, X, CheckCircle2, XCircle } from "lucide-react";

export default function ChangeVenuePage() {
  // Course list & currently selected item
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Form input fields
  const [venue, setVenue] = useState("");
  const [reason, setReason] = useState("");

  // UI state management
  const [updatingVenue, setUpdatingVenue] = useState(false);
  const [toast, setToast] = useState(null);

  // Helper for floating notifications
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Extract database primary key ID (must be numeric for URL path parameter)
  const getCourseId = (course) => {
    return course?.id || course?.courseId || course?._id;
  };

  // Safely display venue name or location
  const getCourseVenue = (course) => {
    return (
      course?.venueName ||
      course?.newVenueName ||
      course?.venue ||
      course?.venueId ||
      course?.location ||
      "Not set"
    );
  };

  // Pre-fill input form when selecting a course
  const populateForm = (course) => {
    if (!course) return;
    const currentVenue = getCourseVenue(course);
    setVenue(currentVenue === "Not set" ? "" : currentVenue);
    setReason("");
  };

  // Fetch instructor's courses
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

  // Submit venue updates matching backend Swagger specification
  const handleUpdateVenue = async (e) => {
    e.preventDefault();

    // Ensure we use the numeric ID for the path parameter
    const numericCourseId = getCourseId(selectedCourse);

    if (!numericCourseId) {
      showToast("Selected course lacks a valid numeric ID.", "error");
      return;
    }

    setUpdatingVenue(true);

    try {
      // Convert venue to integer if your backend expects a numeric ID, or send string as needed
      const formattedVenueId = !isNaN(venue) && venue.trim() !== "" ? Number(venue) : venue;

      // Match exact Swagger schema: { venueId, reason }
      const payload = {
        venueId: formattedVenueId,
        reason: reason,
      };

      // Execute PUT request: /api/v1/instructor/courses/{courseId}/venue
      const response = await instructorApi.updateVenue(numericCourseId, payload);
      const apiResult = response?.data || response;

      const updatedVenueDisplay =
        apiResult?.newVenueName || apiResult?.venueName || venue;

      // Update local state directly for immediate UI feedback
      setSelectedCourse((prev) => ({
        ...prev,
        venue: updatedVenueDisplay,
        venueName: updatedVenueDisplay,
        venueId: apiResult?.newVenueId || venue,
      }));

      setCourses((prevCourses) =>
        prevCourses.map((c) =>
          getCourseId(c) === numericCourseId
            ? {
                ...c,
                venue: updatedVenueDisplay,
                venueName: updatedVenueDisplay,
                venueId: apiResult?.newVenueId || venue,
              }
            : c
        )
      );

      showToast("Venue updated successfully and students notified.", "success");
      setReason("");

      // Background re-fetch to sync with backend database
      await loadCourses(numericCourseId);
    } catch (error) {
      // Print detailed diagnostic log to browser DevTools console
      console.error("Error Response Details:", error?.response?.data || error);

      // Extract specific backend error message or fall back to general error
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "An unexpected error occurred while saving the venue.";

      showToast(backendMessage, "error");
    } finally {
      setUpdatingVenue(false);
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

  return (
    <div className="relative mx-auto max-w-6xl space-y-6">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all ${
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

      {/* Header Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Change Venue</h1>
        <p className="mt-1 text-sm text-slate-500">
          Update the physical or online room location for your assigned course session.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: Assigned Courses */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Select Course
          </h2>
          {courses.map((course, idx) => {
            const currentId = getCourseId(course);
            const isSelected = selectedCourseId === currentId;

            return (
              <div
                key={currentId || idx}
                onClick={() => handleSelectCourse(course)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "border-[#0b4d94] bg-blue-50/50 ring-1 ring-[#0b4d94]"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0b4d94]">
                    {course.courseCode || course.code || "COURSE"}
                  </span>
                </div>
                <h3 className="mt-1 text-sm font-bold text-slate-900">
                  {course.title}
                </h3>
                <p className="mt-2 text-xs text-slate-500">
                  Current Venue:{" "}
                  <span className="font-semibold text-slate-700">
                    {getCourseVenue(course)}
                  </span>
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Side: Change Venue Form */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="h-5 w-5 text-[#0b4d94]" />
              <h3 className="text-base font-bold text-slate-900">
                Update Location for {selectedCourse.courseCode || selectedCourse.code}
              </h3>
            </div>

            <form onSubmit={handleUpdateVenue} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  New Venue ID / Room Location
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Enter Venue ID or Room Name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0b4d94] focus:ring-2 focus:ring-[#0b4d94]/20 outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Reason for Venue Change
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Room maintenance work"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#0b4d94] focus:ring-2 focus:ring-[#0b4d94]/20 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={updatingVenue}
                className="flex items-center gap-1.5 rounded-lg bg-[#0b4d94] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#083b71] disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {updatingVenue ? "Updating..." : "Save Venue Change"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}