import { Megaphone } from "lucide-react";
import { STUDENT_ANNOUNCEMENTS } from "../../data/announcementsData.js";

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AnnouncementsPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">
        Course updates
      </p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Announcements</h1>
      <p className="mt-2 text-sm text-slate-600">
        Read updates shared by instructors for your courses.
      </p>

      {STUDENT_ANNOUNCEMENTS.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Megaphone className="mx-auto h-10 w-10 text-slate-300" strokeWidth={1.5} />
          <p className="mt-4 text-sm font-semibold text-slate-700">No announcements yet</p>
          <p className="mt-1 text-sm text-slate-500">New course updates will appear here.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {STUDENT_ANNOUNCEMENTS.map((announcement) => (
            <article key={announcement.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <Megaphone className="mt-0.5 h-5 w-5 flex-shrink-0 text-udom-primary" strokeWidth={1.8} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{announcement.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{announcement.courseName}</p>
                    </div>
                    {!announcement.isRead && (
                      <span className="rounded-full bg-udom-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-udom-primary">
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{announcement.message}</p>
                  <p className="mt-3 text-xs text-slate-400">
                    {announcement.createdBy} · {formatDate(announcement.createdDate)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
