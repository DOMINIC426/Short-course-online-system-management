// src/components/BackendStatus.jsx
import { useEffect, useState } from "react";
import { fetchBackendHealth } from "../api/backendClient";

export default function BackendStatus() {
  const [state, setState] = useState({ loading: true, status: null, error: null });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchBackendHealth();
        if (!cancelled) {
          setState({ loading: false, status: data.status, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ loading: false, status: null, error: error.message });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!import.meta.env.DEV) return null;

  const dotColour = state.loading
    ? "bg-gray-400"
    : state.status === "UP"
    ? "bg-green-500"
    : "bg-red-500";

  const text = state.loading
    ? "Checking backend..."
    : state.status === "UP"
    ? "Backend healthy (UP)"
    : `Backend unreachable: ${state.error}`;

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <p className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
        <span className={`h-2 w-2 rounded-full ${dotColour}`} />
        {text}
      </p>
    </div>
  );
}
