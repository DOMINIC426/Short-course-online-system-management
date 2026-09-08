import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Loader2,
  CreditCard,
  Calendar,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Tag,
  XCircle,
  User,
  MapPin,
} from "lucide-react";
import { api } from "../../api/backendClient.js";

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Formats ISO or backend date strings into a readable UK format (e.g., 03 Sep 2026).
 * Fallbacks to "N/A" or the raw string if parsing fails.
 * 
 * @param {string} dateStr - Raw date string from backend payload.
 * @returns {string} Formatted date string.
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
 * Normalizes dynamic API response payloads to safely extract the array list.
 * Supports standard arrays, Spring Boot Pageable objects (`content`), or wrapped API response objects (`data`).
 * 
 * @param {Array|Object} data - Raw API response data.
 * @returns {Array} Extracted enrollment items list.
 */
function extractEnrollmentsArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

/**
 * Safely resolves the instructor's display name across various nested payload structures.
 * Checks direct attributes, nested object attributes, or string primitives.
 * 
 * @param {Object} item - Enrollment or course object.
 * @returns {string} Resolved instructor name or default fallback string.
 */
function resolveInstructorName(item) {
  if (item.instructorName) return item.instructorName;
  if (item.course?.instructorName) return item.course.instructorName;

  const instructorObj = item.instructor || item.course?.instructor;
  if (typeof instructorObj === "string") return instructorObj;
  if (instructorObj?.fullName) return instructorObj.fullName;
  if (instructorObj?.name) return instructorObj.name;

  if (instructorObj?.firstName || instructorObj?.lastName) {
    return `${instructorObj.firstName || ""} ${instructorObj.lastName || ""}`.trim();
  }

  return "To be assigned";
}

/**
 * Safely extracts venue/location details directly fetched from the course entity.
 * 
 * @param {Object} item - Enrollment or course object.
 * @returns {string} Resolved venue name or "N/A".
 */
function resolveVenueName(item) {
  if (item.venueName) return item.venueName;
  if (item.course?.venueName) return item.course.venueName;

  const venueObj = item.venue || item.course?.venue || item.location || item.course?.location;
  if (typeof venueObj === "string" && venueObj.trim() !== "") return venueObj;
  if (venueObj?.name) return venueObj.name;
  if (venueObj?.venueName) return venueObj.venueName;
  if (venueObj?.location) return venueObj.location;

  return "N/A";
}

/**
 * Renders color-coded status badges reflecting current course enrollment state.
 * 
 * @param {string} rawStatus - Raw status string from database.
 * @returns {JSX.Element} Tailored Tailwind CSS badge element.
 */
function renderEnrollmentStatusBadge(rawStatus) {
  const status = (rawStatus || "PENDING").toUpperCase();

  if (status === "COMPLETED" || status === "PASSED" || status === "GRADUATED") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
        <CheckCircle2 className="h-3 w-3 text-emerald-600" strokeWidth={2.5} />
        Completed
      </span>
    );
  }

  if (
    status === "IN_PROGRESS" ||
    status === "ACTIVE" ||
    status === "APPROVED" ||
    status === "ENROLLED" ||
    status === "REGISTERED"
  ) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-blue-200 bg-blue-100/80 px-2.5 py-0.5 text-[11px] font-bold text-udom-primary">
        <Clock className="h-3 w-3 text-udom-primary" strokeWidth={2.5} />
        In progress
      </span>
    );
  }

  if (status === "REJECTED" || status === "CANCELLED") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rose-200 bg-rose-100/80 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
        <XCircle className="h-3 w-3 text-rose-600" strokeWidth={2.5} />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
      <Clock className="h-3 w-3 text-amber-600" strokeWidth={2.5} />
      Pending approval
    </span>
  );
}

// ============================================================================
// MAIN COMPONENT: MyEnrollmentsPage
// ============================================================================

/**
 * Component responsible for fetching and displaying a student's active and historical course enrollments.
 */
export default function MyEnrollmentsPage() {
  // State management for enrollments list, asynchronous loading, and global error handling
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Primary data-fetching side effect.
   * Attempts primary dashboard endpoint before falling back to explicit enrollments endpoint.
   */
  useEffect(() => {
    async function fetchMyEnrollments() {
      try {
        setLoading(true);
        setErrorMessage("");

        let res;
        try {
          res = await api.get("/api/v1/student/dashboard");
        } catch {
          res = await api.get("/api/v1/student/enrollments");
        }

        setEnrollments(extractEnrollmentsArray(res.data));
      } catch (err) {
        console.error("Failed to fetch enrollments from database:", err);
        setErrorMessage(
          err.response?.data?.message || "Unable to load your enrolled courses. Please verify your login session."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchMyEnrollments();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10 font-sans antialiased text-slate-800">
      
      {/* ------------------------------------------------------------------- */}
      {/* SECTION 1: Page Header                                              */}
      {/* Note: Browse button removed to prevent broken link routing          */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center">
        <div>
          <span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-udom-primary">
            Student portal
          </span>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            My enrolled courses
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Track your course progress, payment control numbers, venue details, and completion status.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* SECTION 2: Dynamic Alert Banner for Fetch Errors                    */}
      {/* ------------------------------------------------------------------- */}
      {errorMessage && (
        <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" strokeWidth={2} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* SECTION 3: Content States (Loading / Empty / Cards Grid)            */}
      {/* ------------------------------------------------------------------- */}
      {loading ? (
        /* Loading Skeleton Spinner State */
        <div className="mt-20 flex flex-col items-center justify-center p-12">
          <Loader2 className="h-9 w-9 animate-spin text-udom-primary" strokeWidth={2} />
          <p className="mt-3 text-sm font-medium text-slate-500">Fetching your enrolled courses...</p>
        </div>
      ) : enrollments.length === 0 ? (
        /* Empty State Fallback Display */
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
            <GraduationCap className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800">No course enrollments yet</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            You're not currently registered in any active short course. Explore available offerings to start learning.
          </p>
        </div>
      ) : (
        /* Enrolled Courses Responsive Cards Grid */
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {enrollments.map((item) => {
            // Normalize backend variables safely per record
            const enrollmentId = item.enrollmentId || item.id;
            const courseTitle =
              item.courseTitle || item.title || item.course?.title || item.course?.courseName || "Short course module";
            const courseCode =
              item.courseCode || item.code || item.course?.courseCode || item.course?.code || `CSC-${enrollmentId}`;
            const categoryName =
              item.categoryName || item.category || item.course?.categoryName || item.course?.category?.name || "General";
            const status = item.enrollmentStatus || item.status || item.courseStatus || "PENDING";
            const controlNumber = item.controlNumber || item.paymentControlNumber;
            const regDate = item.registrationDate || item.createdAt || item.enrolledAt;
            const instructorName = resolveInstructorName(item);

            return (
              <div
                key={enrollmentId}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
              >
                <div>
                  {/* Category Tag & Course Code Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      <Tag className="h-3 w-3 text-slate-500" strokeWidth={2} />
                      {categoryName}
                    </span>
                    <span className="rounded border border-slate-200 bg-slate-100 px-2.5 py-0.5 font-mono text-xs font-medium text-slate-600">
                      {courseCode}
                    </span>
                  </div>

                  {/* Course Title */}
                  <h2 
                    title={courseTitle}
                    className="mt-3 text-[13px] font-bold leading-snug tracking-tight text-slate-900 transition-colors duration-150 group-hover:text-udom-primary min-h-[2.5rem]"
                  >
                    {courseTitle}
                  </h2>

                  {/* Course Details Metadata Grid */}
                  <div className="mt-3.5 space-y-2.5 border-t border-slate-100 pt-3.5 text-xs text-slate-600">
                    
                    {/* Progress Status Row */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-500">Progress status:</span>
                      {renderEnrollmentStatusBadge(status)}
                    </div>

                    {/* Instructor Row with standard clean user icon */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                          <User className="h-3.5 w-3.5" strokeWidth={2.2} />
                        </span>
                        <span>Instructor:</span>
                      </div>
                      <span className="font-bold text-slate-800 truncate max-w-[140px] text-right">
                        {instructorName}
                      </span>
                    </div>

                    {/* Enrolled Date Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-600 border border-sky-100">
                          <Calendar className="h-3.5 w-3.5" strokeWidth={2.2} />
                        </span>
                        <span>Enrolled on:</span>
                      </div>
                      <span className="font-semibold text-slate-700">{formatDate(regDate)}</span>
                    </div>

                    {/* Control Number Row (Conditional Rendering) */}
                    {controlNumber && (
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <div className="flex items-center gap-2 text-slate-500">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <CreditCard className="h-3.5 w-3.5" strokeWidth={2.2} />
                          </span>
                          <span>Control no:</span>
                        </div>
                        <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-700">
                          {controlNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rejection Notice Banner (Conditional Rendering) */}
                  {status === "REJECTED" && item.rejectionReason && (
                    <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                      <span className="font-bold">Reason: </span>
                      {item.rejectionReason}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}