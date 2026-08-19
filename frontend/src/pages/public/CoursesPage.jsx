import { useSearchParams } from "react-router-dom";
import CourseCard from "../../components/public/CourseCard.jsx";
import { FEATURED_COURSES } from "../../data/homeData.js";

export default function CoursesPage() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const filteredCourses = FEATURED_COURSES.filter((course) =>
    course.courseName.toLowerCase().includes(search.toLowerCase())
  );

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

      {filteredCourses.length > 0 ? (
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