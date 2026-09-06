import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api/auth.js"; // Standardized API module for password reset calls

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Workflow step tracker:
  // 1: Request OTP code via Email
  // 2: Enter 6-digit OTP code
  // 3: Input new password & confirmation
  // 4: Confirmation / Redirect screen
  const [step, setStep] = useState(1);

  // Form input field states
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading indicator state
  const [loading, setLoading] = useState(false);

  // Transient feedback banner messages
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  // Automatically auto-dismiss error alerts after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Automatically auto-dismiss info alerts after 5 seconds
  useEffect(() => {
    if (infoMessage) {
      const timer = setTimeout(() => {
        setInfoMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [infoMessage]);

  const triggerError = (msg) => {
    setErrorMessage(msg);
  };

  const triggerInfo = (msg) => {
    setInfoMessage(msg);
  };

  /**
   * STEP 1 HANDLER: Send OTP verification code to registered email
   */
  async function handleRequestCode(event) {
    event.preventDefault();
    setErrorMessage("");
    setInfoMessage("");

    if (!email || !email.includes("@")) {
      triggerError("Please enter a valid registered email address.");
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.requestResetCode(email);

      triggerInfo(
        response.data?.message ||
          "A verification code has been sent to your email. Please check your inbox."
      );

      setStep(2);
    } catch (err) {
      triggerError(
        err.response?.data?.message ||
          "Could not send reset code. Please double-check your email and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * STEP 2 HANDLER: Verify 6-digit OTP code
   */
  async function handleVerifyOtp(event) {
    event.preventDefault();
    setErrorMessage("");
    setInfoMessage("");

    const cleanedCode = otpCode.trim();

    if (!cleanedCode || cleanedCode.length !== 6) {
      triggerError("Please enter a valid 6-digit numeric verification code.");
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.verifyOtpCode(email, cleanedCode);

      const token = response.data?.resetToken;
      if (!token) {
        throw new Error("Reset token missing from server response.");
      }

      setResetToken(token);
      triggerInfo("Code verified successfully. Please enter your new password.");

      setStep(3);
    } catch (err) {
      triggerError(
        err.response?.data?.message ||
          "The verification code is incorrect or has expired. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  /**
   * STEP 3 HANDLER: Update password using reset token
   */
  async function handleResetPassword(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!newPassword || !confirmPassword) {
      triggerError("Both password fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      triggerError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      triggerError("Passwords do not match. Please verify and retype.");
      return;
    }

    try {
      setLoading(true);
      await authApi.completePasswordReset(
        email,
        resetToken,
        newPassword,
        confirmPassword
      );

      setResetToken("");
      setStep(4);
    } catch (err) {
      triggerError(
        err.response?.data?.message ||
          "Your reset session expired. Please request a new verification code."
      );
    } finally {
      setLoading(false);
    }
  }

  const isLengthValid = newPassword.length >= 8;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      {/* Outer Card Container */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 transition-all duration-300">
        
        {/* Card Header & Professional Icons */}
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 bg-blue-50 text-udom-primary rounded-2xl flex items-center justify-center mb-3 border border-blue-100/60 shadow-sm">
            {step === 1 && (
              <svg className="w-7 h-7 text-udom-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 0121 9z" />
              </svg>
            )}
            {step === 2 && (
              <svg className="w-7 h-7 text-udom-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
            {step === 3 && (
              <svg className="w-7 h-7 text-udom-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
            {step === 4 && (
              <svg className="w-7 h-7 text-udom-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {step === 1 && "Reset your password"}
            {step === 2 && "Enter verification code"}
            {step === 3 && "Create new password"}
            {step === 4 && "Password reset complete"}
          </h1>

          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            {step === 1 && "Enter your registered email address below to receive an OTP code."}
            {step === 2 && `We sent a 6-digit code to ${email}. Check your inbox.`}
            {step === 3 && "Enter and confirm your new password below."}
            {step === 4 && "Your password has been reset successfully. You can now log in."}
          </p>
        </div>

        {/* Transient Popup Alert Banners */}
        <div className="space-y-3 mb-4">
          {errorMessage && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in transition-all">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage("")} className="text-red-400 hover:text-red-600 font-bold ml-2">
                &times;
              </button>
            </div>
          )}

          {infoMessage && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm animate-fade-in transition-all">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{infoMessage}</span>
              </div>
              <button onClick={() => setInfoMessage("")} className="text-emerald-500 hover:text-emerald-700 font-bold ml-2">
                &times;
              </button>
            </div>
          )}
        </div>

        {/* STEP 1 FORM: Email Entry */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-udom-accent focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-udom-primary px-4 py-3 text-sm font-semibold text-white shadow-md hover:brightness-95 active:scale-[0.99] disabled:opacity-60 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Sending code...</span>
                </>
              ) : (
                <span>Send Verification Code</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 2 FORM: OTP Code Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label htmlFor="otpCode" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 text-center">
                6-Digit OTP Code
              </label>
              <input
                id="otpCode"
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                required
                placeholder="123456"
                className="w-full text-center text-2xl font-mono tracking-widest rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-udom-accent focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-udom-primary px-4 py-3 text-sm font-semibold text-white shadow-md hover:brightness-95 active:scale-[0.99] disabled:opacity-60 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify Code</span>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleRequestCode}
                disabled={loading}
                className="text-xs font-semibold text-udom-primary hover:underline disabled:opacity-50"
              >
                Didn't receive code? Resend
              </button>
            </div>
          </form>
        )}

        {/* STEP 3 FORM: Password Reset with Live Counter */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="newPassword" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  New Password
                </label>
                {/* Character Counter Badge */}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md transition-colors ${
                  isLengthValid ? "bg-blue-50 text-udom-primary font-semibold" : "bg-slate-100 text-slate-500"
                }`}>
                  {newPassword.length}/8
                </span>
              </div>

              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-udom-accent focus:border-transparent transition"
              />

              {/* Dynamic Progress Bar Indicator */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    isLengthValid ? "bg-udom-primary" : "bg-amber-400"
                  }`}
                  style={{ width: `${Math.min((newPassword.length / 8) * 100, 100)}%` }}
                />
              </div>

              {/* Requirement Text */}
              <p className="text-xs text-slate-400 mt-1.5 flex items-center space-x-1">
                <span>Must be at least 8 characters long.</span>
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-udom-accent focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-udom-primary px-4 py-3 text-sm font-semibold text-white shadow-md hover:brightness-95 active:scale-[0.99] disabled:opacity-60 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Updating...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 4: Success Screen */}
        {step === 4 && (
          <div className="space-y-4 text-center">
            <button
              onClick={() => navigate("/login")}
              className="w-full rounded-xl bg-udom-primary px-4 py-3 text-sm font-semibold text-white shadow-md hover:brightness-95 active:scale-[0.99] transition-all"
            >
              Proceed to Sign In
            </button>
          </div>
        )}

        {/* Card Footer Link */}
        {step !== 4 && (
          <div className="mt-8 pt-4 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-500 hover:text-udom-primary transition-colors"
            >
              &larr; Back to sign in
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}