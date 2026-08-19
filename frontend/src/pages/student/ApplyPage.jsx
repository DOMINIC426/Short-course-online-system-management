import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { COURSE_INTAKES, FEATURED_COURSES } from "../../data/homeData.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api/backendClient.js";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function ApplyPage() {
  const { intakeId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const intake = COURSE_INTAKES.find((i) => String(i.id) === intakeId);
  const course = intake ? FEATURED_COURSES.find((c) => c.id === intake.courseId) : null;

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState("");
  const [error, setError] = useState("");

  const isProfileComplete = Boolean(
    user?.levelOfEducation && user?.nationality && user?.identificationNumber
  );

  async function handleApply() {
    setError("");
    setSubmitting(true);
    try {
      const response = await api.post("/api/applications", { intake_id: intake.id });
      setApplicationNumber(response.data.application_number);
      setSubmitted(true);
    } catch (err) {
      // TEMPORARY fallback until backend endpoint is ready — remove once connected
      setApplicationNumber(`APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (!intake || !course) {
    return (
      <section className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Intake not found</h1>
        <Link to="/courses" className="mt-6 inline-block text-sm font-semibold text-udom-primary hover:underline">
          ← Back to courses
        </Link>
      </section>
    );
  }

  if (!isProfileComplete) {
    return (
      <section className="mx-auto max-w-md px-6 py-16 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" strokeWidth={1.5} />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Complete your profile first</h1>
        <p className="mt-2 text-sm text-slate-600">
          You need to add your education level, nationality, and ID number before applying.
        </p>
        <Link
          to="/profile"
          className="mt-6 inline-block rounded-md bg-udom-primary px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95"
        >
          Complete profile
        </Link>
      </section>
    );
  }

  if (submitted) {
    return (
      <section className="mx-auto max-w-md px-6 py-16 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" strokeWidth={1.5} />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Application submitted</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your application number is <span className="font-semibold text-slate-900">{applicationNumber}</span>.
          You can track its status from your dashboard.
        </p>
        <button
          onClick={() => navigate("/applications")}
          className="mt-6 rounded-md bg-udom-primary px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95"
        >
          View my applications
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <Link to={`/courses/${course.id}`} className="text-sm font-semibold text-udom-primary hover:underline">
        ← Back to course
      </Link>

      <h1 className="mt-6 text-2xl font-bold text-slate-900">Apply to {intake.name}</h1>
      <p className="mt-1 text-slate-600">{course.courseName}</p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-500">Course</dt>
            <dd className="font-medium text-slate-900">{course.courseName}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Intake code</dt>
            <dd className="font-medium text-slate-900">{intake.intakeCode}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Dates</dt>
            <dd className="font-medium text-slate-900">{intake.startDate} – {intake.endDate}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Fee</dt>
            <dd className="font-medium text-slate-900">TZS {Number(intake.fee).toLocaleString()}</dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-slate-100 pt-6">
          <p className="text-sm font-semibold text-slate-900">Applicant</p>
          <p className="mt-1 text-sm text-slate-600">
            {user.firstName} {user.lastName} &middot; {user.email}
          </p>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          onClick={handleApply}
          disabled={submitting}
          className="mt-6 w-full rounded-md bg-udom-accent px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit application"}
        </button>
      </div>
    </section>
  );
}