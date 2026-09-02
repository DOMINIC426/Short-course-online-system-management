import React, { useEffect, useState } from "react";
import { BookOpen, Users, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { instructorApi } from "../../api/instructorApi";

export default function InstructorDashboardPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    instructorApi.getAssignedCourses().then((data) => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-4 text-slate-500">Loading dashboard...</div>;

  const totalStudents = courses.reduce((acc, c) => acc + c.totalEnrolled, 0);
  const activeCourses = courses.filter((c) => c.status === "ONGOING").length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          DASHBOARD OVERVIEW
        </p>
        
       
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-white rounded-xl border border-slate-200 flex items-center gap-4 shadow-xs">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Assigned Courses</p>
            <h3 className="text-2xl font-bold text-slate-900">{courses.length}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{activeCourses} Active / Ongoing</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 flex items-center gap-4 shadow-xs">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Enrolled Students</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalStudents}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Across all assigned courses</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 flex items-center gap-4 shadow-xs">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Pending Eligibility Actions</p>
            <h3 className="text-2xl font-bold text-slate-900">4</h3>
            <p className="text-xs text-slate-400 mt-0.5">Students awaiting certificate review</p>
          </div>
        </div>
      </div>

      {/* Quick Course Progress Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">My Assigned Courses</h2>
          <Link
            to="/instructor/courses"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View all courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {course.code}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      course.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{course.title}</h3>
                <p className="text-xs text-slate-500 mt-1">Venue: {course.venue}</p>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-500 font-medium mb-1">
                    <span>Progress</span>
                    <span>{course.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${course.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{course.totalEnrolled} Students</span>
                <Link
                  to={`/instructor/courses`}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Manage Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}