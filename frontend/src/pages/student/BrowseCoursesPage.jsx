import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Search,
  Loader2,
  Calendar,
  MapPin,
  Tag,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { api } from "../../api/backendClient.js";

/**
 * Formats ISO date strings into readable UK date format (e.g., 12 Oct 2026).
 */
function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Normalizes backend response payloads to handle raw arrays, pagination wrappers, or API data wrappers.
 */
function extractCourseArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

/**
 * Determines whether a course intake is currently open based on boolean flags, status string, or dates.
 */
function getIntakeStatus(course) {
  if (typeof course.isOpen === "boolean") return course.isOpen;
  if (typeof course.active === "boolean") return course.active;

  const rawStatus = (
    course.status ||
    course.intakeStatus ||
    ""
  ).toUpperCase();

  if (
    rawStatus === "OPEN" ||
    rawStatus === "ACTIVE" ||
    rawStatus === "PUBLISHED" ||
    rawStatus === "REGISTRATION_OPEN"
  )
    return true;
  if (rawStatus === "CLOSED" || rawStatus === "INACTIVE" || rawStatus === "COMPLETED")
    return false;

  const deadlineStr = course.applicationDeadline || course.endDate;
  if (deadlineStr) {
    return new Date(deadlineStr) >= new Date();
  }

  return true;
}

export default function BrowseCoursesPage() {
  const navigate = useNavigate();

  // State Management
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [search, setSearch] = useState("");

  // Map to store per-card temporary alerts (e.g., success/error status messages) keyed by courseId
  const [cardAlerts, setCardAlerts] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch published course catalog from backend API
        const resCourses = await api.get("/api/v1/market/courses");
        const courseList = extractCourseArray(resCourses.data);
        setCourses(courseList);

        // Fetch current student enrollments to mark enrolled badges and disable duplicate registration
        try {
          const resDashboard = await api.get("/api/v1/student/dashboard");
          const enrollments = extractCourseArray(resDashboard.data);
          const enrolledIds = new Set(
            enrollments
              .map((e) => e.courseId || e.course?.id)
              .filter(Boolean)
          );
          setEnrolledCourseIds(enrolledIds);
        } catch (authErr) {
          // Non-blocking catch: enables guests or unauthenticated users to view the catalog
          console.warn("User dashboard data not available in guest mode:", authErr);
        }
      } catch (err) {
        console.error("Failed to fetch market courses:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  /**
   * Triggers a card-level notification that auto-clears after a specified timeout.
   */
  const showCardAlert = (courseId, type, message, duration = 4000) => {
    setCardAlerts((prev) => ({
      ...prev,
      [courseId]: { type, message },
    }));

    setTimeout(() => {
      setCardAlerts((prev) => {
        const updated = { ...prev };
        delete updated[courseId];
        return updated;
      });
    }, duration);
  };

  /**
   * Handles student enrollment submission for a selected course card.
   */
  const handleEnroll = async (courseId) => {
    try {
      setEnrollingId(courseId);

      // Submit enrollment registration POST
      await api.post("/api/v1/student/enroll", {
        courseId: courseId,
      });

      // Update state immediately to reflect enrollment status
      setEnrolledCourseIds((prev) => new Set(prev).add(courseId));

      showCardAlert(
        courseId,
        "success",
        "Enrolled successfully! Redirecting..."
      );

      // Brief delay before redirecting to allow user to view the in-card alert feedback
      setTimeout(() => {
        navigate("/student/enrollments");
      }, 1500);
    } catch (err) {
      console.error("Enrollment failed:", err);
      const errMsg =
        err.response?.data?.message ||
        "Failed to enroll. You may already be registered.";
      showCardAlert(courseId, "error", errMsg);
    } finally {
      setEnrollingId(null);
    }
  };

  // Client-side search filtering by Course Title, Course Code, or Category Name
  const filteredCourses = courses.filter((course) => {
    const searchTerm = search.toLowerCase();
    const titleMatch = (course.title || course.courseName || "")
      .toLowerCase()
      .includes(searchTerm);
    const codeMatch = (course.courseCode || "")
      .toLowerCase()
      .includes(searchTerm);
    const categoryMatch = (course.categoryName || course.category?.name || "")
      .toLowerCase()
      .includes(searchTerm);

    return titleMatch || codeMatch || categoryMatch;
  });

  return (
    <div className="mx-auto max-w-[1360px] p-4 sm:p-6 lg:p-8 font-sans antialiased text-slate-800">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0b4d94]">
            Catalog
          </span>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl tracking-tight">
            Browse Short Courses
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-xl">
            Explore active intake programs, review venue details, and enroll directly from your student portal.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, code, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-xs transition duration-150 focus:border-[#0b4d94] focus:outline-none focus:ring-2 focus:ring-[#0b4d94]/20"
          />
        </div>
      </div>

      {/* Main Course Grid Display */}
      {loading ? (
        <div className="mt-20 flex flex-col items-center justify-center p-12">
          <Loader2 className="h-9 w-9 animate-spin text-[#0b4d94]" />
          <p className="mt-3 text-sm font-medium text-slate-500">
            Fetching available short courses...
          </p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
            <BookOpen className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">No courses available</h3>
          <p className="mt-1 text-sm text-slate-500">
            {search
              ? "No courses matching your search criteria."
              : "There are currently no active course intakes available."}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => {
            const isOpen = getIntakeStatus(course);
            const isSubmitting = enrollingId === course.id;
            const isEnrolled = enrolledCourseIds.has(course.id);
            const cardAlert = cardAlerts[course.id];

            const categoryName = course.categoryName || course.category?.name || "General";
            const courseCode = course.courseCode || "N/A";
            const titleText = course.title || course.courseName || "Untitled Course";

            return (
              <div
                key={course.id}
                className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-lg ${
                  isEnrolled
                    ? "border-emerald-200/80 bg-emerald-50/10"
                    : "border-slate-200/90 hover:border-slate-300"
                }`}
              >
                <div>
                  {/* Category & Course Code Header Wrapper */}
                  {/* DEVELOPER NOTE: flex-wrap + gap ensures that long category names break onto a new line if needed without clipping the course code badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      title={categoryName}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                    >
                      <Tag className="h-3 w-3 shrink-0 text-slate-500" />
                      <span className="truncate max-w-[220px]">
                        {categoryName}
                      </span>
                    </span>

                    <span className="shrink-0 text-xs font-mono font-medium text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/60">
                      {courseCode}
                    </span>
                  </div>

                  {/* Course Title Header */}
                  {/* DEVELOPER NOTE: line-clamp-3 with min-h-[4.5rem] ensures long titles fit cleanly up to 3 lines without cutting off key words or disrupting grid alignment */}
                  <h2
                    title={titleText}
                    className="mt-4 text-lg font-bold tracking-tight text-slate-900 group-hover:text-[#0b4d94] transition-colors duration-150 line-clamp-3 leading-snug min-h-[4.5rem]"
                  >
                    {titleText}
                  </h2>

                  {/* Course Description Paragraph */}
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600">
                    {course.description || "No detailed description available for this course module."}
                  </p>

                  {/* Metadata Section: Status, Dates, and Venue */}
                  <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-md ${
                            isEnrolled
                              ? "bg-emerald-100 text-emerald-700"
                              : isOpen
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {isEnrolled ? (
                            <GraduationCap className="h-3.5 w-3.5" />
                          ) : (
                            <Clock className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <span className="font-medium text-slate-500">
                          {isEnrolled ? "Student Status:" : "Intake Status:"}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          isEnrolled
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300/50"
                            : isOpen
                            ? "bg-emerald-100/70 text-emerald-800"
                            : "bg-rose-100/70 text-rose-800"
                        }`}
                      >
                        {isEnrolled ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Enrolled
                          </>
                        ) : isOpen ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Open
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 text-rose-600" />
                            Closed
                          </>
                        )}
                      </span>
                    </div>

                    {course.startDate && (
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-[#0b4d94]">
                          <Calendar className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium text-slate-700">
                          {formatDate(course.startDate)} - {formatDate(course.endDate)}
                        </span>
                      </div>
                    )}

                    {(course.venueName || course.venue) && (
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                          <MapPin className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium text-slate-700 truncate" title={course.venueName || course.venue}>
                          {course.venueName || course.venue}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action & Pricing Footer */}
                <div className="mt-6 border-t border-slate-100 pt-4">
                  {/* DEVELOPER NOTE: Dynamic auto-disappearing toast alert for in-card success/error notifications */}
                  {cardAlert && (
                    <div
                      className={`mb-3 flex items-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                        cardAlert.type === "success"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-rose-200 bg-rose-50 text-rose-800"
                      }`}
                    >
                      {cardAlert.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
                      )}
                      <span className="line-clamp-2">{cardAlert.message}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Course Fee
                      </p>
                      <p className="text-base font-extrabold text-slate-900">
                        TZS {Number(course.courseFee || course.fee || 0).toLocaleString()}
                      </p>
                    </div>

                    {isEnrolled ? (
                      <button
                        disabled
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 border border-emerald-200 shadow-2xs cursor-default"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Enrolled
                      </button>
                    ) : isOpen ? (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#f7941d] px-4 py-2 text-xs font-bold text-white shadow-xs transition duration-150 hover:bg-[#e08312] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Enrolling...
                          </>
                        ) : (
                          <>
                            Enroll Now
                            <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        disabled
                        className="cursor-not-allowed rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-400 border border-slate-200"
                      >
                        Closed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}