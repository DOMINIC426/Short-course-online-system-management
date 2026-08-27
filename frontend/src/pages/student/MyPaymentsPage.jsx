import { Link } from "react-router-dom";
import { MY_INVOICES } from "../../data/paymentsData.js";
import InvoiceStatusBadge from "../../components/student/InvoiceStatusBadge.jsx";
import { Wallet, Info } from "lucide-react";

function formatMoney(amount) {
  return `TZS ${Number(amount).toLocaleString()}`;
}

export default function MyPaymentsPage() {
  const totalBalance = MY_INVOICES.reduce((sum, inv) => sum + inv.balanceAmount, 0);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">
        Payment management
      </p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">My payments</h1>
      <p className="mt-2 text-sm text-slate-600">
        View your payment history for every course you have applied to.
      </p>

      {/* Outstanding balance summary */}
      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
          <Wallet className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-sm text-slate-500">Total outstanding balance</p>
          <p className="text-2xl font-bold text-slate-900">{formatMoney(totalBalance)}</p>
        </div>
      </div>

      {/* How to pay note */}
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" strokeWidth={1.8} />
        <p className="text-sm text-blue-800">
          Use the control number issued when paying by bank or mobile money.
          Your balance updates once the finance office confirms your payment.
        </p>
      </div>

      {MY_INVOICES.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Wallet className="mx-auto h-10 w-10 text-slate-300" strokeWidth={1.5} />
          <p className="mt-4 text-sm font-semibold text-slate-700">No invoices yet</p>
          <p className="mt-1 text-sm text-slate-500">
            An invoice is created once your application is approved.
          </p>
          <Link
            to="/applications"
            className="mt-5 inline-block rounded-md bg-udom-primary px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95"
          >
            View my applications
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {MY_INVOICES.map((invoice) => (
            <div key={invoice.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{invoice.courseName}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {invoice.intakeName} &middot; {invoice.invoiceNumber}
                  </p>
                </div>
                <InvoiceStatusBadge status={invoice.status} />
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-slate-500">Due date</dt>
                  <dd className="font-medium text-slate-800">{invoice.dueDate}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Total</dt>
                  <dd className="font-medium text-slate-800">{formatMoney(invoice.totalAmount)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Paid</dt>
                  <dd className="font-medium text-emerald-700">{formatMoney(invoice.paidAmount)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Balance</dt>
                  <dd className={`font-semibold ${invoice.balanceAmount > 0 ? "text-red-600" : "text-slate-800"}`}>
                    {formatMoney(invoice.balanceAmount)}
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