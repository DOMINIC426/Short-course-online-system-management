import { useEffect, useState } from 'react';
import { fetchBackendHealth } from '../api/backendClient.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function HomePage() {
  const [backendStatus, setBackendStatus] = useState('Unavailable');

  useEffect(() => {
    let active = true;

    fetchBackendHealth()
      .then(() => {
        if (active) {
          setBackendStatus('Connected');
        }
      })
      .catch(() => {
        if (active) {
          setBackendStatus('Unavailable');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      {/* Navigation Bar at the top */}
      <nav
        className="flex items-center justify-between px-6 py-4 text-white"
        style={{ backgroundColor: 'var(--udom-primary)' }}
      >
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold leading-tight">University of Dodoma</p>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <a href="/" className="hover:underline">Home</a>
          <a href="/courses" className="hover:underline">Courses</a>
          <a href="/login" className="hover:underline">Log in</a>
        </div>
      </nav>
      {/* End of Navigation Bar at the top */}
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-12">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Short Course Management System
          </p>
          <h1 className="text-4xl font-bold tracking-normal sm:text-5xl">
            SCMS Frontend is Running 
          </h1>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-600">Frontend</p>
              <p className="mt-2 text-xl font-semibold text-emerald-700">Running</p>
            </div>
            <div className="rounded border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-zinc-600">Backend Status</p>
              <div className="mt-3">
                <StatusBadge status={backendStatus} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
