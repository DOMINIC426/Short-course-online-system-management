import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import PasswordInput from "../../components/shared/PasswordInput.jsx";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { resetPassword } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError("This reset link is invalid or has expired.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <section className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Invalid reset link</h1>
        <p className="mt-4 text-sm text-slate-600">
          This link is missing or invalid. Please request a new one.
        </p>
        <Link to="/forgot-password" className="mt-6 inline-block text-sm font-semibold text-udom-primary hover:underline">
          Request new link
        </Link>
      </section>
    );
  }

  if (done) {
    return (
      <section className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Password updated</h1>
        <p className="mt-4 text-sm text-slate-600">
          You can now sign in with your new password.
        </p>
        <Link to="/login" className="mt-6 inline-block rounded-md bg-udom-primary px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95">
          Go to sign in
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Set a new password</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <PasswordInput
          id="password"
          label="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordInput
          id="confirmPassword"
          label="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-udom-primary px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </section>
  );
}