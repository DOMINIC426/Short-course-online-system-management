
import { useEffect, useState } from "react";
import { api } from "../../api/backendClient.js";
import {
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  ShieldCheck,
  BriefcaseBusiness,
  Settings,
  Activity,
  RefreshCw,
} from "lucide-react";

function StatCard({ title, value, description, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value ?? 0}
          </p>

          {description && (
            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>

        <div className="rounded-lg bg-udom-primary/10 p-2.5">
          <Icon className="h-5 w-5 text-udom-primary" />
        </div>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/v1/admin/dashboard");

      setDashboard(response.data);
    } catch (err) {
      console.error("Failed to load admin dashboard:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load the administration dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-7 w-7 animate-spin text-udom-primary" />

          <p className="mt-3 text-sm font-medium text-slate-600">
            Loading administration dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-red-800">
            Dashboard unavailable
          </h2>

          <p className="mt-1 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-udom-primary px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-udom-primary">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Admin Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor users, students, system access and administration activity.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Main statistics */}
      <section>
        <div className="mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            System overview
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Users"
            value={dashboard?.totalUsers}
            description="All registered system users"
            icon={Users}
          />

          <StatCard
            title="Active Users"
            value={dashboard?.activeUsers}
            description="Currently active accounts"
            icon={UserCheck}
          />

          <StatCard
            title="Inactive Users"
            value={dashboard?.inactiveUsers}
            description="Inactive accounts"
            icon={UserX}
          />

          <StatCard
            title="Students"
            value={dashboard?.totalStudents}
            description="Registered students"
            icon={GraduationCap}
          />
        </div>
      </section>

      {/* Role statistics */}
      <section className="mt-8">
        <div className="mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            User roles
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Administrators"
            value={dashboard?.totalAdmins}
            icon={ShieldCheck}
          />

          <StatCard
            title="Coordinators"
            value={dashboard?.totalCoordinators}
            icon={BriefcaseBusiness}
          />

          <StatCard
            title="Instructors"
            value={dashboard?.totalInstructors}
            icon={GraduationCap}
          />

          <StatCard
            title="Marketing Officers"
            value={dashboard?.totalMarketingOfficers}
            icon={Users}
          />
        </div>
      </section>

      {/* System activity */}
      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Recent activity
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest actions recorded by the system
              </p>
            </div>

            <Activity className="h-5 w-5 text-udom-primary" />
          </div>

          <div className="mt-5 overflow-x-auto">
            {dashboard?.recentAuditLogs?.length ? (
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400">
                    <th className="px-3 py-3 font-semibold">
                      Action
                    </th>
                    <th className="px-3 py-3 font-semibold">
                      Entity
                    </th>
                    <th className="px-3 py-3 font-semibold">
                      User
                    </th>
                    <th className="px-3 py-3 font-semibold">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {dashboard.recentAuditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-3 py-3 text-sm font-medium text-slate-800">
                        {log.action || "—"}
                      </td>

                      <td className="px-3 py-3 text-sm text-slate-600">
                        {log.entity || "—"}
                      </td>

                      <td className="px-3 py-3 text-sm text-slate-600">
                        {log.userEmail || log.userId || "—"}
                      </td>

                      <td className="px-3 py-3 text-xs text-slate-500">
                        {formatDate(
                          log.createdAt ||
                            log.timestamp ||
                            log.created_at
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-10 text-center">
                <Activity className="mx-auto h-8 w-8 text-slate-300" />

                <p className="mt-2 text-sm font-medium text-slate-600">
                  No recent activity
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  System audit activity will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* System settings summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-udom-primary/10 p-2.5">
              <Settings className="h-5 w-5 text-udom-primary" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                System settings
              </h2>

              <p className="text-xs text-slate-500">
                Configured settings
              </p>
            </div>
          </div>

          <p className="mt-6 text-4xl font-bold text-slate-900">
            {dashboard?.totalSystemSettings ?? 0}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            settings currently configured
          </p>
        </div>
      </section>
    </div>
  );
}
