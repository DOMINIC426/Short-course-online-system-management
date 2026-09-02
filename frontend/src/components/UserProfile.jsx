import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
  ShieldCheck,
  X,
} from "lucide-react";

export default function UserProfile() {
  const { user, updateUser } = useAuth();

  // Contact Info Form States
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Separate Card Alert Notifications ({ type: 'success' | 'error', text: string })
  const [profileAlert, setProfileAlert] = useState(null);
  const [passwordAlert, setPasswordAlert] = useState(null);

  // Populate form with active user data on load
  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setPhone(user.phone || user.phoneNumber || "");
    }
  }, [user]);

  // Auto-dismiss Profile Alert after 5 seconds
  useEffect(() => {
    if (profileAlert) {
      const timer = setTimeout(() => setProfileAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [profileAlert]);

  // Auto-dismiss Password Alert after 5 seconds
  useEffect(() => {
    if (passwordAlert) {
      const timer = setTimeout(() => setPasswordAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [passwordAlert]);

  // Handler: Update Email and Phone Number in Database
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileAlert(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile details.");
      }

      const updatedUserData = await response.json();

      if (updateUser) {
        updateUser(updatedUserData);
      }

      setProfileAlert({
        type: "success",
        text: "Your contact details have been updated successfully.",
      });
    } catch (error) {
      setProfileAlert({
        type: "error",
        text: error.message || "Something went wrong while saving profile details.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handler: Update Password in Database
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordAlert(null);

    if (newPassword !== confirmPassword) {
      setPasswordAlert({
        type: "error",
        text: "New password and confirmation password do not match.",
      });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordAlert({
        type: "error",
        text: "New password must be at least 6 characters long.",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordAlert({
        type: "success",
        text: "Your password has been changed successfully.",
      });
    } catch (error) {
      setPasswordAlert({
        type: "error",
        text: error.message || "Failed to update password. Check your current password.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const roleFormatted = (user?.role || "User").replace("_", " ").toUpperCase();
  const displayName = user && user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user?.email || "User Profile";

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "US";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header Banner Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0b4d94] text-2xl font-bold text-white shadow-md">
                {initials}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
                <span className="h-2 w-2 rounded-full bg-white" />
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{displayName}</h1>
              <p className="text-sm font-medium text-slate-500">{user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#0b4d94]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{roleFormatted}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Card 1: Contact Information Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0b4d94]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Personal Info</h2>
              <p className="text-xs text-slate-500">Edit email and contact number</p>
            </div>
          </div>

          {/* Inline Card Banner Alert for Personal Info */}
          {profileAlert && (
            <div
              className={`mb-5 flex items-center justify-between gap-3 rounded-xl border p-3.5 text-xs font-medium transition-all ${
                profileAlert.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {profileAlert.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                )}
                <span>{profileAlert.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setProfileAlert(null)}
                className="rounded p-1 text-slate-400 hover:bg-black/5 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition focus:border-[#0b4d94] focus:outline-none focus:ring-1 focus:ring-[#0b4d94]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+255 123 456 789"
                  required
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition focus:border-[#0b4d94] focus:outline-none focus:ring-1 focus:ring-[#0b4d94]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b4d94] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#083b72] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSavingProfile ? "Saving to Database..." : "Save Profile Details"}
            </button>
          </form>
        </div>

        {/* Card 2: Password Security Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Security</h2>
              <p className="text-xs text-slate-500">Update your access password</p>
            </div>
          </div>

          {/* Inline Card Banner Alert for Password Security */}
          {passwordAlert && (
            <div
              className={`mb-5 flex items-center justify-between gap-3 rounded-xl border p-3.5 text-xs font-medium transition-all ${
                passwordAlert.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {passwordAlert.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                )}
                <span>{passwordAlert.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setPasswordAlert(null)}
                className="rounded p-1 text-slate-400 hover:bg-black/5 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-10 text-sm text-slate-800 focus:border-[#0b4d94] focus:outline-none focus:ring-1 focus:ring-[#0b4d94]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-10 text-sm text-slate-800 focus:border-[#0b4d94] focus:outline-none focus:ring-1 focus:ring-[#0b4d94]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-10 text-sm text-slate-800 focus:border-[#0b4d94] focus:outline-none focus:ring-1 focus:ring-[#0b4d94]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b4d94] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#083b72] disabled:opacity-50"
            >
              <KeyRound className="h-4 w-4" />
              {isChangingPassword ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}