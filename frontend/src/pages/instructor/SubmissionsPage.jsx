import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ClipboardCheck, Search } from "lucide-react";

const INITIAL_SUBMISSIONS = [
  { id: "SUB-1042", student: "Amina Hassan", course: "Data Analysis for Evidence-Based Decision Making", assignment: "Assignment 1: Regression analysis", submitted: "18 Aug 2026", score: "78", status: "Pending review", feedback: "" },
  { id: "SUB-1043", student: "Baraka Mollel", course: "Data Analysis for Evidence-Based Decision Making", assignment: "Assignment 1: Regression analysis", submitted: "19 Aug 2026", score: "64", status: "Pending review", feedback: "" },
  { id: "SUB-1044", student: "Neema Joseph", course: "Research Methods in Public Administration", assignment: "Research proposal", submitted: "19 Aug 2026", score: "", status: "Pending review", feedback: "" },
  { id: "SUB-1038", student: "Juma Ally", course: "Project Planning and Management", assignment: "Project risk register", submitted: "14 Aug 2026", score: "82", status: "Reviewed", feedback: "Clear risk categories and useful mitigations." },
];

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All submissions");
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState({ score: "", feedback: "" });
  const [error, setError] = useState("");

  const filteredSubmissions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return submissions.filter((submission) => {
      const matchesSearch = !query || `${submission.id} ${submission.student} ${submission.course} ${submission.assignment}`.toLowerCase().includes(query);
      const matchesStatus = status === "All submissions" || submission.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status, submissions]);

  function selectSubmission(submission) {
    setSelectedId(submission.id);
    setDraft({ score: submission.score, feedback: submission.feedback });
    setError("");
  }

  function reviewSubmission() {
    const score = Number(draft.score);
    if (!draft.score || Number.isNaN(score) || score < 0 || score > 100) {
      setError("Enter a score from 0 to 100 before reviewing this submission.");
      return;
    }
    if (!draft.feedback.trim()) {
      setError("Add feedback before marking the submission as reviewed.");
      return;
    }
    setSubmissions((current) => current.map((submission) => submission.id === selectedId
      ? { ...submission, score: String(score), feedback: draft.feedback.trim(), status: "Reviewed" }
      : submission));
    setError("");
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <Link to="/instructor" className="inline-flex items-center gap-2 text-sm font-semibold text-udom-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>
      <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">Assessment management</p><h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Submission review</h1><p className="mt-2 text-sm text-slate-600">Review submissions from your assigned courses and provide feedback.</p></div>
        <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700"><ClipboardCheck className="h-5 w-5" />{submissions.filter((item) => item.status === "Pending review").length} pending</div>
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
        <label className="relative flex-1"><span className="sr-only">Search submissions</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by student, course, or assignment" className="w-full rounded-md border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-udom-primary focus:ring-2 focus:ring-udom-primary/20" /></label>
        <label><span className="sr-only">Filter submissions by status</span><select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 sm:w-44"><option>All submissions</option><option>Pending review</option><option>Reviewed</option></select></label>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">Assigned submissions</h2><p className="mt-1 text-xs text-slate-500">{filteredSubmissions.length} submissions shown</p></div><div className="divide-y divide-slate-100">{filteredSubmissions.map((submission) => <button key={submission.id} onClick={() => selectSubmission(submission)} className={`block w-full px-5 py-4 text-left hover:bg-slate-50 ${selectedId === submission.id ? "bg-blue-50" : ""}`}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-900">{submission.student}</p><p className="mt-1 text-xs text-slate-600">{submission.assignment}</p><p className="mt-1 text-xs text-slate-400">{submission.course} &middot; {submission.submitted}</p></div><span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${submission.status === "Reviewed" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>{submission.status}</span></div></button>)}{filteredSubmissions.length === 0 && <p className="p-10 text-center text-sm text-slate-500">No submissions match your filters.</p>}</div></section>

        <section className="rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">Review details</h2><p className="mt-1 text-xs text-slate-500">Select a submission from the queue.</p></div>{selectedId ? <div className="space-y-5 p-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected submission</p><p className="mt-1 font-semibold text-slate-900">{selectedId}</p></div><label className="block"><span className="text-sm font-medium text-slate-700">Score / 100</span><input type="number" min="0" max="100" value={draft.score} onChange={(event) => { setDraft({ ...draft, score: event.target.value }); setError(""); }} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm" /></label><label className="block"><span className="text-sm font-medium text-slate-700">Feedback</span><textarea rows="5" value={draft.feedback} onChange={(event) => { setDraft({ ...draft, feedback: event.target.value }); setError(""); }} placeholder="Write constructive feedback for the student" className="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 text-sm" /></label>{error && <p className="text-sm text-red-600">{error}</p>}<button onClick={reviewSubmission} className="inline-flex items-center gap-2 rounded-md bg-udom-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-udom-primary-dark"><CheckCircle2 className="h-4 w-4" /> Mark as reviewed</button></div> : <div className="p-10 text-center text-sm text-slate-500">Choose a submission to enter its score and feedback.</div>}</section>
      </div>
    </div>
  );
}
