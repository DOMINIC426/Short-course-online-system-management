import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/backendClient.js";
import { Wallet, Info, CheckCircle2, AlertCircle, BookOpen } from "lucide-react";

function formatMoney(amount) {
  return `TZS ${Number(amount || 0).toLocaleString()}`;
}

function extractArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function MyPaymentsPage() {
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFinancialOverview() {
      try {
        setLoading(true);
        const dashboardRes = await api.get("/api/v1/student/dashboard").catch(() => null);

        if (dashboardRes?.data) {
          setDashboardData(extractArray(dashboardRes.data));
        }
      } catch (err) {
        console.warn("Failed to load financial data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFinancialOverview();
  }, []);

  // Compute totals
  const totalRemaining = dashboardData.reduce((sum, item) => sum + Number(item.balance || 0), 0);
  const totalPaid = dashboardData.reduce((sum, item) => sum + Number(item.amountPaid || item.paidAmount || 0), 0);
  const totalBilled = dashboardData.reduce((sum, item) => {
    const remaining = Number(item.balance || 0);
    const paid = Number(item.amountPaid || item.paidAmount || 0);
    const fee = Number(item.courseFee || item.fee || (paid + remaining));
    return sum + fee;
  }, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10 font-sans antialiased text-slate-800">
      {/* Page Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#0b4d94]">
          Payment Management
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl tracking-tight">
          My Payments & Balance
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-xl">
          Review your enrolled course financial summary and check remaining balances.
        </p>
      </div>

      {/* Responsive KPI Summary Cards Grid */}
      <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Course Fees Card */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-blue-200/80 bg-blue-50/50 p-4 shadow-xs transition hover:shadow-md">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100/80 text-[#0b4d94]">
            <Wallet className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-blue-900/70">Total Course Fees</p>
            <p className="text-lg font-extrabold text-slate-900 truncate">
              {loading ? "..." : formatMoney(totalBilled)}
            </p>
          </div>
        </div>

        {/* Total Paid Amount Card */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-xs transition hover:shadow-md">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-emerald-900/70">Total Paid Amount</p>
            <p className="text-lg font-extrabold text-emerald-950 truncate">
              {loading ? "..." : formatMoney(totalPaid)}
            </p>
          </div>
        </div>

        {/* Remaining Balance Card */}
        <div className={`flex items-center gap-3.5 rounded-2xl border p-4 shadow-xs transition hover:shadow-md sm:col-span-2 lg:col-span-1 ${
          totalRemaining > 0 
            ? "border-amber-200/90 bg-amber-50/60" 
            : "border-slate-200 bg-slate-50/50"
        }`}>
          <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
            totalRemaining > 0 ? "bg-amber-100/90 text-amber-700" : "bg-slate-200/80 text-slate-600"
          }`}>
            <AlertCircle className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-600">Remaining Balance</p>
            <p className={`text-lg font-extrabold truncate ${
              totalRemaining > 0 ? "text-amber-950" : "text-slate-900"
            }`}>
              {loading ? "..." : formatMoney(totalRemaining)}
            </p>
          </div>
        </div>
      </div>

      {/* Info Notice Container */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-xs sm:text-sm text-blue-900">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#0b4d94]" strokeWidth={1.8} />
        <p className="leading-relaxed">
          Use your unique course control number when initiating bank transfers or mobile money payments.
        </p>
      </div>

      {/* Enrolled Courses Breakdown Section */}
      <div className="mt-8">
        <h2 className="text-base font-bold text-slate-900">Enrolled Course Balances</h2>

        {loading ? (
          <div className="mt-4 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 rounded-2xl border border-slate-200 bg-white p-5 animate-pulse" />
            ))}
          </div>
        ) : dashboardData.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-xs">
            <BookOpen className="mx-auto h-10 w-10 text-slate-300" strokeWidth={1.5} />
            <p className="mt-3 text-sm font-semibold text-slate-700">No registered courses found</p>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              You currently have no active course registrations linked to your payment profile.
            </p>
            <Link
              to="/student/courses"
              className="mt-4 inline-block rounded-xl bg-[#0b4d94] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#083b71]"
            >
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4">
            {dashboardData.map((item) => {
              const remaining = Number(item.balance || 0);
              const paidForCourse = Number(item.amountPaid || item.paidAmount || 0);
              const courseFee = Number(item.courseFee || item.fee || (paidForCourse + remaining));

              const courseTitle = item.courseTitle || item.courseName || item.course?.title || "Enrolled Course";
              const controlNo = item.controlNumber || item.controlNo || "N/A";

              return (
                <div
                  key={item.id || item.enrollmentId || item.courseId || controlNo}
                  className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-slate-300 transition"
                >
                  {/* Course Title & Control Number Info (Full width on mobile, no truncation) */}
                  <div className="w-full sm:flex-1 sm:min-w-0">
                    <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                      {item.courseCode || "COURSE"}
                    </p>
                    <h3 className="text-base font-bold text-slate-900 leading-snug sm:truncate">
                      {courseTitle}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Control No:{" "}
                      <span className="font-mono font-semibold text-slate-700 select-all">
                        {controlNo}
                      </span>
                    </p>
                  </div>

                  {/* Financial Breakdown Grid (Stacks below title on mobile, shifts right on desktop) */}
                  <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0 sm:flex sm:items-center sm:gap-6 shrink-0">
                    <div className="bg-slate-50/80 p-2 sm:p-0 rounded-xl sm:bg-transparent text-center sm:text-left">
                      <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase sm:normal-case">Total Fee</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">{formatMoney(courseFee)}</p>
                    </div>

                    <div className="bg-emerald-50/50 p-2 sm:p-0 rounded-xl sm:bg-transparent text-center sm:text-left">
                      <p className="text-[10px] sm:text-[11px] font-medium text-emerald-800/60 uppercase sm:normal-case">Paid</p>
                      <p className="text-xs sm:text-sm font-bold text-emerald-700">{formatMoney(paidForCourse)}</p>
                    </div>

                    <div className="bg-amber-50/50 p-2 sm:p-0 rounded-xl sm:bg-transparent text-center sm:text-left">
                      <p className="text-[10px] sm:text-[11px] font-medium text-amber-800/60 uppercase sm:normal-case">Remaining</p>
                      <p className={`text-xs sm:text-sm font-bold ${remaining > 0 ? "text-amber-800" : "text-slate-700"}`}>
                        {formatMoney(remaining)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}