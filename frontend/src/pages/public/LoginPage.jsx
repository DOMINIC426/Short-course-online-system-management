import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import PasswordInput from "../../components/shared/PasswordInput.jsx";

function redirectPathForRole(role) {
  switch (role) {
    case "STUDENT":
      return "/dashboard";
    case "INSTRUCTOR":
      return "/instructor/dashboard";
    case "MARKETING_OFFICER":
    case "MARKET_OFFICER":
    case "MARKET":
      return "/market/dashboard"; // Added leading slash '/'
    default:
      return "/dashboard";
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      navigate(redirectPathForRole(loggedInUser.role));
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Sign in to your account</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-udom-accent"
          />
        </div>

        <PasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-udom-primary px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-3 text-center text-sm">
        <Link to="/forgot-password" className="font-medium text-udom-primary hover:underline">
          Forgot password?
        </Link>
      </p>

      <p className="mt-4 text-center text-sm text-slate-600">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-udom-primary hover:underline">
          Create one
        </Link>
      </p>
    </section>
  );
}