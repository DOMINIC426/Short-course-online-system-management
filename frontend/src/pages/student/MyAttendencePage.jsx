import { MY_ATTENDANCE } from "../../data/attendenceData.js";
import AttendanceStatusBadge from "../../components/student/AttendenceStatusBadge.jsx";
import { CalendarCheck } from "lucide-react";

function calculatePercentage(sessions) {
  if (sessions.length === 0) return 0;
  // Present and Late both count as attended; Excused is neutral; Absent counts against.
  const attended = sessions.filter((s) => s.status === "PRESENT" || s.status === "LATE").length;
  const countable = sessions.filter((s) => s.status !== "EXCUSED").length;
  if (countable === 0) return 100;
  return Math.round((attended / countable) * 100);
}

export default function MyAttendancePage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">
        Attendance management
      </p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">My attendance</h1>
      <p className="mt-2 text-sm text-slate-600">
        Your attendance record for each course you're enrolled in.
      </p>

      {MY_ATTENDANCE.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <CalendarCheck className="mx-auto h-10 w-10 text-slate-300" strokeWidth={1.5} />
          <p className="mt-4 text-sm font-semibold text-slate-700">No attendance records yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Records appear once your enrolled course sessions begin.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {MY_ATTENDANCE.map((course) => {
            const percentage = calculatePercentage(course.sessions);
            const isLow = percentage < 80;

            return (
              <div key={course.intakeId} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
                  <div>
                    <p className="font-semibold text-slate-900">{course.courseName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{course.intakeName}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${isLow ? "text-red-600" : "text-emerald-600"}`}>
                      {percentage}%
                    </p>
                    <p className="text-xs text-slate-500">Attendance rate</p>
                  </div>
                </div>

                {isLow && (
                  <div className="bg-red-50 px-5 py-2 text-xs font-medium text-red-700">
                    Your attendance is below the required threshold for certification.
                  </div>
                )}

                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-2">Session</th>
                      <th className="hidden px-5 py-2 sm:table-cell">Date</th>
                      <th className="px-5 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {course.sessions.map((session) => (
                      <tr key={session.id}>
                        <td className="px-5 py-3 text-slate-800">{session.topic}</td>
                        <td className="hidden px-5 py-3 text-slate-600 sm:table-cell">{session.date}</td>
                        <td className="px-5 py-3">
                          <AttendanceStatusBadge status={session.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}