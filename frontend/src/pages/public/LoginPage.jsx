
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, AlertCircle, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import PasswordInput from "../../components/shared/PasswordInput.jsx";
import { getApiErrorMessage } from "../../api/backendClient.js";

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCK_DURATION_SECONDS = 5 * 60;

function loginLockStorageKey(email) {
  return `scms_login_lock_until:${email.trim().toLowerCase()}`;
}

function getStoredLockExpiry(email) {
  if (!email.trim()) return null;

  const expiresAt = Number(localStorage.getItem(loginLockStorageKey(email)));
  return Number.isFinite(expiresAt) && expiresAt > Date.now() ? expiresAt : null;
}

function formatRemainingTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function redirectPathForRole(role) {
  switch (role) {
    case "STUDENT":
      return "/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    case "COORDINATOR":
      return "/coordinator/dashboard";
    case "INSTRUCTOR":
      return "/instructor/dashboard";
    case "MARKETING_OFFICER":
    case "MARKET_OFFICER":
    case "MARKET":
      return "/market/dashboard";
    default:
      return "/login";
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockExpiresAt, setLockExpiresAt] = useState(null);
  const [remainingLockSeconds, setRemainingLockSeconds] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!lockExpiresAt) {
      setRemainingLockSeconds(0);
      return undefined;
    }

    const updateRemainingTime = () => {
      const remaining = Math.max(0, Math.ceil((lockExpiresAt - Date.now()) / 1000));
      setRemainingLockSeconds(remaining);

      if (remaining === 0) {
        localStorage.removeItem(loginLockStorageKey(email));
        setLockExpiresAt(null);
        setFailedAttempts(0);
        setError("");
      }
    };

    updateRemainingTime();
    const intervalId = window.setInterval(updateRemainingTime, 1000);
    return () => window.clearInterval(intervalId);
  }, [email, lockExpiresAt]);

  function startLockout() {
    const expiresAt = Date.now() + LOGIN_LOCK_DURATION_SECONDS * 1000;
    localStorage.setItem(loginLockStorageKey(email), String(expiresAt));
    setLockExpiresAt(expiresAt);
    setRemainingLockSeconds(LOGIN_LOCK_DURATION_SECONDS);
    setError("Too many failed login attempts. Please wait for the countdown to finish.");
  }

  function handleEmailChange(event) {
    const nextEmail = event.target.value;
    setEmail(nextEmail);
    setFailedAttempts(0);
    setLockExpiresAt(getStoredLockExpiry(nextEmail));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (remainingLockSeconds > 0) return;

    setError("");
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);
      localStorage.removeItem(loginLockStorageKey(email));
      navigate(redirectPathForRole(loggedInUser.role));
    } catch (err) {
      if (err.response?.status === 401) {
        const nextFailedAttempts = failedAttempts + 1;
        setFailedAttempts(nextFailedAttempts);

        if (nextFailedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
          startLockout();
          return;
        }
      }

      const backendMessage = getApiErrorMessage(
        err,
        "Invalid email or password. Please try again."
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
          Sign in to your account
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Enter your credentials to access your dashboard.
        </p>

        {/* Inline Error Alert Banner */}
        {error && (
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
              onChange={handleEmailChange}
              required
              disabled={remainingLockSeconds > 0}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 transition focus:border-[#0b4d94] focus:outline-none focus:ring-1 focus:ring-[#0b4d94]"
            />
          </div>


          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="mb-1.5 text-xs font-medium text-[#0b4d94] hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <PasswordInput
              id="password"
              label=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={remainingLockSeconds > 0}
            />
          </div>

          {remainingLockSeconds > 0 && (
            <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-center text-xs font-semibold text-amber-800">
              Login is temporarily locked. Try again in {formatRemainingTime(remainingLockSeconds)}.
            </p>
          )}


          <button
            type="submit"
            disabled={loading || remainingLockSeconds > 0}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b4d94] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#083b72] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : remainingLockSeconds > 0 ? (
              `Try again in ${formatRemainingTime(remainingLockSeconds)}`
            ) : (
              "Sign in"
            )}
          </button>
        </form>


        <p className="mt-6 text-center text-xs text-slate-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#0b4d94] hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>

    </section>
  );
}
