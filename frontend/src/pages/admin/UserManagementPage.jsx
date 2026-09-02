
import { useEffect, useState } from "react";
import { api } from "../../api/backendClient.js";
import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  Edit3,
  UserCheck,
  UserX,
  KeyRound,
  X,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

const ROLES = [
  "ADMIN",
  "COORDINATOR",
  "INSTRUCTOR",
  "STUDENT",
  "MARKETING_OFFICER",
];

function StatusBadge({ status }) {
  const styles = {
    ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    INACTIVE: "bg-slate-100 text-slate-600 border-slate-200",
    SUSPENDED: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[status] || styles.INACTIVE
      }`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}

function RoleBadge({ role }) {
  return (
    <span className="inline-flex rounded-full bg-udom-primary/10 px-2.5 py-1 text-xs font-semibold text-udom-primary">
      {role?.replaceAll("_", " ") || "—"}
    </span>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [modal, setModal] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT",
  });

  const [resetPassword, setResetPassword] = useState("");
  const [confirmResetPassword, setConfirmResetPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showConfirmResetPassword, setShowConfirmResetPassword] =
    useState(false);

  const [submitting, setSubmitting] = useState(false);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/v1/admin/users");

      setUsers(response.data || []);
    } catch (err) {
      console.error("Failed to load users:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function openCreateModal() {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "STUDENT",
    });

    setShowPassword(false);
    setShowConfirmPassword(false);
    setModal({ type: "create" });
  }

  function openEditModal(user) {
    setForm({
      id: user.id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      confirmPassword: "",
      role: user.role || "STUDENT",
    });

    setModal({ type: "edit", user });
  }

  function openResetModal(user) {
    setResetPassword("");
    setConfirmResetPassword("");
    setShowResetPassword(false);
    setShowConfirmResetPassword(false);

    setModal({ type: "reset", user });
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function createUser(event) {
    event.preventDefault();

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await api.post("/api/v1/admin/users", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
      });

      setModal(null);

      await loadUsers();
    } catch (err) {
      console.error("Failed to create user:", err);

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.detail;

      setError(
        backendMessage ||
          "Unable to create user. Please check the information and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function updateUser(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      await api.put(`/api/v1/admin/users/${form.id}`, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
      });

      setModal(null);

      await loadUsers();
    } catch (err) {
      console.error("Failed to update user:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to update user."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function changeStatus(user) {
    const action =
      user.status === "ACTIVE"
        ? "deactivate"
        : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.patch(
        `/api/v1/admin/users/${user.id}/${action}`
      );

      await loadUsers();
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          `Unable to ${action} user.`
      );
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();

    if (resetPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (resetPassword !== confirmResetPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await api.patch(
        `/api/v1/admin/users/${modal.user.id}/reset-password`,
        {
          newPassword: resetPassword,
        }
      );

      setModal(null);
      setResetPassword("");
      setConfirmResetPassword("");
    } catch (err) {
      console.error("Failed to reset password:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to reset password."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const filteredUsers = users.filter((user) => {
    const searchValue = search.trim().toLowerCase();

    const matchesSearch =
      !searchValue ||
      `${user.firstName || ""} ${user.lastName || ""}`
        .toLowerCase()
        .includes(searchValue) ||
      (user.email || "").toLowerCase().includes(searchValue) ||
      (user.phone || "").toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "ALL" ||
      user.status === statusFilter;

    const matchesRole =
      roleFilter === "ALL" ||
      user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-udom-primary">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            User Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create, view, update and manage system user accounts.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadUsers}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-udom-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-95"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-start justify-between rounded-xl border border-red-200 bg-red-50 p-4">
          <div>
            <p className="text-sm font-semibold text-red-800">
              Operation failed
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Users
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {users.length}
              </p>
            </div>

            <div className="rounded-lg bg-udom-primary/10 p-3">
              <Users className="h-5 w-5 text-udom-primary" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Active Users
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {
              users.filter(
                (user) => user.status === "ACTIVE"
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Students
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {
              users.filter(
                (user) => user.role === "STUDENT"
              ).length
            }
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search name, email or phone..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-udom-primary focus:ring-2 focus:ring-udom-primary/10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-udom-primary"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value)
            }
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-udom-primary"
          >
            <option value="ALL">All roles</option>

            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <RefreshCw className="mx-auto h-7 w-7 animate-spin text-udom-primary" />

              <p className="mt-3 text-sm font-medium text-slate-600">
                Loading users...
              </p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-300" />

            <p className="mt-3 text-sm font-semibold text-slate-700">
              No users found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3 font-semibold">
                    User
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Contact
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Role
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-udom-primary/10 font-bold text-udom-primary">
                          {user.firstName?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {user.firstName} {user.lastName}
                          </p>

                          <p className="text-xs text-slate-400">
                            ID: {user.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-700">
                        {user.email || "—"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {user.phone || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <RoleBadge role={user.role} />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={user.status} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          title="Edit user"
                          onClick={() =>
                            openEditModal(user)
                          }
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          title={
                            user.status === "ACTIVE"
                              ? "Deactivate user"
                              : "Activate user"
                          }
                          onClick={() =>
                            changeStatus(user)
                          }
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          {user.status === "ACTIVE" ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          title="Reset password"
                          onClick={() =>
                            openResetModal(user)
                          }
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE USER */}
      {modal?.type === "create" && (
        <Modal
          title="Create New User"
          onClose={() => setModal(null)}
        >
          <form
            onSubmit={createUser}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={handleFormChange}
                required
              />

              <Input
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={handleFormChange}
                required
              />
            </div>

            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleFormChange}
              required
            />

            <Input
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleFormChange}
              required
            />

            <PasswordInput
              label="Password"
              name="password"
              value={form.password}
              onChange={handleFormChange}
              visible={showPassword}
              onToggle={() =>
                setShowPassword((current) => !current)
              }
              minLength={8}
              required
            />

            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleFormChange}
              visible={showConfirmPassword}
              onToggle={() =>
                setShowConfirmPassword((current) => !current)
              }
              minLength={8}
              required
            />

            {form.confirmPassword && (
              <p
                className={`text-xs font-medium ${
                  form.password === form.confirmPassword
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {form.password === form.confirmPassword
                  ? "✓ Passwords match"
                  : "✕ Passwords do not match"}
              </p>
            )}

            <RoleSelect
              value={form.role}
              onChange={handleFormChange}
            />

            <ModalButtons
              onCancel={() => setModal(null)}
              submitText={
                submitting ? "Creating..." : "Create User"
              }
              icon={UserPlus}
              disabled={submitting}
            />
          </form>
        </Modal>
      )}

      {/* EDIT USER */}
      {modal?.type === "edit" && (
        <Modal
          title="Edit User"
          onClose={() => setModal(null)}
        >
          <form
            onSubmit={updateUser}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={handleFormChange}
                required
              />

              <Input
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={handleFormChange}
                required
              />
            </div>

            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleFormChange}
              required
            />

            <Input
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleFormChange}
              required
            />

            <RoleSelect
              value={form.role}
              onChange={handleFormChange}
            />

            <ModalButtons
              onCancel={() => setModal(null)}
              submitText={
                submitting ? "Saving..." : "Save Changes"
              }
              icon={Save}
              disabled={submitting}
            />
          </form>
        </Modal>
      )}

      {/* RESET PASSWORD */}
      {modal?.type === "reset" && (
        <Modal
          title="Reset User Password"
          onClose={() => setModal(null)}
        >
          <form
            onSubmit={handleResetPassword}
            className="space-y-4"
          >
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Resetting password for
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {modal.user.firstName}{" "}
                {modal.user.lastName}
              </p>

              <p className="text-xs text-slate-500">
                {modal.user.email}
              </p>
            </div>

            <PasswordInput
              label="New Password"
              value={resetPassword}
              onChange={(event) =>
                setResetPassword(event.target.value)
              }
              visible={showResetPassword}
              onToggle={() =>
                setShowResetPassword((current) => !current)
              }
              minLength={8}
              required
            />

            <PasswordInput
              label="Confirm New Password"
              value={confirmResetPassword}
              onChange={(event) =>
                setConfirmResetPassword(event.target.value)
              }
              visible={showConfirmResetPassword}
              onToggle={() =>
                setShowConfirmResetPassword(
                  (current) => !current
                )
              }
              minLength={8}
              required
            />

            {confirmResetPassword && (
              <p
                className={`text-xs font-medium ${
                  resetPassword === confirmResetPassword
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {resetPassword === confirmResetPassword
                  ? "✓ Passwords match"
                  : "✕ Passwords do not match"}
              </p>
            )}

            <ModalButtons
              onCancel={() => setModal(null)}
              submitText={
                submitting
                  ? "Resetting..."
                  : "Reset Password"
              }
              icon={KeyRound}
              disabled={submitting}
            />
          </form>
        </Modal>
      )}
    </div>
  );
}

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  minLength,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-udom-primary focus:ring-2 focus:ring-udom-primary/10"
      />
    </div>
  );
}

function PasswordInput({
  label,
  name,
  value,
  onChange,
  visible,
  onToggle,
  required = false,
  minLength,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-11 text-sm outline-none focus:border-udom-primary focus:ring-2 focus:ring-udom-primary/10"
        />

        <button
          type="button"
          onClick={onToggle}
          title={visible ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function RoleSelect({ value, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        Role
      </label>

      <select
        name="role"
        value={value}
        onChange={onChange}
        required
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-udom-primary"
      >
        {ROLES.map((role) => (
          <option key={role} value={role}>
            {role.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </div>
  );
}

function ModalButtons({
  onCancel,
  submitText,
  icon: Icon,
  disabled = false,
}) {
  return (
    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={disabled}
        className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-lg bg-udom-primary px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Icon className="h-4 w-4" />
        {submitText}
      </button>
    </div>
  );
}

