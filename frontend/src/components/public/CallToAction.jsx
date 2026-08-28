// src/components/CallToAction.jsx
import { Link } from "react-router-dom";

export default function CallToAction() {
  return (
    <section className="border-y border-gray-200 bg-gray-50 py-16">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Register once. Apply to any course, any intake.
        </h2>
        <p className="mt-3 text-sm text-gray-600">
          Creating an account takes about two minutes and costs nothing.
        </p>
        <Link
          to="/register"
          className="mt-7 inline-block rounded-md bg-udom-primary px-8 py-3 text-sm font-semibold text-white transition hover:bg-udom-primary-dark"
        >
          Create an account
        </Link>
      </div>
    </section>
  );
}
