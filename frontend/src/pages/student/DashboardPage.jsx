import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/backendClient.js";
import StatCard from "../../components/shared/StatCard.jsx";
import { FileText, Wallet, Award, BookOpen } from "lucide-react";

const QUICK_LINKS = [
  { to: "/applications", title: "My courses", description: "See the courses you've registered for and their status" },
  { to: "/announcements", title: "Announcements", description: "Read updates from your instructors" },
  { to: "/certificates", title: "Certificate status", description: "Check your eligibility for course certificates" },
  { to: "/profile", title: "My profile", description: "Update your personal information" },
];

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

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardAndProfile() {
      try {
        const [profileRes, dashboardRes, announcementsRes] = await Promise.all([
          api.get("/api/v1/student/profile").catch(() => null),
          api.get("/api/v1/student/dashboard").catch(() => null),
          api.get("/api/v1/student/announcements").catch(() => ({ data: [] })),
        ]);

        if (profileRes?.data) setProfile(profileRes.data);
        if (Array.isArray(dashboardRes?.data)) setDashboardData(dashboardRes.data);

        if (Array.isArray(announcementsRes?.data)) {
          setAnnouncements(announcementsRes.data.slice(0, 2));
        }
      } finally {
        setLoading(false);

      }

      if (Array.isArray(dashboardRes?.data?.content)) {
        setDashboardData(dashboardRes.data.content);
      }
    }
  

  fetchDashboardAndProfile();
}, []);
  const firstName = profile?.firstName || profile?.first_name || "";
  const coursesRegisteredCount = dashboardData.length;
  const outstandingBalance = dashboardData.reduce((sum, item) => sum + (item.balance || 0), 0);

  const statCards = [
    {
      label: "Courses registered",
      value: loading ? "…" : String(coursesRegisteredCount),
      detail: "View my courses",
      to: "/applications",
      icon: FileText,
      accent: "bg-[#eaf3ff] text-[#0b4d94]",
    },
    {
      label: "Outstanding balance",
      value: loading ? "…" : `TZS ${outstandingBalance.toLocaleString()}`,
      detail: "View payments",
      to: "/payments",
      icon: Wallet,
      accent: "bg-[#eafaf3] text-[#1d7c4d]",
    },
    {
      label: "Certificate status",
      value: "Not eligible",
      detail: "View status",
      to: "/certificates",
      icon: Award,
      accent: "bg-[#fff2e8] text-[#dc7a00]",
    },
  ];

  return (
    <div className="mx-auto max-w-[1360px]">
      <div className="rounded-[18px] bg-[#f1f5f9] p-4 sm:p-0">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0b4d94]">
            Dashboard
          </p>
        </div>

        <div className="mt-2 flex flex-col gap-1">
          <p className="text-base text-slate-500">
            Here is an overview of your courses and account.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {statCards.map(({ label, value, detail, to, icon: Icon, accent }) => (
            <Link
              key={label}
              to={to}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}>
                <Icon className="h-6 w-6" strokeWidth={1.8} />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-2 text-[2rem] font-extrabold tracking-[-0.04em] text-slate-900">{value}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0b4d94] transition hover:text-[#083b71]">
                {detail}
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M4 10h10m0 0-3.5-3.5M14 10l-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3ff] text-[#0b4d94]">
                  <FileText className="h-5 w-5" strokeWidth={2} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">My courses</h2>
              </div>
              <Link
                to="/courses"
                className="rounded-xl bg-[#f7941d] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
              >
                Browse courses
              </Link>
            </div>

            <div className="mt-8 flex min-h-[280px] flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#eaf3ff] text-[#0b4d94]">
                <BookOpen className="h-10 w-10" strokeWidth={1.8} />
              </div>
              <h3 className="mt-6 text-[2rem] font-bold tracking-[-0.04em] text-slate-900">No courses registered yet</h3>
              <p className="mt-3 text-base text-slate-500">You haven’t registered for any courses.</p>
              <Link
                to="/courses"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#0b4d94] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#083b71]"
              >
                Browse courses
              </Link>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3ff] text-[#0b4d94]">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                    <path d="M12 4.75a7.25 7.25 0 1 1 0 14.5 7.25 7.25 0 0 1 0-14.5Zm0 3.5v4l3 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Latest announcements</h2>
              </div>
              <Link to="/announcements" className="text-sm font-semibold text-[#0b4d94]">
                View all →
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {announcements.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                  No announcements yet.
                </div>
              ) : (
                announcements.map((item) => (
                  <div key={item.announcementId || item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-base font-semibold text-slate-900">{item.title}</p>
                      <span className="whitespace-nowrap text-xs font-medium text-slate-500">
                        {formatDate(item.createdDate || item.date)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.message || item.body}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}