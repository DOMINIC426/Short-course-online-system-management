import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { CheckCircle2 } from "lucide-react";
import CountrySelect from "../../components/shared/CountrySelect.jsx";

const EDUCATION_LEVELS = [
  "Certificate",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Other",
];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [levelOfEducation, setLevelOfEducation] = useState(user?.levelOfEducation || "");
  const [nationality, setNationality] = useState(user?.nationality || "");
  const [identificationNumber, setIdentificationNumber] = useState(user?.identificationNumber || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
  event.preventDefault();
  setError("");
  setSaved(false);
  setSaving(true);
  try {
    await updateProfile({ levelOfEducation, nationality, identificationNumber });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  } catch (err) {
    setError("Could not save your profile. Please try again.");
  } finally {
    setSaving(false);
  }
}

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8 sm:py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-udom-primary">
        Student profile
      </p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">My profile</h1>
      <p className="mt-2 text-sm text-slate-600">
        This information is required before you can apply to any course.
      </p>

      {/* Read-only account info */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500">Full name</p>
            <p className="text-sm font-medium text-slate-900">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Email</p>
            <p className="text-sm font-medium text-slate-900">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Editable student details */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Student details
        </p>

        <div>
          <label htmlFor="levelOfEducation" className="block text-sm font-medium text-slate-700">
            Highest level of education
          </label>
          <select
            id="levelOfEducation"
            value={levelOfEducation}
            onChange={(e) => setLevelOfEducation(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-udom-accent"
          >
            <option value="" disabled>Select your education level</option>
            {EDUCATION_LEVELS.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div>
  <label htmlFor="nationality" className="block text-sm font-medium text-slate-700">
    Nationality
  </label>
  <div className="mt-1">
    <CountrySelect
      id="nationality"
      value={nationality}
      onChange={setNationality}
    />
  </div>
</div>

        <div>
          <label htmlFor="identificationNumber" className="block text-sm font-medium text-slate-700">
            National ID / Passport number
          </label>
          <input
            id="identificationNumber"
            type="text"
            value={identificationNumber}
            onChange={(e) => setIdentificationNumber(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-udom-accent"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {saved && (
          <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
            Profile saved successfully.
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-md bg-udom-primary px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-60 sm:w-auto"
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </div>
  );
}