import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import StatCard from "../../components/shared/StatCard.jsx";
import { FileText, Wallet, Award, AlertCircle } from "lucide-react";
import { MY_INVOICES } from "../../data/paymentsData.js";

const QUICK_LINKS = [
  { to: "/applications", title: "My applications", description: "Track the status of your submitted applications" },
  { to: "/attendance", title: "My attendance", description: "See your attendance record per course" },
  { to: "/results", title: "My results", description: "View assessment scores and pass/fail status" },
  { to: "/profile", title: "My profile", description: "Update your personal information and documents" },
];

export default function DashboardPage() {
  const { user } = useAuth();

  // TEMPORARY: until backend returns a real "student profile complete" flag,
  // treat the profile as incomplete unless these fields are present.
  const isProfileComplete = Boolean(
    user?.levelOfEducation && user?.nationality && user?.identificationNumber
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">
            Student dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Welcome{user?.firstName ? `, ${user.firstName}` : ""}
          </h1>
        </div>
      </div>

      {!isProfileComplete && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" strokeWidth={1.8} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Complete your student profile</p>
            <p className="mt-0.5 text-sm text-amber-700">
              You need to add your education level, nationality, and ID number before you can apply to any course.
            </p>
          </div>
          <Link
            to="/profile"
            className="flex-shrink-0 rounded-md bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700"
          >
            Complete now
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={<FileText className="h-6 w-6" strokeWidth={1.8} />} label="Applications submitted" value="0" tone="blue" />
        <StatCard
  icon={<Wallet className="h-6 w-6" strokeWidth={1.8} />}
  label="Outstanding balance"
  value={`TZS ${MY_INVOICES.reduce((sum, inv) => sum + inv.balanceAmount, 0).toLocaleString()}`}
  tone="teal"
/>
        <StatCard icon={<Award className="h-6 w-6" strokeWidth={1.8} />} label="Certificates earned" value="0" tone="orange" />
      </div>

      {/* Quick links */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-udom-primary/40 hover:shadow-md"
            >
              <p className="font-semibold text-slate-900">{link.title}</p>
              <p className="mt-1 text-sm text-slate-600">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}