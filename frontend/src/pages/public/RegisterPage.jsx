import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import PasswordInput from "../../components/shared/PasswordInput.jsx";
import { getApiErrorMessage } from "../../api/backendClient.js";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      setIsSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const backendMessage = getApiErrorMessage(
        err,
        "Could not create account. Please check your details and try again."
      );
      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Create your student account
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Fill in your details below to get started.
        </p>

        {/* Inline Success Popup Alert Banner */}
        {isSuccess && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 transition-all animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-900 text-sm">
                Account created successfully!
              </p>
              <p className="mt-0.5 text-emerald-700">
                We are redirecting you to the login page...
              </p>
            </div>
          </div>
        )}

        {/* Inline Error Alert Banner */}
        {error && !isSuccess && (
          <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-800 transition-all">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              className="rounded p-1 text-slate-400 hover:bg-black/5 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600"
              >
                First name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isSuccess}
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 transition focus:border-[#0b4d94] focus:outline-none focus:ring-1 focus:ring-[#0b4d94] disabled:bg-slate-100 disabled:opacity-70"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600"
              >
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isSuccess}
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 transition focus:border-[#0b4d94] focus:outline-none focus:ring-1 focus:ring-[#0b4d94] disabled:bg-slate-100 disabled:opacity-70"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSuccess}
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 transition focus:border-[#0b4d94] focus:outline-none focus:ring-1 focus:ring-[#0b4d94] disabled:bg-slate-100 disabled:opacity-70"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSuccess}
              required
              placeholder="e.g. 0712345678"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition focus:border-[#0b4d94] focus:outline-none focus:ring-1 focus:ring-[#0b4d94] disabled:bg-slate-100 disabled:opacity-70"
            />
          </div>

          <PasswordInput
            id="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showStrength={true}
            disabled={isSuccess}
          />

          <PasswordInput
            id="confirmPassword"
            label="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSuccess}
          />

          <button
            type="submit"
            disabled={loading || isSuccess}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b4d94] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#083b72] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : isSuccess ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Redirecting...</span>
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#0b4d94] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}