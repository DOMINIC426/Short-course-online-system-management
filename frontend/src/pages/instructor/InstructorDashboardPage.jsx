import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { instructorApi } from "../../api/instructorApi.js";
import {
  FileText,
  Users,
  BookOpen,
  CheckCircle2,
  Lock,
  DoorOpen,
  Clock,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export default function InstructorDashboardPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInstructorDashboardData() {
      try {
        const coursesData = await instructorApi
          .getAssignedCourses()
          .catch(() => []);
        const courseList = Array.isArray(coursesData)
          ? coursesData
          : coursesData?.data || [];
        setCourses(courseList);
      } finally {
        setLoading(false);
      }
    }

    fetchInstructorDashboardData();
  }, []);

  // Helper to extract course unique ID
  const getCourseId = (course) => {
    return (
      course?.id ||
      course?.courseId ||
      course?._id ||
      course?.code ||
      course?.courseCode ||
      ""
    );
  };

  // Helper to render clean status badges with icons
  const renderStatusBadge = (status) => {
    const s = String(status || "").toUpperCase();

    switch (s) {
      case "REGISTRATION_OPEN":
      case "OPEN":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-2xs">
            <DoorOpen className="h-3.5 w-3.5 text-emerald-600" />
            Registration Open
          </span>
        );
      case "PUBLISHED":
      case "ACTIVE":
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0b4d94] shadow-2xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#0b4d94]" />
            Active Intake
          </span>
        );
      case "COMPLETED":
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 shadow-2xs">
            <Lock className="h-3.5 w-3.5 text-slate-500" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 shadow-2xs">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            {s ? s.replace(/_/g, " ") : "Upcoming"}
          </span>
        );
    }
  };

  const totalCourses = courses.length;

  const activeCoursesCount = courses.filter(
    (c) =>
      c.status === "PUBLISHED" ||
      c.status === "ACTIVE" ||
      c.status === "REGISTRATION_OPEN"
  ).length;

  // Calculate cumulative enrolled students across all assigned courses
  const totalEnrolledStudents = courses.reduce((acc, course) => {
    const studentCount =
      course.enrolledStudentsCount ||
      course.enrolledCount ||
      course.totalEnrolled ||
      (Array.isArray(course.students) ? course.students.length : 0);
    return acc + Number(studentCount || 0);
  }, 0);

  const statCards = [
    {
      label: "Assigned Courses",
      value: loading ? "…" : String(totalCourses),
      detail: "View my courses",
      to: "/instructor/courses",
      icon: BookOpen,
      accent: "bg-[#eaf3ff] text-[#0b4d94]",
    },
    {
      label: "Active Intakes",
      value: loading ? "…" : String(activeCoursesCount),
      detail: "Manage active courses",
      to: "/instructor/courses",
      icon: FileText,
      accent: "bg-[#eafaf3] text-[#1d7c4d]",
    },
    {
      label: "Total Enrolled Students",
      value: loading ? "…" : String(totalEnrolledStudents),
      detail: "View student lists",
      to: "/instructor/students",
      icon: Users,
      accent: "bg-[#fff2e8] text-[#dc7a00]",
    },
  ];

  return (
    <div className="mx-auto max-w-[1360px] p-4 sm:p-6">
      <div className="rounded-[18px] bg-[#f1f5f9] p-6">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0b4d94]">
            Instructor Dashboard
          </p>
        </div>

        <div className="mt-2 flex flex-col gap-1">
          <p className="text-base text-slate-500">
            Overview of your assigned short courses and student management.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {statCards.map(({ label, value, detail, to, icon: Icon, accent }) => (
            <Link
              key={label}
              to={to}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}
              >
                <Icon className="h-6 w-6" strokeWidth={1.8} />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-2 text-[2rem] font-extrabold tracking-[-0.04em] text-slate-900">
                {value}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0b4d94] transition hover:text-[#083b71]">
                {detail}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>

        {/* Course List Overview */}
        <div className="mt-8 grid grid-cols-1 gap-5">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3ff] text-[#0b4d94]">
                  <BookOpen className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Assigned Courses
                  </h2>
                  <p className="text-xs text-slate-500">
                    Courses currently managed under your instructor profile
                  </p>
                </div>
              </div>
              <Link
                to="/instructor/courses"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0b4d94] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#083b71]"
              >
                View all courses
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="mt-8 flex h-40 items-center justify-center text-sm font-medium text-slate-400">
                Loading assigned courses...
              </div>
            ) : courses.length === 0 ? (
              <div className="mt-8 flex min-h-[220px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf3ff] text-[#0b4d94]">
                  <BookOpen className="h-8 w-8" strokeWidth={1.8} />
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-900">
                  No courses assigned yet
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Courses assigned to you by administrators will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {courses.map((course, idx) => {
                  const courseId = getCourseId(course);
                  const courseCode =
                    course.courseCode || course.code || "SCMS-COURSE";
                  const studentCount =
                    course.enrolledStudentsCount ||
                    course.enrolledCount ||
                    course.totalEnrolled ||
                    (Array.isArray(course.students)
                      ? course.students.length
                      : 0);

                  return (
                    <div
                      key={courseId || `course-card-${idx}`}
                      className="group flex flex-col justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-slate-300 hover:bg-white hover:shadow-xs sm:flex-row sm:items-center"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-[#0b4d94]">
                            {courseCode}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            • {studentCount} Enrolled
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 transition group-hover:text-[#0b4d94]">
                          {course.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3">
                        {renderStatusBadge(course.status)}
                        <Link
                          to="/instructor/courses"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-[#0b4d94] hover:bg-blue-50 hover:text-[#0b4d94]"
                          title="Manage Course"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}