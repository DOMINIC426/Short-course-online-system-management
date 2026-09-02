import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/backendClient.js";
import StatCard from "../../components/shared/StatCard.jsx";
import { FileText, Wallet, Award } from "lucide-react";

const QUICK_LINKS = [
  { to: "/applications", title: "My courses", description: "See the courses you've registered for and their status" },
  { to: "/announcements", title: "Announcements", description: "Read updates from your instructors" },
  { to: "/certificates", title: "Certificate status", description: "Check your eligibility for course certificates" },
  { to: "/profile", title: "My profile", description: "Update your personal information" },
];

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function fetchDashboardAndProfile() {
    try {
      const [profileRes, dashboardRes] = await Promise.all([
        api.get("/api/v1/student/profile").catch(() => null),
        api.get("/api/v1/student/dashboard").catch(() => null),
      ]);

      if (profileRes?.data) {
        setProfile(profileRes.data);
      }

      if (Array.isArray(dashboardRes?.data?.content)) {
        setDashboardData(dashboardRes.data.content);
      }
    } finally {
      setLoading(false);
    }
  }

  fetchDashboardAndProfile();
}, []);
  const firstName = profile?.firstName || profile?.first_name || "";
  const coursesRegisteredCount = dashboardData.length;
  const outstandingBalance = dashboardData.reduce((sum, item) => sum + (item.balance || 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">
        Dashboard
      </p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
        {loading ? "Welcome" : firstName ? `Welcome, ${firstName}` : "Welcome"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Here is an overview of your courses and payments.
      </p>

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<FileText className="h-6 w-6" strokeWidth={1.8} />}
          label="Courses registered"
          value={loading ? "…" : String(coursesRegisteredCount)}
          tone="blue"
        />
        <StatCard
          icon={<Wallet className="h-6 w-6" strokeWidth={1.8} />}
          label="Outstanding balance"
          value={loading ? "…" : `TZS ${outstandingBalance.toLocaleString()}`}
          tone="teal"
        />
        <StatCard
          icon={<Award className="h-6 w-6" strokeWidth={1.8} />}
          label="Certificate status"
          value="Not eligible"
          tone="orange"
        />
      </div>

      {/* Quick links */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-udom-primary/40 hover:shadow-md"
            >
              <p className="font-semibold text-slate-900 transition-colors group-hover:text-udom-primary">
                {link.title}
              </p>
              <p className="mt-1 text-sm text-slate-600">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}