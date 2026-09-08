const STYLES = {
  PAID: "bg-emerald-50 text-emerald-700",
  PARTIALLY_PAID: "bg-amber-50 text-amber-700",
  UNPAID: "bg-red-50 text-red-700",
};

function formatStatus(status) {
  return status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export default function PaymentStatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STYLES[status] || "bg-slate-100 text-slate-700"}`}>
      {formatStatus(status)}
    </span>
  );
}