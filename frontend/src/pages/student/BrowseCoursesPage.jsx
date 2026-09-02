import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search, Loader2, Calendar, MapPin, Tag } from "lucide-react";
import { api } from "../../api/backendClient.js";

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function BrowseCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const res = await api.get("/api/v1/student/courses/public");
        
        if (Array.isArray(res.data?.content)) {
          setCourses(res.data.content);
        } else if (Array.isArray(res.data)) {
          setCourses(res.data);
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) =>
    (course.title || course.courseName || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-[1360px]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0b4d94]">
            Catalog
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Browse Courses
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Explore available short courses and apply directly from your dashboard.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-sm text-slate-800 transition focus:border-[#0b4d94] focus:outline-none focus:ring-1 focus:ring-[#0b4d94]"
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-16 flex flex-col items-center justify-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-[#0b4d94]" />
          <p className="mt-2 text-sm text-slate-500">Loading courses catalog...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300" strokeWidth={1.5} />
          <h3 className="mt-4 text-lg font-bold text-slate-800">No courses available</h3>
          <p className="mt-1 text-sm text-slate-500">
            {search ? "No courses matching your search term." : "There are currently no active course intakes."}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#0b4d94]">
                    <Tag className="h-3 w-3" />
                    {course.categoryName || "General"}
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-400">
                    {course.courseCode}
                  </span>
                </div>

                <h2 className="mt-4 text-xl font-bold text-slate-900">
                  {course.title || course.courseName}
                </h2>

                <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                  {course.description || "No description available for this course."}
                </p>

                <div className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  {course.startDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>
                        {formatDate(course.startDate)} - {formatDate(course.endDate)}
                      </span>
                    </div>
                  )}
                  {course.venueName && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{course.venueName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Fee</p>
                  <p className="text-base font-bold text-slate-900">
                    TZS {Number(course.courseFee || 0).toLocaleString()}
                  </p>
                </div>
                <Link
                  to={`/intakes/${course.id}/apply`}
                  className="rounded-xl bg-[#f7941d] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}