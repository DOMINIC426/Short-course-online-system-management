const STATUS_STYLES = {
  PRESENT: "bg-emerald-50 text-emerald-700",
  LATE: "bg-amber-50 text-amber-700",
  ABSENT: "bg-red-50 text-red-700",
  EXCUSED: "bg-blue-50 text-blue-700",
};

function formatStatus(status) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function AttendanceStatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-slate-100 text-slate-700";
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {formatStatus(status)}
    </span>
  );
}