import { useEffect, useState } from "react";
import { instructorApi } from "../../api/instructorApi";
import { MapPin, X, CheckCircle2, XCircle, BookOpen, Users, Clock, RefreshCw, Check, Tag } from "lucide-react";

// Backend responses aren't always shaped the same way (sometimes a bare array,
// sometimes wrapped in { data: [...] }, { courses: [...] }, etc.). This normalizes
// any of those shapes into a plain array so the rest of the page never has to
// worry about which one it got.
function extractArray(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.courses)) return res.courses;
  if (Array.isArray(res.students)) return res.students;
  return [];
}

// Different endpoints/entities have used different id field names over time
// (id, courseId, _id, code...). This tries them in order so the page keeps
// working even if the backend team renames a field later.
function getCourseId(course) {
  return course?.id ?? course?.courseId ?? course?._id ?? course?.code ?? course?.courseCode ?? "";
}

// Progress can arrive under a few different field names depending on which
// endpoint populated the course object. Clamping to 0-100 protects the
// progress bar from ever rendering wider than the card or going negative.
function getCourseProgress(course) {
  if (!course) return 0;
  const rawVal =
    course.progressPercent ?? course.progressPercentage ?? course.progress ?? course.completionPercentage ?? 0;
  return Math.min(100, Math.max(0, Number(rawVal) || 0));
}

// Completed topics might come back as a real array, or as a single
// comma-separated string (older/simpler API responses do this). Either way,
// this always hands back a clean array of individual topic strings.
function getTopicsList(course) {
  if (!course) return [];
  if (Array.isArray(course.completedTopics)) return course.completedTopics;
  if (Array.isArray(course.topicsCompleted)) return course.topicsCompleted;
  const str = course.completedTopics || course.topicsCompleted;
  if (typeof str === "string" && str.trim()) {
    return str.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [enrolledCounts, setEnrolledCounts] = useState({});
  const [fetchingCourses, setFetchingCourses] = useState(true);
  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => {
    // Guards against setting state after the component has unmounted, which
    // would otherwise trigger a React warning if the user navigates away
    // before these requests finish.
    let isMounted = true;

    async function loadCourses() {
      setFetchingCourses(true);
      try {
        const coursesData = await instructorApi.getAssignedCourses().catch(() => []);
        const courseList = extractArray(coursesData);
        if (!isMounted) return;
        setCourses(courseList);

        // The assigned-courses endpoint doesn't reliably include an accurate
        // enrolled-student count, so we fetch each course's real roster in
        // parallel and count it ourselves. Promise.all keeps this fast even
        // when an instructor has many courses, instead of fetching one by one.
        const countsMap = {};
        if (courseList.length > 0) {
          const studentPromises = courseList.map(async (course) => {
            const courseId = getCourseId(course);
            if (!courseId) return { courseId: null, count: 0 };

            const studentsRes = await instructorApi.getRegisteredStudents(courseId).catch(() => []);
            return { courseId, count: extractArray(studentsRes).length };
          });

          const results = await Promise.all(studentPromises);
          results.forEach(({ courseId, count }) => {
            if (courseId) countsMap[courseId] = count;
          });
        }

        if (isMounted) setEnrolledCounts(countsMap);
      } catch (error) {
        console.error("Failed to fetch assigned courses:", error);
        if (isMounted) showToast("Couldn't load your assigned courses.", "error");
      } finally {
        if (isMounted) setFetchingCourses(false);
      }
    }

    loadCourses();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      {toast && (
        <div
          className={`fixed right-5 top-5 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg ${
            toast.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" strokeWidth={2} />
          ) : (
            <XCircle className="h-5 w-5 flex-shrink-0 text-red-600" strokeWidth={2} />
          )}
          <p className="text-xs font-semibold">{toast.message}</p>
          <button onClick={() => setToast(null)} className="ml-2 rounded-lg p-1 hover:bg-black/5" aria-label="Dismiss">
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      )}

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">Instructor</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">My courses</h1>
          <p className="mt-1 text-sm text-slate-600">Courses currently assigned to you.</p>
        </div>
      </div>

      {fetchingCourses && courses.length === 0 ? (
        <div className="mt-8 flex h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white">
          <RefreshCw className="h-8 w-8 animate-spin text-udom-primary" strokeWidth={2} />
          <p className="text-sm text-slate-500">Loading assigned courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="mt-8 flex h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white text-center">
          <BookOpen className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
          <h3 className="text-base font-semibold text-slate-800">No assigned courses yet</h3>
          <p className="max-w-sm text-xs text-slate-500">
            Courses assigned to your instructor profile will appear here.
          </p>
        </div>
      ) : (
        // items-stretch (grid's default) already equalizes card HEIGHT within
        // a row, but a short card with no topics/remarks would otherwise just
        // leave empty space at the bottom while a full card looks "busier".
        // Rendering every section below with a placeholder fallback keeps the
        // internal layout identical across all cards, so they feel uniform
        // rather than just being the same height by accident.
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const courseId = getCourseId(course);
            const progressVal = getCourseProgress(course);
            const isCompleted = course.status === "COMPLETED";
            const topics = getTopicsList(course);
            const studentCount =
              enrolledCounts[courseId] ??
              course.enrolledStudentsCount ??
              course.enrolledCount ??
              course.totalEnrolled ??
              (Array.isArray(course.students) ? course.students.length : 0);

            return (
              // h-full + flex flex-col lets this card fill whatever height
              // the grid row settles on, and pushes the bottom sections
              // (topics, remarks) to line up consistently card to card.
              <div
                key={courseId}
                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-udom-primary">
                    <Tag className="h-3 w-3" strokeWidth={2} />
                    {course.courseCode || course.code || "COURSE"}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      isCompleted ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {course.status || "ACTIVE"}
                  </span>
                </div>

                {/* line-clamp-2 keeps long titles from pushing this card
                    taller than its neighbors; overflow just gets truncated
                    with an ellipsis instead. */}
                <h3 className="mt-3 line-clamp-2 text-base font-bold leading-snug text-slate-900">
                  {course.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500">{course.category || "General"}</p>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-udom-primary">
                      <MapPin className="h-4 w-4" strokeWidth={1.8} />
                    </span>
                    <span className="truncate text-xs text-slate-600">{course.venue || course.location || "Unset"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                      <Users className="h-4 w-4" strokeWidth={1.8} />
                    </span>
                    <span className="text-xs text-slate-600">
                      {fetchingCourses ? "…" : studentCount} enrolled
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" strokeWidth={2} /> Progress
                    </span>
                    <span className="text-slate-800">{progressVal}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full transition-all duration-300 ${isCompleted ? "bg-emerald-500" : "bg-udom-primary"}`}
                      style={{ width: `${progressVal}%` }}
                    />
                  </div>
                </div>

                {/* Always rendered, even with zero topics, so every card has
                    an identical block here instead of some cards being
                    shorter than others. */}
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Topics completed</p>
                  {topics.length > 0 ? (
                    <ul className="mt-2 space-y-1.5">
                      {topics.slice(0, 3).map((topic, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600" strokeWidth={2} />
                          <span className="truncate">{topic}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs italic text-slate-400">No topics recorded yet.</p>
                  )}
                </div>

                {/* mt-auto pins this to the bottom of the card regardless of
                    how much content sits above it, so the remarks line (or
                    its placeholder) always lands in the same spot. */}
                <p className="mt-auto line-clamp-2 pt-3 text-xs italic text-slate-500">
                  {course.remarks || course.notes || "No remarks added yet."}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}