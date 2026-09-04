import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/backendClient.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { 
  FileText, 
  Wallet, 
  Award, 
  BookOpen, 
  Compass, 
  Megaphone, 
  User, 
  ArrowRight,
  AlertTriangle,
  ShieldAlert
} from "lucide-react";

/**
 * DashboardPage Component
 * - Serves as the main landing overview page for logged-in students.
 * - Checks profile completeness and displays a high-visibility warning banner if missing.
 * - Displays top summary KPI cards and Quick Navigation features.
 */
export default function DashboardPage() {
  const { user, fetchUserProfile } = useAuth();

  // State for student dashboard metrics (enrollments & financial summaries)
  const [dashboardData, setDashboardData] = useState([]);
  
  // Loading state to manage skeleton/fallback values during API requests
  const [loading, setLoading] = useState(true);

  // Check if essential student details are incomplete
  const isProfileIncomplete = 
    !user?.levelOfEducation || !user?.nationality || !user?.identificationNumber;

  // Fetch dashboard data and sync profile on component mount
  useEffect(() => {
    async function fetchDashboardAndProfile() {
      try {
        setLoading(true);

        // Fetch user profile in background to ensure fresh state alongside dashboard metrics
        if (fetchUserProfile && user?.role === "STUDENT") {
          fetchUserProfile().catch((err) =>
            console.warn("Background profile sync failed:", err)
          );
        }

        // API call to retrieve aggregated student dashboard metrics
        const [dashboardRes] = await Promise.all([
          api.get("/api/v1/student/dashboard").catch((err) => {
            console.warn("Failed to fetch dashboard data:", err);
            return null;
          }),
        ]);

        // Normalize backend response structure (handles Spring Pageable or direct array payloads)
        if (Array.isArray(dashboardRes?.data?.content)) {
          setDashboardData(dashboardRes.data.content);
        } else if (Array.isArray(dashboardRes?.data)) {
          setDashboardData(dashboardRes.data);
        }
      } catch (error) {
        console.error("Dashboard data initialization error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardAndProfile();
  }, []);

  // Computed summary values derived directly from fetched student enrollment data
  const coursesRegisteredCount = dashboardData.length;
  const outstandingBalance = dashboardData.reduce(
    (sum, item) => sum + Number(item.balance || 0), 
    0
  );

  /**
   * Top KPI Summary Stat Cards Configuration
   */
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

  /**
   * Quick Action Navigation Cards Configuration
   */
  const quickActionCards = [
    {
      title: "Browse Courses",
      description: "Explore available short courses, course fees, and register for new courses.",
      to: "/student/courses",
      icon: Compass,
      accent: "bg-[#eaf3ff] text-[#0b4d94]",
    },
    {
      title: "My Courses",
      description: "Access your enrolled course catalog, view control numbers, and course progress.",
      to: "/applications",
      icon: BookOpen,
      accent: "bg-purple-50 text-purple-700",
    },
    {
      title: "My Payments",
      description: "View your course payment status, generated control numbers and fee balances",
      to: "/payments",
      icon: Wallet,
      accent: "bg-[#eafaf3] text-[#1d7c4d]",
    },
    {
      title: "Announcements",
      description: "Stay informed with official announcements from your instructor, academic notices and venue change updates.",
      to: "/announcements",
      icon: Megaphone,
      accent: "bg-amber-50 text-amber-700",
    },
    {
      title: "Certificate Status",
      description: "Check course completion eligibility, track certificate processing, and download your verified course certificates.",
      to: "/certificates",
      icon: Award,
      accent: "bg-[#fff2e8] text-[#dc7a00]",
    },
    {
      title: "My Profile",
      description: "Manage personal details, update contact details, and change your password to improve security on your account.",
      to: "/student/profile",
      icon: User, 
      accent: "bg-slate-100 text-slate-700",
    },
  ];

  return (
    <div className="mx-auto max-w-[1360px] font-sans antialiased">
      <div className="rounded-[18px] bg-[#f1f5f9] p-4 sm:p-0">
        
        {/* Section Header */}
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0b4d94]">
            Dashboard
          </p>
        </div>

        <div className="mt-1 flex flex-col gap-1">
          <p className="text-sm sm:text-base text-slate-500">
            Student account overview.
          </p>
        </div>

        

        {/* ----------------------------------------------------------------- */}
        {/* Top Summary Stat Cards Grid                                       */}
        {/* ----------------------------------------------------------------- */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map(({ label, value, detail, to, icon: Icon, accent }) => (
            <Link
              key={label}
              to={to}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* Icon Container */}
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </div>

              {/* Stat Metric */}
              <p className="mt-4 text-xs sm:text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-1.5 text-2xl sm:text-[1.85rem] font-extrabold tracking-tight text-slate-900 truncate">
                {value}
              </p>

              {/* Action Link Text */}
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0b4d94] transition hover:text-[#083b71]">
                {detail}
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </span>
            </Link>
          ))}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Quick Navigation Features Section                                 */}
        {/* ----------------------------------------------------------------- */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Quick Navigation and Features
            </h2>
          </div>

          {/* Quick Action Cards Grid */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActionCards.map(({ title, description, to, icon: Icon, accent }) => (
              <Link
                key={title}
                to={to}
                className="group flex flex-col justify-between rounded-[20px] border border-slate-200/90 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div>
                  {/* Top Card Icon & Arrow Indicator */}
                  <div className="flex items-center justify-between">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                    <span className="rounded-full bg-slate-50 p-2 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#0b4d94] transition">
                      <ArrowRight className="h-4 w-4" strokeWidth={2} />
                    </span>
                  </div>

                  {/* Card Title & Description */}
                  <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-[#0b4d94] transition">
                    {title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-500">
                    {description}
                  </p>
                </div>

                {/* Footer Link Label */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-[#0b4d94]">
                  Access section
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}