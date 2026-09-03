import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CourseCard from "../../components/public/CourseCard.jsx";
import { getCourses } from "../../api/marketApi.js";

export default function CoursesPage() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const data = await getCourses();
        const courseList = Array.isArray(data) ? data : data?.data || [];
        setCourses(courseList);
      } catch (err) {
        console.error("Failed to fetch public courses:", err);
        setError("Failed to load available courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const title = course.title || course.courseName || "";
    return title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">
          Short courses
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          Browse available courses
        </h1>
        {search && (
          <p className="mt-3 text-sm text-slate-600">
            Showing results for "{search}"
          </p>
        )}
      </div>

      {loading ? (
        <div className="mt-12 text-center text-sm font-medium text-slate-500">
          Loading courses...
        </div>
      ) : error ? (
        <div className="mt-10 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-sm text-slate-500">
          No courses found matching your search.
        </p>
      )}
    </section>
  );
}