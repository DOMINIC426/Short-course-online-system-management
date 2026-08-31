import { useState } from "react";
import { MY_COURSES, ANNOUNCEMENTS_HISTORY } from "../../data/instructorData.js";
import { Send, CheckCircle2 } from "lucide-react";

const RECIPIENT_OPTIONS = [
  { value: "ALL", label: "All students" },
  { value: "PAID", label: "Paid students" },
  { value: "UNPAID", label: "Unpaid students" },
];

export default function AnnouncementsPage() {
  const [intakeId, setIntakeId] = useState(MY_COURSES[0]?.intakeId || "");
  const [recipientGroup, setRecipientGroup] = useState("ALL");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [history, setHistory] = useState(ANNOUNCEMENTS_HISTORY);

  async function handleSend(event) {
    event.preventDefault();
    setSending(true);
    // TEMPORARY: local mock send — replace with POST /api/v1/instructor/announcements
    await new Promise((resolve) => setTimeout(resolve, 500));
    setHistory((prev) => [
      { id: prev.length + 1, intakeId: Number(intakeId), recipientGroup, message, sentAt: new Date().toISOString().slice(0, 10) },
      ...prev,
    ]);
    setMessage("");
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">Instructor</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Announcements</h1>
      <p className="mt-2 text-sm text-slate-600">Send updates to students in your courses.</p>

      <form onSubmit={handleSend} className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <label className="block text-sm font-medium text-slate-700">Course</label>
          <select
            value={intakeId}
            onChange={(e) => setIntakeId(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-udom-accent"
          >
            {MY_COURSES.map((c) => (
              <option key={c.intakeId} value={c.intakeId}>{c.courseName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Send to</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {RECIPIENT_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setRecipientGroup(opt.value)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  recipientGroup === opt.value
                    ? "border-udom-primary bg-udom-primary text-white"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-slate-700">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-udom-accent"
          />
        </div>

        {sent && (
          <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
            Announcement sent.
          </div>
        )}

        <button
          type="submit"
          disabled={sending}
          className="flex items-center gap-2 rounded-md bg-udom-primary px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
        >
          <Send className="h-4 w-4" strokeWidth={2} />
          {sending ? "Sending..." : "Send announcement"}
        </button>
      </form>

      <h2 className="mt-10 text-lg font-semibold text-slate-900">Sent announcements</h2>
      <div className="mt-3 space-y-3">
        {history.map((a) => (
          <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                {a.recipientGroup}
              </span>
              <span className="text-xs text-slate-400">{a.sentAt}</span>
            </div>
            <p className="mt-2 text-sm text-slate-700">{a.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}