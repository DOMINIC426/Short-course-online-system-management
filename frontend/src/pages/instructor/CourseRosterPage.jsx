import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MY_COURSES, STUDENTS_BY_INTAKE } from "../../data/instructorData.js";
import PaymentStatusBadge from "../../components/instructor/PaymentStatusBadge.jsx";
import { Search } from "lucide-react";

export default function CourseRosterPage() {
  const { intakeId } = useParams();
  const course = MY_COURSES.find((c) => String(c.intakeId) === intakeId);
  const students = STUDENTS_BY_INTAKE[intakeId] || [];

  const [query, setQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesQuery =
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(query.toLowerCase()) ||
        s.email.toLowerCase().includes(query.toLowerCase());
      const matchesPayment = paymentFilter === "ALL" || s.paymentStatus === paymentFilter;
      return matchesQuery && matchesPayment;
    });
  }, [students, query, paymentFilter]);

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">Course not found</h1>
        <Link to="/instructor/dashboard" className="mt-4 inline-block text-sm font-semibold text-udom-primary hover:underline">
          ← Back to my courses
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <Link to="/instructor/dashboard" className="text-sm font-semibold text-udom-primary hover:underline">
        ← Back to my courses
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">{course.courseName}</h1>
      <p className="mt-1 text-sm text-slate-500">{course.intakeName} &middot; Registered students</p>

      {/* Search + filter */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-udom-accent"
          />
        </div>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-udom-accent"
        >
          <option value="ALL">All payment statuses</option>
          <option value="PAID">Paid</option>
          <option value="PARTIALLY_PAID">Partially paid</option>
          <option value="UNPAID">Unpaid</option>
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Student</th>
              <th className="hidden px-5 py-3 sm:table-cell">Registered</th>
              <th className="px-5 py-3">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((student) => (
              <tr key={student.id} className="cursor-pointer hover:bg-slate-50">
                <td className="px-5 py-4">
                  <Link to={`/instructor/students/${student.id}`} className="font-semibold text-slate-900 hover:text-udom-primary">
                    {student.firstName} {student.lastName}
                  </Link>
                  <p className="mt-0.5 text-xs text-slate-500">{student.email}</p>
                </td>
                <td className="hidden px-5 py-4 text-slate-600 sm:table-cell">{student.registeredOn}</td>
                <td className="px-5 py-4">
                  <PaymentStatusBadge status={student.paymentStatus} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-sm text-slate-500">
                  No students match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}