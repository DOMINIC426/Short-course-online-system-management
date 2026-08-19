// src/components/HowItWorks.jsx
import { STEPS } from "../../data/homeData";

export default function HowItWorks() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          How to apply
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-gray-600">
          Four stages, all handled inside your portal account.
        </p>

        <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <li key={step.number} className="text-center">
              <span
                aria-hidden="true"
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-udom-accent text-lg font-bold text-white"
              >
                {step.number}
              </span>
              <h3 className="mt-4 text-base font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
