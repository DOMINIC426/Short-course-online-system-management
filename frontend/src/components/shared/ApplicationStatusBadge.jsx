const STATUS_STYLES = {
  APPROVED: "bg-emerald-50 text-emerald-700",
  SUBMITTED: "bg-blue-50 text-blue-700",
  WAITLISTED: "bg-amber-50 text-amber-700",
  REJECTED: "bg-red-50 text-red-700",
  REQUIRES_CORRECTION: "bg-orange-50 text-udom-accent",
};

function formatStatus(status) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export default function ApplicationStatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-slate-100 text-slate-700";
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {formatStatus(status)}
    </span>
  );
}