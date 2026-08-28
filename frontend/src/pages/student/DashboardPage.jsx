import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api/backendClient.js";
import StatCard from "../../components/shared/StatCard.jsx";
import { MY_INVOICES } from "../../data/paymentsData.js";
import { FileText, Wallet, Award, AlertCircle, UserCheck } from "lucide-react";

const QUICK_LINKS = [
  { to: "/applications", title: "My courses", description: "See the courses you've registered for and their status" },
  { to: "/announcements", title: "Announcements", description: "Read updates from your instructors" },
  { to: "/certificates", title: "Certificate status", description: "Check your eligibility for course certificates" },
  { to: "/profile", title: "My profile", description: "Update your personal information" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [dbStudent, setDbStudent] = useState(null);

  // Fetch real profile details directly from DB when page mounts
  useEffect(() => {
    async function loadStudentProfile() {
      try {
        const res = await api.get("/api/v1/student/profile");
        if (res.data) {
          setDbStudent(res.data);
        }
      } catch (err) {
        console.warn("Failed to retrieve student profile directly from DB:", err);
      }
    }
    loadStudentProfile();
  }, []);

  // Prefer DB response values over local context values
  const firstName = (dbStudent?.firstName || user?.firstName || "").trim();
  const lastName = (dbStudent?.lastName || user?.lastName || "").trim();

  // Concatenate first and last name
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  // Generate initials directly from names
  const firstInitial = firstName ? firstName.charAt(0) : "";
  const lastInitial = lastName ? lastName.charAt(0) : "";
  const initials = (firstInitial + lastInitial).toUpperCase() || "S";

  const isProfileComplete = Boolean(
    (dbStudent?.levelOfEducation || user?.levelOfEducation) &&
    (dbStudent?.nationality || user?.nationality) &&
    (dbStudent?.identificationNumber || user?.identificationNumber)
  );

  const outstandingBalance = MY_INVOICES.reduce((sum, inv) => sum + inv.balanceAmount, 0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      {/* Header section */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          {/* User Avatar Circle */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-udom-primary/10 text-lg font-bold text-udom-primary ring-4 ring-udom-primary/5">
            {initials}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                <UserCheck className="h-3 w-3 text-slate-500" />
                Student Portal
              </span>
            </div>

            {/* Display First Name and Last Name ONLY */}
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back{fullName ? `, ` : ""}<span className="text-udom-primary">{fullName}</span>
            </h1>
          </div>
        </div>
      </div>

      {/* Profile Completion Banner */}
      {!isProfileComplete && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" strokeWidth={1.8} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">Complete your student profile</p>
            <p className="mt-0.5 text-sm text-amber-700">
              You need to add your education level, nationality, and ID number before you can register for a course.
            </p>
          </div>
          <Link
            to="/profile"
            className="flex-shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-700"
          >
            Complete now
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={<FileText className="h-6 w-6" strokeWidth={1.8} />} label="Courses registered" value="0" tone="blue" />
        <StatCard
          icon={<Wallet className="h-6 w-6" strokeWidth={1.8} />}
          label="Outstanding balance"
          value={`TZS ${outstandingBalance.toLocaleString()}`}
          tone="teal"
        />
        <StatCard icon={<Award className="h-6 w-6" strokeWidth={1.8} />} label="Certificate status" value="Not eligible yet" tone="orange" />
      </div>

      {/* Quick Links */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-udom-primary/40 hover:shadow-md"
            >
              <p className="font-semibold text-slate-900 transition-colors group-hover:text-udom-primary">{link.title}</p>
              <p className="mt-1 text-sm text-slate-600">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}