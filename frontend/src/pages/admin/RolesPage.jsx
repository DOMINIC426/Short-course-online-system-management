import { useEffect, useState } from "react";
import { api } from "../../api/backendClient.js";
import {
  ShieldCheck,
  RefreshCw,
  Search,
  Users,
  ChevronRight,
} from "lucide-react";

const ROLE_DESCRIPTIONS = {
  ADMIN: "Full system administration and management access.",
  COORDINATOR: "Manages courses, students, instructors and academic coordination.",
  INSTRUCTOR: "Manages teaching activities, attendance and course-related tasks.",
  STUDENT: "Accesses courses, applications, payments and student services.",
  MARKETING_OFFICER: "Manages marketing activities and promotes available courses.",
};

function formatRoleName(role) {
  return role
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getRoleDescription(role, description) {
  return description || ROLE_DESCRIPTIONS[role] || "System-defined user role.";
}

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadRoles() {
    try {
      setLoading(true);
      setError("");

      const [rolesResponse, usersResponse] = await Promise.all([
        api.get("/api/v1/admin/roles"),
        api.get("/api/v1/admin/users"),
      ]);

      setRoles(rolesResponse.data || []);
      setUsers(usersResponse.data || []);
    } catch (err) {
      console.error("Failed to load roles:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load system roles."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoles();
  }, []);

  const filteredRoles = roles.filter((role) => {
    const roleName = role.role || role.name || "";

    return (
      formatRoleName(roleName)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      roleName.toLowerCase().includes(search.toLowerCase())
    );
  });

  function getUserCount(roleName) {
    return users.filter((user) => user.role === roleName).length;
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-7 w-7 animate-spin text-udom-primary" />
          <p className="mt-3 text-sm font-medium text-slate-600">
            Loading system roles...
          </p>
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
            Roles
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage the system roles available in SCMS.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRoles}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            {error}
          </p>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search roles..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-udom-primary focus:ring-2 focus:ring-udom-primary/10"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-udom-primary/10 p-2.5">
              <ShieldCheck className="h-5 w-5 text-udom-primary" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                System Roles
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {roles.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-udom-primary/10 p-2.5">
              <Users className="h-5 w-5 text-udom-primary" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Assigned Users
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {users.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Roles */}
      <section>
        <div className="mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Available Roles
          </h2>
        </div>

        {filteredRoles.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <ShieldCheck className="mx-auto h-10 w-10 text-slate-300" />

            <p className="mt-3 font-medium text-slate-700">
              No roles found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredRoles.map((role) => {
              const roleName = role.role || role.name;

              return (
                <div
                  key={roleName}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-lg bg-udom-primary/10 p-2.5">
                      <ShieldCheck className="h-5 w-5 text-udom-primary" />
                    </div>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {getUserCount(roleName)} users
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-900">
                    {formatRoleName(roleName)}
                  </h3>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
                    {getRoleDescription(
                      roleName,
                      role.description
                    )}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {roleName}
                    </span>

                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}