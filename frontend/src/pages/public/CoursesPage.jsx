import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CourseCard from "../../components/public/CourseCard.jsx";

const API_URL = "http://localhost:8080/api/v1/auth/courses";

export default function CoursesPage() {
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search") || "";

  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(0);

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageSize = 5;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}?page=${page}&size=${pageSize}`
        );

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();

        setCourses(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);

      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Unable to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [page]);

  /*
   * Client-side search for the courses already returned
   * by the backend page.
   */
  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  const handlePrevious = () => {
    if (page > 0) {
      setPage((currentPage) => currentPage - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages - 1) {
      setPage((currentPage) => currentPage + 1);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">

      {/* Header */}
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">
          Short courses
        </p>

        <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          Browse available courses
        </h1>

        {search && (
          <p className="mt-3 text-sm text-slate-600">
            Showing results for "{search}"
          </p>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      )}

      {/* Courses */}
      {!loading && !error && filteredCourses.length > 0 && (
        <>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.courseCode}
                course={course}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">

            <p className="text-sm text-slate-500">
              Showing {filteredCourses.length} of {totalElements} courses
            </p>

            <div className="flex items-center gap-3">

              <button
                onClick={handlePrevious}
                disabled={page === 0}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              <span className="min-w-[100px] text-center text-sm font-semibold text-slate-700">
                Page {page + 1} of {totalPages}
              </span>

              <button
                onClick={handleNext}
                disabled={page >= totalPages - 1}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>

            </div>
          </div>
        </>
      )}

      {/* No courses */}
      {!loading && !error && filteredCourses.length === 0 && (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            No courses found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {search
              ? `No courses match "${search}".`
              : "There are currently no courses available."}
          </p>
        </div>
      )}

    </section>
  );
}