import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [status, setStatus] = useState("idle");
  const { forgotPassword } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    try {
      await forgotPassword(identifier);
      setStatus("sent");
    } catch (err) {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <section className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Check your email</h1>
        <p className="mt-4 text-sm text-slate-600">
          If an account exists for "{identifier}", we've sent instructions to reset your password.
        </p>
        <Link to="/login" className="mt-6 inline-block text-sm font-semibold text-udom-primary hover:underline">
          Back to sign in
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
      <p className="mt-2 text-sm text-slate-600">
        Enter your username or email and we'll send you instructions to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-slate-700">
            Username or email
          </label>
          <input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-udom-accent"
          />
        </div>

        {status === "error" && (
          <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-md bg-udom-primary px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
        >
          {status === "loading" ? "Sending..." : "Send reset instructions"}
        </button>
      </form>
    </section>
  );
}