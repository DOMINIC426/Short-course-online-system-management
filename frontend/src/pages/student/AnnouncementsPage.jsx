import { useEffect, useState } from "react";
import { Megaphone, Loader2 } from "lucide-react";
import { api } from "../../api/backendClient.js";

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

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        setLoading(true);
        const res = await api.get("/api/v1/student/announcements");
        if (Array.isArray(res.data)) {
          setAnnouncements(res.data);
        }
      } catch (err) {
        console.warn("Failed to retrieve announcements:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">
        Course updates
      </p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Announcements</h1>
      <p className="mt-2 text-sm text-slate-600">
        Read updates shared by instructors for your courses.
      </p>

      {/* Loading state */}
      {loading ? (
        <div className="mt-10 flex flex-col items-center justify-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-udom-primary" />
          <p className="mt-2 text-sm text-slate-500">Loading announcements...</p>
        </div>
      ) : announcements.length === 0 ? (
        /* Empty state */
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Megaphone className="mx-auto h-10 w-10 text-slate-300" strokeWidth={1.5} />
          <p className="mt-4 text-sm font-semibold text-slate-700">No announcements yet</p>
          <p className="mt-1 text-sm text-slate-500">New course updates will appear here.</p>
        </div>
      ) : (
        /* Real announcements list from API */
        <div className="mt-8 space-y-4">
          {announcements.map((announcement) => (
            <article
              key={announcement.announcementId}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <Megaphone className="mt-0.5 h-5 w-5 flex-shrink-0 text-udom-primary" strokeWidth={1.8} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{announcement.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {announcement.courseTitle || "General Announcement"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{announcement.message}</p>
                  <p className="mt-3 text-xs text-slate-400">
                    Posted on {formatDate(announcement.createdDate)}
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