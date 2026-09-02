import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/backendClient.js";
import {
  ClipboardList,
  RefreshCw,
  Search,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function getErrorMessage(error, fallback) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    fallback
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

function formatAction(action) {
  if (!action) return "—";

  return String(action)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  const [selectedLog, setSelectedLog] = useState(null);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  async function loadAuditLogs() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/v1/admin/audit-logs");

      setLogs(response.data || []);
      setPage(1);
    } catch (err) {
      console.error("Failed to load audit logs:", err);

      setError(
        getErrorMessage(
          err,
          "Unable to load audit logs."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const actions = useMemo(() => {
    return [
      ...new Set(
        logs
          .map((log) => log.action)
          .filter(Boolean)
      ),
    ].sort();
  }, [logs]);

  const entities = useMemo(() => {
    return [
      ...new Set(
        logs
          .map((log) => log.entity)
          .filter(Boolean)
      ),
    ].sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesSearch =
        !query ||
        String(log.userName || "")
          .toLowerCase()
          .includes(query) ||
        String(log.userId || "")
          .toLowerCase()
          .includes(query) ||
        String(log.action || "")
          .toLowerCase()
          .includes(query) ||
        String(log.entity || "")
          .toLowerCase()
          .includes(query) ||
        String(log.entityId || "")
          .toLowerCase()
          .includes(query);

      const matchesAction =
        !actionFilter ||
        log.action === actionFilter;

      const matchesEntity =
        !entityFilter ||
        log.entity === entityFilter;

      return (
        matchesSearch &&
        matchesAction &&
        matchesEntity
      );
    });
  }, [
    logs,
    search,
    actionFilter,
    entityFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLogs.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function clearFilters() {
    setSearch("");
    setActionFilter("");
    setEntityFilter("");
    setPage(1);
  }

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setPage(1);
  }

  function handleActionChange(event) {
    setActionFilter(event.target.value);
    setPage(1);
  }

  function handleEntityChange(event) {
    setEntityFilter(event.target.value);
    setPage(1);
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-7 w-7 animate-spin text-udom-primary" />

          <p className="mt-3 text-sm font-medium text-slate-600">
            Loading audit logs...
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
            Audit Logs
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor important actions and changes performed in
            the SCMS system.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAuditLogs}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-udom-primary/10 p-2.5">
              <ClipboardList className="h-5 w-5 text-udom-primary" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Log Entries
              </p>

              <p className="text-2xl font-bold text-slate-900">
                {logs.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Actions
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {actions.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Entities
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {entities.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_200px_200px_auto]">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search user, action, entity..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-udom-primary focus:ring-2 focus:ring-udom-primary/10"
            />
          </div>

          {/* Action */}
          <select
            value={actionFilter}
            onChange={handleActionChange}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-udom-primary focus:ring-2 focus:ring-udom-primary/10"
          >
            <option value="">All Actions</option>

            {actions.map((action) => (
              <option key={action} value={action}>
                {formatAction(action)}
              </option>
            ))}
          </select>

          {/* Entity */}
          <select
            value={entityFilter}
            onChange={handleEntityChange}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-udom-primary focus:ring-2 focus:ring-udom-primary/10"
          >
            <option value="">All Entities</option>

            {entities.map((entity) => (
              <option key={entity} value={entity}>
                {entity}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {filteredLogs.length === 0 ? (
          <div className="p-10 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />

            <p className="mt-3 font-medium text-slate-700">
              No audit logs found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Date & Time
                    </th>

                    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      User
                    </th>

                    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>

                    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Entity
                    </th>

                    <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Entity ID
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Details
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                        {formatDate(log.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {log.userName || "System"}
                        </p>

                        {log.userId && (
                          <p className="mt-1 text-xs text-slate-400">
                            User ID: {log.userId}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {formatAction(log.action)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {log.entity || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {log.entityId ?? "—"}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredLogs.length === 0
                    ? 0
                    : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(
                    currentPage * pageSize,
                    filteredLogs.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {filteredLogs.length}
                </span>{" "}
                logs
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <span className="px-2 text-sm font-semibold text-slate-600">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(totalPages, current + 1)
                    )
                  }
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Audit Log Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Log ID: {selectedLog.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  User
                </p>

                <p className="mt-1 font-medium text-slate-800">
                  {selectedLog.userName || "System"}
                </p>

                {selectedLog.userId && (
                  <p className="mt-1 text-xs text-slate-500">
                    User ID: {selectedLog.userId}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Date & Time
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {formatDate(selectedLog.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Action
                </p>

                <p className="mt-1 font-medium text-slate-800">
                  {formatAction(selectedLog.action)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Entity
                </p>

                <p className="mt-1 font-medium text-slate-800">
                  {selectedLog.entity || "—"}
                </p>

                {selectedLog.entityId && (
                  <p className="mt-1 text-xs text-slate-500">
                    Entity ID: {selectedLog.entityId}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Previous Value
                </p>

                <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-4 text-xs leading-5 text-slate-700">
                  {selectedLog.oldValue || "No previous value recorded."}
                </pre>
              </div>

              <div className="sm:col-span-2">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  New Value
                </p>

                <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-4 text-xs leading-5 text-slate-700">
                  {selectedLog.newValue || "No new value recorded."}
                </pre>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 p-5">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}