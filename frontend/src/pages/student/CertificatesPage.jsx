import { Award } from "lucide-react";
import { MY_CERTIFICATES } from "../../data/certificatesData.js";

const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700",
  ELIGIBLE: "bg-emerald-50 text-emerald-700",
  NOT_ELIGIBLE: "bg-red-50 text-red-700",
  ISSUED: "bg-blue-50 text-blue-700",
};

function formatStatus(status) {
  return status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
}

export default function CertificatesPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">
        Completion records
      </p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Certificate status</h1>
      <p className="mt-2 text-sm text-slate-600">
        Check your certificate eligibility for each enrolled course.
      </p>

      {MY_CERTIFICATES.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <Award className="mx-auto h-10 w-10 text-slate-300" strokeWidth={1.5} />
          <p className="mt-4 text-sm font-semibold text-slate-700">No certificate records yet</p>
          <p className="mt-1 text-sm text-slate-500">Certificate records appear after you enroll in a course.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {MY_CERTIFICATES.map((certificate) => (
            <article key={certificate.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Award className="mt-0.5 h-5 w-5 flex-shrink-0 text-udom-primary" strokeWidth={1.8} />
                  <div>
                    <p className="font-semibold text-slate-900">{certificate.courseName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{certificate.intakeName}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[certificate.status] || "bg-slate-100 text-slate-600"}`}>
                  {formatStatus(certificate.status)}
                </span>
              </div>
              <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">{certificate.reason}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
