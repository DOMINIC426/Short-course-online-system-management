import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Loader2 } from "lucide-react";
import ApplicationStatusBadge from "../../components/shared/ApplicationStatusBadge.jsx";
import { api } from "../../api/backendClient.js";

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyApplications() {
      try {
        setLoading(true);
        // Call backending API endpoint to get current student's enrollments/applications
        const res = await api.get("/api/v1/student/enrollments");
        if (Array.isArray(res.data)) {
          setApplications(res.data);
        }
      } catch (err) {
        console.warn("Failed to fetch applications from database:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMyApplications();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">
        Registration &amp; enrollment
      </p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
        My applications
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Track the status of every course application you've submitted.
      </p>

      {loading ? (
        <div className="mt-12 flex flex-col items-center justify-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-udom-primary" />
          <p className="mt-2 text-sm text-slate-500">Loading your applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-300" strokeWidth={1.5} />
          <p className="mt-4 text-sm font-semibold text-slate-700">No applications yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Browse courses and apply to get started.
          </p>
          <Link
            to="/courses"
            className="mt-5 inline-block rounded-md bg-udom-primary px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95"
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Application</th>
                <th className="hidden px-5 py-3 sm:table-cell">Submitted</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={app.enrollmentId || app.id}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {app.courseTitle || app.title || "Course Application"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      ID: #{app.enrollmentId || app.id} 
                      {app.controlNumber ? ` · Control No: ${app.controlNumber}` : ""}
                    </p>
                    {app.enrollmentStatus === "REJECTED" && app.rejectionReason && (
                      <p className="mt-1 text-xs text-red-600">Reason: {app.rejectionReason}</p>
                    )}
                  </td>
                  <td className="hidden px-5 py-4 text-slate-600 sm:table-cell">
                    {formatDate(app.registrationDate || app.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <ApplicationStatusBadge status={app.enrollmentStatus || app.status || "PENDING"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}