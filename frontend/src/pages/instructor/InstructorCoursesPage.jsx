import React, { useEffect, useState } from "react";
import { instructorApi } from "../../api/instructorApi";
import { MapPin, BarChart3, CheckCircle, Save } from "lucide-react";

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Form states for modal / inline editing
  const [venue, setVenue] = useState("");
  const [venueReason, setVenueReason] = useState("");
  const [progress, setProgress] = useState(0);
  const [completedTopics, setCompletedTopics] = useState("");
  const [remarks, setRemarks] = useState("");

  const loadCourses = async () => {
    const data = await instructorApi.getAssignedCourses();
    setCourses(data);
    if (data.length > 0 && !selectedCourse) {
      setSelectedCourse(data[0]);
      populateForm(data[0]);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const populateForm = (course) => {
    setVenue(course.venue);
    setVenueReason("");
    setProgress(course.progressPercent);
    setCompletedTopics(course.completedTopics);
    setRemarks(course.remarks);
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    populateForm(course);
  };

  const handleUpdateVenue = async (e) => {
    e.preventDefault();
    await instructorApi.updateVenue(selectedCourse.id, venue, venueReason);
    alert("Venue successfully updated and notified to students.");
    loadCourses();
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    await instructorApi.updateCourseProgress(selectedCourse.id, {
      progressPercent: Number(progress),
      completedTopics,
      remarks,
    });
    alert("Course progress updated successfully.");
    loadCourses();
  };

  const handleMarkCompleted = async () => {
    if (confirm("Are you sure you want to mark this course as COMPLETED?")) {
      await instructorApi.markCourseCompleted(selectedCourse.id);
      alert("Course marked as COMPLETED.");
      loadCourses();
    }
  };

  if (!selectedCourse) return <div className="p-4 text-slate-500">Loading courses...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Assigned Courses</h1>
        <p className="text-slate-500 text-sm mt-1">
          Update venues, record topics covered, and submit completion reports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Course Selector List */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase text-slate-400 tracking-wider">
            Your Courses
          </h2>
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => handleSelectCourse(course)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedCourse.id === course.id
                  ? "bg-blue-50 border-blue-500 text-blue-900 shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-blue-600">{course.code}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100">
                  {course.status}
                </span>
              </div>
              <h3 className="font-bold text-sm mt-1">{course.title}</h3>
              <p className="text-xs text-slate-500 mt-2">Venue: {course.venue}</p>
            </div>
          ))}
        </div>

        {/* Right Column: Course Action Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
                {selectedCourse.code}
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">{selectedCourse.title}</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Category: {selectedCourse.category} | Enrolled: {selectedCourse.totalEnrolled}
              </p>
            </div>
            {selectedCourse.status !== "COMPLETED" && (
              <button
                onClick={handleMarkCompleted}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-xs"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Completed
              </button>
            )}
          </div>

          {/* Form 1: Update Venue */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Update Venue</h3>
            </div>
            <form onSubmit={handleUpdateVenue} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    New Venue Location
                  </label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Reason for Change
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lab maintenance"
                    value={venueReason}
                    onChange={(e) => setVenueReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-4 h-4" /> Save Venue Change
              </button>
            </form>
          </div>

          {/* Form 2: Submit Progress */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Submit Course Progress</h3>
            </div>
            <form onSubmit={handleUpdateProgress} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-700">
                    Completion Percentage ({progress}%)
                  </label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Completed Topics (Comma separated)
                </label>
                <textarea
                  rows={2}
                  value={completedTopics}
                  onChange={(e) => setCompletedTopics(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Progress Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-4 h-4" /> Update Progress
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}