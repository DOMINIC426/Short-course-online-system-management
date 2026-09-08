import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { instructorApi } from "../../api/instructorApi.js";
import { FileText, Users, BookOpen, ArrowRight, Megaphone, Award } from "lucide-react";

export default function InstructorDashboardPage() {
  const [courses, setCourses] = useState([]);
  const [enrolledCounts, setEnrolledCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // Backend responses aren't always shaped the same way (sometimes a bare
  // array, sometimes wrapped in { data: [...] }, { courses: [...] }, etc.).
  // This normalizes any of those shapes so the rest of the page never has
  // to worry about which one it got back.
  const extractArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.courses)) return res.courses;
    if (Array.isArray(res.students)) return res.students;
    return [];
  };

  // Different endpoints have used different id field names over time
  // (id, courseId, _id...). Trying them in order keeps this working even
  // if the backend renames a field later.
  const getCourseId = (course) => {
    return course?.id ?? course?.courseId ?? course?._id ?? "";
  };

  useEffect(() => {
    // Guards against setting state after the component has unmounted,
    // which would otherwise trigger a React warning if the instructor
    // navigates away before these requests finish.
    let isMounted = true;

    async function fetchInstructorDashboardData() {
      try {
        setLoading(true);

        // 1. Fetch assigned courses
        const coursesData = await instructorApi.getAssignedCourses().catch(() => []);
        const courseList = extractArray(coursesData);

        if (!isMounted) return;
        setCourses(courseList);

        // 2. Fetch enrolled student list for each assigned course to
        // compute accurate totals. The assigned-courses endpoint doesn't
        // reliably include a correct enrolled-count field, so we ask each
        // course's real roster and count it ourselves. Promise.all runs
        // these requests in parallel rather than one at a time, so this
        // stays fast even when an instructor has several courses.
        const countsMap = {};
        if (courseList.length > 0) {
          const studentPromises = courseList.map(async (course) => {
            const courseId = getCourseId(course);
            if (!courseId) return { courseId: null, count: 0 };

            // Call endpoint: /api/v1/instructor/courses/{courseId}/students
            const studentsRes = await instructorApi.getRegisteredStudents(courseId).catch(() => []);

            const studentsList = extractArray(studentsRes);
            return { courseId, count: studentsList.length };
          });

          const results = await Promise.all(studentPromises);
          results.forEach(({ courseId, count }) => {
            if (courseId) {
              countsMap[courseId] = count;
            }
          });
        }

        if (isMounted) {
          setEnrolledCounts(countsMap);
        }
      } catch (err) {
        console.error("Error fetching instructor dashboard data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchInstructorDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalCourses = courses.length;

  const activeCoursesCount = courses.filter((c) => {
    const status = String(c?.status || "").toUpperCase();
    return status === "PUBLISHED" || status === "ACTIVE" || status === "REGISTRATION_OPEN";
  }).length;

  // Sums the real per-course counts fetched above, falling back to
  // whatever count field the course object itself might already carry
  // if the roster fetch for that particular course failed.
  const totalEnrolledStudents = courses.reduce((acc, course) => {
    const cId = getCourseId(course);
    const count =
      enrolledCounts[cId] ??
      course.enrolledStudentsCount ??
      course.enrolledCount ??
      course.totalEnrolled ??
      (Array.isArray(course.students) ? course.students.length : 0);
    return acc + Number(count || 0);
  }, 0);

  // Centralizing tone-to-color mapping here means adjusting a shade later
  // only needs one edit, rather than hunting through every card.
  const toneStyles = {
    blue: "bg-blue-50 text-udom-primary",
    teal: "bg-teal-50 text-teal-600",
    orange: "bg-orange-50 text-udom-accent",
    purple: "bg-purple-50 text-purple-600",
  };

  const statCards = [
    {
      label: "Assigned courses",
      value: loading ? "…" : String(totalCourses),
      detail: "View my courses",
      to: "/instructor/courses",
      icon: BookOpen,
      tone: "blue",
    },
    {
      label: "Active intakes",
      value: loading ? "…" : String(activeCoursesCount),
      detail: "Manage active courses",
      to: "/instructor/courses",
      icon: FileText,
      tone: "teal",
    },
    {
      label: "Total enrolled students",
      value: loading ? "…" : String(totalEnrolledStudents),
      detail: "View student lists",
      to: "/instructor/students",
      icon: Users,
      tone: "orange",
    },
  ];

  // Each card here mirrors one item in the instructor sidebar, giving a
  // quick "what can I do from here" overview. This replaces the old
  // course-by-course list, since that list already lives on its own
  // dedicated page at /instructor/courses — showing it twice just meant
  // two places to keep in sync.
  const featureCards = [
    {
      label: "My courses",
      description: "View the short courses assigned to you and track their progress.",
      to: "/instructor/courses",
      icon: BookOpen,
      tone: "blue",
    },
    {
      label: "Registered students",
      description: "See who's enrolled in each of your courses and their payment status.",
      to: "/instructor/students",
      icon: Users,
      tone: "teal",
    },
    {
      label: "Announcements",
      description: "Send messages to all, paid, unpaid, or selected students.",
      to: "/instructor/announcements",
      icon: Megaphone,
      tone: "orange",
    },
    {
      label: "Certificate eligibility",
      description: "Mark students as eligible or not eligible once a course completes.",
      to: "/instructor/certificates",
      icon: Award,
      tone: "purple",
    },
  ];

  return (
    // max-w-6xl plus responsive padding (px-5 on phones, sm:px-8 once
    // there's more room) keeps the page comfortable to read on a wide
    // monitor without wasting space on a narrow screen.
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">Instructor dashboard</p>
      <p className="mt-1 text-sm text-slate-600">
        Overview of your assigned short courses and student management.
      </p>

      {/* grid-cols-1 stacks stat cards in one column on a phone; sm:
          switches to 2 and xl: to 3 as the viewport widens, so all three
          cards sit in a single tidy row only once there's genuinely room. */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map(({ label, value, detail, to, icon: Icon, tone }) => (
          <Link
            key={label}
            to={to}
            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-udom-primary/40 hover:shadow-md"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${toneStyles[tone]}`}>
              <Icon className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <p className="mt-4 text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-udom-primary">
              {detail}
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
          </Link>
        ))}
      </div>

      {/* Quick access to every instructor feature, mirroring the sidebar. */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {featureCards.map(({ label, description, to, icon: Icon, tone }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-udom-primary/40 hover:shadow-md"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${toneStyles[tone]}`}>
                <Icon className="h-6 w-6" strokeWidth={1.8} />
              </div>
              <p className="mt-4 text-base font-semibold text-slate-900">{label}</p>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}