import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/backendClient.js";
import InvoiceStatusBadge from "../../components/student/InvoiceStatusBadge.jsx";
import { Wallet, Info, Loader2 } from "lucide-react";

function formatMoney(amount) {
  return `TZS ${Number(amount || 0).toLocaleString()}`;
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export default function MyPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      try {
        setLoading(true);
        const res = await api.get("/api/v1/student/payments");
        if (Array.isArray(res.data)) {
          setPayments(res.data);
        }
      } catch (err) {
        console.warn("Failed to load payment records:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  // Compute total amount across records
  const totalAmount = payments.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">
        Payment management
      </p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">My payments</h1>
      <p className="mt-2 text-sm text-slate-600">
        View your payment history for every course you have applied to.
      </p>

      {/* Payment Summary */}
      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
          <Wallet className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-sm text-slate-500">Total payments recorded</p>
          <p className="text-2xl font-bold text-slate-900">
            {loading ? "..." : formatMoney(totalAmount)}
          </p>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" strokeWidth={1.8} />
        <p className="text-sm text-blue-800">
          Use the control number issued when paying by bank or mobile money.
          Your balance updates once the finance office confirms your payment.
        </p>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="mt-10 flex flex-col items-center justify-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-udom-primary" />
          <p className="mt-2 text-sm text-slate-500">Loading payment history...</p>
        </div>
      ) : payments.length === 0 ? (
        /* Empty State */
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Wallet className="mx-auto h-10 w-10 text-slate-300" strokeWidth={1.5} />
          <p className="mt-4 text-sm font-semibold text-slate-700">No payment records found</p>
          <p className="mt-1 text-sm text-slate-500">
            Payment logs will appear here once you initiate payments for enrolled courses.
          </p>
          <Link
            to="/applications"
            className="mt-5 inline-block rounded-md bg-udom-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            View my applications
          </Link>
        </div>
      ) : (
        /* Payments List from API */
        <div className="mt-6 space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.paymentId || payment.enrollmentId}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {payment.courseTitle || "Course Payment"}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Control No: <span className="font-mono font-medium text-slate-700">{payment.controlNumber || "N/A"}</span>
                    {payment.transactionReference && ` • Ref: ${payment.transactionReference}`}
                  </p>
                </div>
                <InvoiceStatusBadge status={payment.paymentStatus} />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-slate-500">Date</dt>
                  <dd className="font-medium text-slate-800">{formatDate(payment.paymentDate)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Payment method</dt>
                  <dd className="font-medium text-slate-800 uppercase">
                    {(payment.paymentMethod || "N/A").replace("_", " ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">External ID</dt>
                  <dd className="font-medium text-slate-800 font-mono text-xs">
                    {payment.externalTransactionId || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Amount</dt>
                  <dd className="font-semibold text-emerald-700">
                    {formatMoney(payment.amount)}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}