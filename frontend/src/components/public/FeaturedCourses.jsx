import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CourseCard from "./CourseCard.jsx";
import { getCourses } from "../../api/marketApi.js";

export default function FeaturedCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        setLoading(true);
        const data = await getCourses();
        const courseList = Array.isArray(data) ? data : data?.data || [];
        // Display the first 3 active/visible courses on the homepage
        setCourses(courseList.slice(0, 3));
      } catch (err) {
        console.error("Failed to load featured courses:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-udom-primary">
              Featured courses
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Professional short courses for career growth
            </h2>
            <p className="mt-3 max-w-2xl text-base text-slate-600">
              Practical, industry-relevant programmes designed for working professionals,
              graduates and public-sector staff.
            </p>
          </div>
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-sm font-semibold text-udom-primary transition hover:text-udom-primary-dark"
          >
            View all courses <span aria-hidden="true">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="mt-10 text-center text-sm font-medium text-slate-500">
            Loading featured courses...
          </div>
        ) : courses.length > 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-sm text-slate-500">
            No featured courses currently available.
          </p>
        )}
      </div>
    </section>
  );
}