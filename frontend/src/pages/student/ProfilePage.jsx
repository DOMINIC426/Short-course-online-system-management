import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { 
  User, 
  Mail, 
  GraduationCap, 
  Globe, 
  IdCard, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X, 
  ShieldCheck 
} from "lucide-react";
import CountrySelect from "../../components/shared/CountrySelect.jsx";

/**
 * Supported higher education qualification levels for student verification.
 */
const EDUCATION_LEVELS = [
  "Certificate",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Other",
];

/**
 * ProfilePage Component
 * - Displays read-only user account metadata and editable personal details.
 * - Enforces profile completeness required before short course enrollment.
 * - Features auto-dismissing feedback banners for form submission feedback.
 */
export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  // Controlled Form States initialized with existing user profile state
  const [levelOfEducation, setLevelOfEducation] = useState(user?.levelOfEducation || "");
  const [nationality, setNationality] = useState(user?.nationality || "");
  const [identificationNumber, setIdentificationNumber] = useState(user?.identificationNumber || "");

  // Request Execution and User Feedback Notification States
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  /**
   * Automatically clears success notification popups after a set duration (4 seconds).
   */
  useEffect(() => {
    let timer;
    if (saved) {
      timer = setTimeout(() => {
        setSaved(false);
      }, 4000);
    }
    return () => clearTimeout(timer); // Cleanup timer on unmount or state change
  }, [saved]);

  /**
   * Handles profile update form submission.
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);

    try {
      await updateProfile({ levelOfEducation, nationality, identificationNumber });
      setSaved(true);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err?.response?.data?.message || "Could not save your profile updates. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 font-sans antialiased">
      
      {/* ----------------------------------------------------------------- */}
      {/* Page Header                                                       */}
      {/* ----------------------------------------------------------------- */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0b4d94]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#0b4d94]" />
          <span>Student Account Verification</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Your details are required to issue valid academic certificates and process course registrations.
        </p>
      </div>

      <div className="space-y-6">

        {/* ----------------------------------------------------------------- */}
        {/* Card 1: Read-Only System Account Information                       */}
        {/* ----------------------------------------------------------------- */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0b4d94]">
              <User className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              System Credentials
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Full Name Display */}
            <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-slate-50/50 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Full Name</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900 truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "N/A"}
                </p>
              </div>
            </div>

            {/* Email Address Display */}
            <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-slate-50/50 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Mail className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email Address</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900 truncate">
                  {user?.email || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------------- */}
        {/* Card 2: Editable Student Profile Form                             */}
        {/* ----------------------------------------------------------------- */}
        <form 
          onSubmit={handleSubmit} 
          className="relative rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs"
        >
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Academic and Identity Details
            </h2>
          </div>

          {/* Dynamic Feedback Popups inside the Form Card */}
          <div className="mt-4 space-y-3">
            {/* Success Toast Banner */}
            {saved && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/90 p-4 text-emerald-800 shadow-xs transition-all duration-200">
                <div className="flex items-center gap-2.5 text-sm font-medium">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  <span>Your profile details have been saved successfully.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSaved(false)}
                  className="rounded-lg p-1 text-emerald-600 transition hover:bg-emerald-100"
                  aria-label="Dismiss message"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Error Toast Banner */}
            {error && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200/80 bg-rose-50/90 p-4 text-rose-800 shadow-xs transition-all duration-200">
                <div className="flex items-center gap-2.5 text-sm font-medium">
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="rounded-lg p-1 text-rose-600 transition hover:bg-rose-100"
                  aria-label="Dismiss message"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-5 space-y-5">
            
            {/* Highest Level of Education Selection */}
            <div>
              <label 
                htmlFor="levelOfEducation" 
                className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-[#0b4d94]">
                  <GraduationCap className="h-3.5 w-3.5" />
                </div>
                <span>Highest Level of Education</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative mt-2">
                <select
                  id="levelOfEducation"
                  value={levelOfEducation}
                  onChange={(e) => setLevelOfEducation(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 transition focus:border-[#0b4d94] focus:outline-none focus:ring-2 focus:ring-[#0b4d94]/20"
                >
                  <option value="" disabled>Select highest qualification</option>
                  {EDUCATION_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nationality Country Selector */}
            <div>
              <label 
                htmlFor="nationality" 
                className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                  <Globe className="h-3.5 w-3.5" />
                </div>
                <span>Nationality</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="mt-2">
                <CountrySelect
                  id="nationality"
                  value={nationality}
                  onChange={setNationality}
                />
              </div>
            </div>

            {/* National ID or Passport Number Field */}
            <div>
              <label 
                htmlFor="identificationNumber" 
                className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-50 text-purple-600">
                  <IdCard className="h-3.5 w-3.5" />
                </div>
                <span>National ID / Passport Number</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                id="identificationNumber"
                type="text"
                value={identificationNumber}
                onChange={(e) => setIdentificationNumber(e.target.value)}
                placeholder="e.g. 19950101-XXXXX-XXXXX or Passport ID"
                required
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 transition focus:border-[#0b4d94] focus:outline-none focus:ring-2 focus:ring-[#0b4d94]/20"
              />
            </div>

          </div>

          {/* Form Action Button Footer */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b4d94] px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#083b71] focus:outline-none focus:ring-2 focus:ring-[#0b4d94]/30 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}