import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { instructorApi } from "../../api/instructorApi.js";
import { FileText, Users, Award, BookOpen, AlertCircle } from "lucide-react";

function formatDate(date) {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

export default function InstructorDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInstructorDashboardData() {
      try {
        // Calling Instructor Endpoints:
        // 1. GET /api/v1/instructor/me
        // 2. GET /api/v1/instructor/courses
        const [profileData, coursesData] = await Promise.all([
          instructorApi.getProfile().catch(() => null),
          instructorApi.getAssignedCourses().catch(() => []),
        ]);

        if (profileData) setProfile(profileData);
        if (Array.isArray(coursesData)) setCourses(coursesData);
      } finally {
        setLoading(false);
      }
    }

    fetchInstructorDashboardData();
  }, []);

  const instructorName = profile
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
    : "Instructor";

  const totalCourses = courses.length;
  const activeCoursesCount = courses.filter(
    (c) => c.status === "PUBLISHED" || c.status === "ACTIVE"
  ).length;

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
      label: "Instructor Profile",
      value: profile ? "Active" : "Loaded",
      detail: "View profile details",
      to: "/instructor/profile",
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
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    d="M4 10h10m0 0-3.5-3.5M14 10l-3.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          ))}
        </div>

        {/* Course List Overview */}
        <div className="mt-8 grid grid-cols-1 gap-5">
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3ff] text-[#0b4d94]">
                  <BookOpen className="h-5 w-5" strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Assigned Courses
                </h2>
              </div>
              <Link
                to="/instructor/courses"
                className="rounded-xl bg-[#0b4d94] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#083b71]"
              >
                View all courses
              </Link>
            </div>

            {courses.length === 0 ? (
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
              <div className="mt-6 divide-y divide-slate-100">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex flex-col items-start justify-between gap-4 py-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {course.courseCode}
                      </span>
                      <h3 className="mt-1 text-lg font-bold text-slate-900">
                        {course.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          course.status === "PUBLISHED"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {course.status}
                      </span>
                      <Link
                        to={`/instructor/courses/${course.id}/students`}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Manage Students
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}