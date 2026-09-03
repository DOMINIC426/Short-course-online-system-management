import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCourses } from "../../api/marketApi.js";
import { api } from "../../api/backendClient.js";
import { Calendar, MapPin, Users } from "lucide-react";

function formatFee(fee) {
  return `TZS ${Number(fee || 0).toLocaleString()}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState(null);

  useEffect(() => {
    async function fetchCourseDetails() {
      try {
        setLoading(true);
        const data = await getCourses();
        const courseList = Array.isArray(data) ? data : data?.data || [];
        const found = courseList.find((c) => String(c.id) === String(id));
        setCourse(found || null);
      } catch (err) {
        console.error("Failed to fetch course details:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourseDetails();
  }, [id]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      setEnrollMessage(null);

      const response = await api.post("/api/v1/student/enroll", {
        courseId: Number(id),
      });

      setEnrollMessage({
        type: "success",
        text: `Successfully enrolled! Control Number: ${
          response.data?.controlNumber || "Generated"
        }`,
      });
    } catch (err) {
      console.error("Enrollment error:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/login");
      } else {
        setEnrollMessage({
          type: "error",
          text: err.response?.data?.message || "Failed to submit enrollment application.",
        });
      }
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16 text-center text-sm text-slate-500">
        Loading course details...
      </section>
    );
  }

  if (!course) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">
          Not found
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          We couldn't find that course
        </h1>
        <Link
          to="/courses"
          className="mt-6 inline-block text-sm font-semibold text-udom-primary hover:underline"
        >
          ← Back to all courses
        </Link>
      </section>
    );
  }

  const courseTitle = course.title || course.courseName || "Untitled Course";
  const category = course.categoryName || "General";
  const code = course.courseCode || course.code || "";
  const fee = course.courseFee ?? course.defaultFee ?? 0;
  const duration = course.duration || (course.durationValue ? `${course.durationValue} ${course.durationUnit}` : "N/A");

  // Determine enrollment status based on dates / status
  const isRegistrationOpen =
    course.status === "REGISTRATION_OPEN" || course.status === "OPEN" || course.status === "PUBLISHED";

  return (
    <section className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      {/* Breadcrumb / back link */}
      <Link
        to="/courses"
        className="text-sm font-semibold text-udom-primary hover:underline"
      >
        ← Back to courses
      </Link>

      {/* Header */}
      <div className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">
          {category} {code ? `· ${code}` : ""}
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          {courseTitle}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          {course.description || "No description provided."}
        </p>
      </div>

      {enrollMessage && (
        <div
          className={`mt-6 rounded-xl p-4 text-sm font-semibold ${
            enrollMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {enrollMessage.text}
        </div>
      )}

      {/* Key stats */}
      <dl className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-3 sm:p-6">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Duration
          </dt>
          <dd className="mt-1 text-base font-semibold text-slate-900">
            {duration}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Max Students
          </dt>
          <dd className="mt-1 text-base font-semibold text-slate-900">
            {course.maxStudents || "Unspecified"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Course fee
          </dt>
          <dd className="mt-1 text-base font-semibold text-udom-primary">
            {formatFee(fee)}
          </dd>
        </div>
      </dl>

      {/* Course details grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">
            Venue / Location
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {course.venueName || "Main Campus / Online"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">
            Registration Period
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {formatDate(course.regOpenDate)} – {formatDate(course.regCloseDate)}
          </p>
        </div>
      </div>

      {/* Intakes / Apply Section */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">
          Available intakes
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Choose an intake below to apply. You can only apply to intakes that are open.
        </p>

        <div className="mt-4 space-y-4">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900">
                  {courseTitle} Intake
                </p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    isRegistrationOpen
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {course.status || "OPEN"}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />{" "}
                  {formatDate(course.startDate)} – {formatDate(course.endDate)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {course.venueName || "Main Campus"}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> Capacity{" "}
                  {course.maxStudents || "N/A"}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Register by {formatDate(course.regCloseDate)} &middot;{" "}
                {formatFee(fee)}
              </p>
            </div>

            {isRegistrationOpen ? (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="flex-shrink-0 rounded-xl bg-udom-accent px-5 py-2.5 text-center text-sm font-semibold text-white hover:brightness-95 disabled:opacity-50"
              >
                {enrolling ? "Enrolling..." : "Apply now"}
              </button>
            ) : (
              <span className="flex-shrink-0 rounded-xl border border-slate-200 px-5 py-2.5 text-center text-sm font-medium text-slate-400">
                Registration closed
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}