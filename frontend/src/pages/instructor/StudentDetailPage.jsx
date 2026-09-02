import { useParams, Link } from "react-router-dom";
import { STUDENTS_BY_INTAKE, STUDENT_PAYMENT_HISTORY } from "../../data/instructorData.js";
import PaymentStatusBadge from "../../components/instructor/PaymentStatusBadge.jsx";

function findStudent(id) {
  for (const list of Object.values(STUDENTS_BY_INTAKE)) {
    const match = list.find((s) => String(s.id) === id);
    if (match) return match;
  }
  return null;
}

export default function StudentDetailPage() {
  const { studentId } = useParams();
  const student = findStudent(studentId);
  const history = STUDENT_PAYMENT_HISTORY[studentId] || [];

  if (!student) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">Student not found</h1>
        <Link to="/instructor/dashboard" className="mt-4 inline-block text-sm font-semibold text-udom-primary hover:underline">
          ← Back to my courses
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <button onClick={() => window.history.back()} className="text-sm font-semibold text-udom-primary hover:underline">
        ← Back
      </button>

      <h1 className="mt-4 text-2xl font-bold text-slate-900">
        {student.firstName} {student.lastName}
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <div>
          <p className="text-xs text-slate-500">Email</p>
          <p className="text-sm font-medium text-slate-900">{student.email}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Phone</p>
          <p className="text-sm font-medium text-slate-900">{student.phone}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Registered on</p>
          <p className="text-sm font-medium text-slate-900">{student.registeredOn}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Payment status</p>
          <PaymentStatusBadge status={student.paymentStatus} />
        </div>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Payment history</h2>
      {history.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No payments recorded yet.</p>
      ) : (
        <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-2">Date</th>
                <th className="px-5 py-2">Reference</th>
                <th className="px-5 py-2">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((h) => (
                <tr key={h.id}>
                  <td className="px-5 py-3 text-slate-700">{h.date}</td>
                  <td className="px-5 py-3 text-slate-700">{h.reference}</td>
                  <td className="px-5 py-3 font-medium text-slate-900">TZS {h.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}