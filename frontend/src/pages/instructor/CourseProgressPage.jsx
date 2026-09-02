import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MY_COURSES } from "../../data/instructorData.js";
import { CheckCircle2 } from "lucide-react";

export default function CourseProgressPage() {
  const { intakeId } = useParams();
  const course = MY_COURSES.find((c) => String(c.intakeId) === intakeId);

  const [topicsCompleted, setTopicsCompleted] = useState(course?.topicsCompleted || "");
  const [progressPercent, setProgressPercent] = useState(course?.progressPercent || 0);
  const [remarks, setRemarks] = useState(course?.remarks || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">Course not found</h1>
        <Link to="/instructor/dashboard" className="mt-4 inline-block text-sm font-semibold text-udom-primary hover:underline">
          ← Back to my courses
        </Link>
      </div>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    // TEMPORARY: mock save — replace with POST /api/v1/instructor/courses/:id/progress
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleMarkComplete() {
    setSaving(true);
    // TEMPORARY: mock save — replace with POST /api/v1/instructor/courses/:id/complete
    await new Promise((resolve) => setTimeout(resolve, 400));
    setProgressPercent(100);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8 sm:py-10">
      <Link to="/instructor/dashboard" className="text-sm font-semibold text-udom-primary hover:underline">
        ← Back to my courses
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">{course.courseName}</h1>
      <p className="mt-1 text-sm text-slate-500">Update course progress</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <label htmlFor="topicsCompleted" className="block text-sm font-medium text-slate-700">
            Topics completed
          </label>
          <textarea
            id="topicsCompleted"
            value={topicsCompleted}
            onChange={(e) => setTopicsCompleted(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-udom-accent"
          />
        </div>

        <div>
          <label htmlFor="progressPercent" className="block text-sm font-medium text-slate-700">
            Progress: {progressPercent}%
          </label>
          <input
            id="progressPercent"
            type="range"
            min="0"
            max="100"
            value={progressPercent}
            onChange={(e) => setProgressPercent(Number(e.target.value))}
            className="mt-2 w-full accent-udom-primary"
          />
        </div>

        <div>
          <label htmlFor="remarks" className="block text-sm font-medium text-slate-700">Remarks</label>
          <textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-udom-accent"
          />
        </div>

        {saved && (
          <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
            Saved successfully.
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-udom-primary px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save progress"}
          </button>
          <button
            type="button"
            onClick={handleMarkComplete}
            disabled={saving}
            className="rounded-md border border-emerald-600 px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
          >
            Mark course as completed
          </button>
        </div>
      </form>
    </div>
  );
}