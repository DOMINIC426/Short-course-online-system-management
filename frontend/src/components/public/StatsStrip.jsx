// src/components/StatsStrip.jsx
import { STATS } from "../../data/homeData";

export default function StatsStrip() {
  return (
    <section className="border-b border-gray-200 bg-white">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-6 py-10 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <dt className="sr-only">{stat.label}</dt>
            <dd className="text-3xl font-bold text-udom-primary">
              {stat.value}
            </dd>
            <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">
              {stat.label}
            </p>
          </div>
        ))}
      </dl>
    </section>
  );
}
