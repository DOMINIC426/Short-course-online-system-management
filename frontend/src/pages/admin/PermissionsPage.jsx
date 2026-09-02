import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/backendClient.js";
import {
  ShieldCheck,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Check,
  ChevronDown,
} from "lucide-react";

const ROLE_DESCRIPTIONS = {
  ADMIN: "Full system administration and management access.",
  COORDINATOR:
    "Manages courses, students, instructors and academic coordination.",
  INSTRUCTOR:
    "Manages teaching activities, attendance and course-related tasks.",
  STUDENT:
    "Accesses courses, applications, payments and student services.",
  MARKETING_OFFICER:
    "Manages marketing activities and promotes available courses.",
};

function formatRoleName(role) {
  return String(role || "")
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getErrorMessage(error, fallback) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    fallback
  );
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);

  const [selectedRole, setSelectedRole] = useState("");
  const [rolePermissions, setRolePermissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [rolePermissionsLoading, setRolePermissionsLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [roleError, setRoleError] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const [permissionToAssign, setPermissionToAssign] = useState("");

  async function loadPermissionsAndRoles() {
    try {
      setLoading(true);
      setError("");

      const [permissionsResponse, rolesResponse] = await Promise.all([
        api.get("/api/v1/admin/permissions"),
        api.get("/api/v1/admin/roles"),
      ]);

      const loadedPermissions = permissionsResponse.data || [];
      const loadedRoles = rolesResponse.data || [];

      setPermissions(loadedPermissions);
      setRoles(loadedRoles);

      if (!selectedRole && loadedRoles.length > 0) {
        const firstRole = loadedRoles[0];
        setSelectedRole(firstRole.role || firstRole.name);
      }
    } catch (err) {
      console.error("Failed to load permissions and roles:", err);

      setError(
        getErrorMessage(
          err,
          "Unable to load permissions and roles."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadRolePermissions(roleName) {
    if (!roleName) {
      setRolePermissions([]);
      return;
    }

    try {
      setRolePermissionsLoading(true);
      setRoleError("");

      const response = await api.get(
        `/api/v1/admin/roles/${encodeURIComponent(
          roleName
        )}/permissions`
      );

      setRolePermissions(response.data || []);
    } catch (err) {
      console.error("Failed to load role permissions:", err);

      setRolePermissions([]);

      setRoleError(
        getErrorMessage(
          err,
          "Unable to load permissions assigned to this role."
        )
      );
    } finally {
      setRolePermissionsLoading(false);
    }
  }

  useEffect(() => {
    loadPermissionsAndRoles();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      loadRolePermissions(selectedRole);
    }
  }, [selectedRole]);

  function openCreateModal() {
    setEditingPermission(null);

    setForm({
      name: "",
      description: "",
    });

    setShowModal(true);
  }

  function openEditModal(permission) {
    setEditingPermission(permission);

    setForm({
      name: permission.name || "",
      description: permission.description || "",
    });

    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingPermission(null);

    setForm({
      name: "",
      description: "",
    });
  }

  async function handleSavePermission(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
      };

      if (editingPermission) {
        await api.put(
          `/api/v1/admin/permissions/${editingPermission.id}`,
          payload
        );
      } else {
        await api.post("/api/v1/admin/permissions", payload);
      }

      closeModal();
      await loadPermissionsAndRoles();
    } catch (err) {
      console.error("Failed to save permission:", err);

      setError(
        getErrorMessage(
          err,
          "Unable to save the permission."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePermission(permission) {
    const confirmed = window.confirm(
      `Delete permission "${permission.name}"?\n\nThis may fail if the permission is currently assigned to roles.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(permission.id);
      setError("");

      await api.delete(
        `/api/v1/admin/permissions/${permission.id}`
      );

      await loadPermissionsAndRoles();

      if (selectedRole) {
        await loadRolePermissions(selectedRole);
      }
    } catch (err) {
      console.error("Failed to delete permission:", err);

      setError(
        getErrorMessage(
          err,
          "Unable to delete the permission."
        )
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleAssignPermission() {
    if (!selectedRole || !permissionToAssign) {
      return;
    }

    try {
      setAssigning(true);
      setRoleError("");

      await api.post("/api/v1/admin/roles/permissions", {
        role: selectedRole,
        permissionId: Number(permissionToAssign),
      });

      setPermissionToAssign("");

      await loadRolePermissions(selectedRole);
    } catch (err) {
      console.error("Failed to assign permission:", err);

      setRoleError(
        getErrorMessage(
          err,
          "Unable to assign the permission to this role."
        )
      );
    } finally {
      setAssigning(false);
    }
  }

  async function handleRemovePermission(permission) {
    const permissionId =
      permission.permissionId ?? permission.id;

    if (!selectedRole || !permissionId) {
      return;
    }

    const confirmed = window.confirm(
      `Remove "${permission.permissionName || permission.name}" from ${formatRoleName(
        selectedRole
      )}?`
    );

    if (!confirmed) return;

    try {
      setRemovingId(permissionId);
      setRoleError("");

      await api.delete(
        `/api/v1/admin/roles/${encodeURIComponent(
          selectedRole
        )}/permissions/${permissionId}`
      );

      await loadRolePermissions(selectedRole);
    } catch (err) {
      console.error("Failed to remove permission:", err);

      setRoleError(
        getErrorMessage(
          err,
          "Unable to remove the permission from this role."
        )
      );
    } finally {
      setRemovingId(null);
    }
  }

  const filteredPermissions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return permissions;
    }

    return permissions.filter((permission) => {
      return (
        permission.name?.toLowerCase().includes(query) ||
        permission.description?.toLowerCase().includes(query)
      );
    });
  }, [permissions, search]);

  const assignedPermissionIds = useMemo(() => {
    return new Set(
      rolePermissions.map(
        (permission) =>
          permission.permissionId ?? permission.id
      )
    );
  }, [rolePermissions]);

  const availablePermissions = permissions.filter(
    (permission) => !assignedPermissionIds.has(permission.id)
  );

  const selectedRoleObject = roles.find(
    (role) => (role.role || role.name) === selectedRole
  );

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-7 w-7 animate-spin text-udom-primary" />

          <p className="mt-3 text-sm font-medium text-slate-600">
            Loading permissions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-udom-primary">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Permissions & RBAC
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage system permissions and control which permissions
            are assigned to each role.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadPermissionsAndRoles}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-udom-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Permission
          </button>
        </div>
      </div>

      {/* Global Error */}
      {error && (
        <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">
            {error}
          </p>

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
          <p className="text-sm font-medium text-slate-500">
            Total Permissions
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {permissions.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            System Roles
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {roles.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Assigned to Selected Role
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {rolePermissions.length}
          </p>
        </div>
      </div>

      {/* RBAC Assignment */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-udom-primary/10 p-2.5">
              <ShieldCheck className="h-5 w-5 text-udom-primary" />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Role Permissions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Assign or remove permissions for a system role.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          {/* Role Selector */}
          <div className="grid gap-5 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1fr)]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Select Role
              </label>

              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(event) =>
                    setSelectedRole(event.target.value)
                  }
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-udom-primary focus:ring-2 focus:ring-udom-primary/10"
                >
                  {roles.map((role) => {
                    const roleName = role.role || role.name;

                    return (
                      <option key={roleName} value={roleName}>
                        {formatRoleName(roleName)}
                      </option>
                    );
                  })}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              {selectedRoleObject && (
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {selectedRoleObject.description ||
                    ROLE_DESCRIPTIONS[selectedRole] ||
                    "System-defined user role."}
                </p>
              )}
            </div>

            {/* Assignment Controls */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Assign Permission
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <select
                    value={permissionToAssign}
                    onChange={(event) =>
                      setPermissionToAssign(event.target.value)
                    }
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-udom-primary focus:ring-2 focus:ring-udom-primary/10"
                  >
                    <option value="">
                      Select a permission...
                    </option>

                    {availablePermissions.map((permission) => (
                      <option
                        key={permission.id}
                        value={permission.id}
                      >
                        {permission.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>

                <button
                  type="button"
                  onClick={handleAssignPermission}
                  disabled={
                    assigning ||
                    !permissionToAssign ||
                    !selectedRole
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-udom-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {assigning ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}

                  Assign
                </button>
              </div>
            </div>
          </div>

          {roleError && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">
                {roleError}
              </p>
            </div>
          )}

          {/* Assigned Permissions */}
          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Assigned Permissions
              </h3>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {rolePermissions.length}
              </span>
            </div>

            {rolePermissionsLoading ? (
              <div className="rounded-lg border border-slate-200 p-8 text-center">
                <RefreshCw className="mx-auto h-6 w-6 animate-spin text-udom-primary" />

                <p className="mt-2 text-sm text-slate-500">
                  Loading role permissions...
                </p>
              </div>
            ) : rolePermissions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
                <ShieldCheck className="mx-auto h-8 w-8 text-slate-300" />

                <p className="mt-2 font-medium text-slate-700">
                  No permissions assigned
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Use the assignment control above to give this role
                  permissions.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {rolePermissions.map((permission) => {
                  const permissionId =
                    permission.permissionId ?? permission.id;

                  const permissionName =
                    permission.permissionName ||
                    permission.name ||
                    `Permission #${permissionId}`;

                  const permissionDescription =
                    permission.permissionDescription ||
                    permission.description ||
                    "";

                  return (
                    <div
                      key={permission.id || permissionId}
                      className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 shrink-0 text-udom-primary" />

                          <p className="truncate text-sm font-semibold text-slate-800">
                            {permissionName}
                          </p>
                        </div>

                        {permissionDescription && (
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            {permissionDescription}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleRemovePermission(permission)
                        }
                        disabled={removingId === permissionId}
                        className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        title="Remove permission"
                      >
                        {removingId === permissionId ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Permission Management */}
      <section>
        <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Permission Management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create and maintain the permissions available in SCMS.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search permissions..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-udom-primary focus:ring-2 focus:ring-udom-primary/10"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {filteredPermissions.length === 0 ? (
            <div className="p-10 text-center">
              <ShieldCheck className="mx-auto h-10 w-10 text-slate-300" />

              <p className="mt-3 font-medium text-slate-700">
                No permissions found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Create a permission or change your search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Permission
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Description
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Created
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredPermissions.map((permission) => (
                    <tr
                      key={permission.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {permission.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          ID: {permission.id}
                        </p>
                      </td>

                      <td className="max-w-md px-5 py-4">
                        <p className="text-sm text-slate-500">
                          {permission.description ||
                            "No description provided."}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                        {permission.createdAt
                          ? new Date(
                              permission.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(permission)
                            }
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            title="Edit permission"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeletePermission(permission)
                            }
                            disabled={
                              deletingId === permission.id
                            }
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            title="Delete permission"
                          >
                            {deletingId === permission.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
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
      </section>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingPermission
                    ? "Edit Permission"
                    : "Create Permission"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Define a permission that can be assigned to
                  system roles.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSavePermission}
              className="space-y-5 p-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Permission Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. MANAGE_USERS"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-udom-primary focus:ring-2 focus:ring-udom-primary/10"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Use a clear uppercase permission name.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Describe what this permission allows..."
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-udom-primary focus:ring-2 focus:ring-udom-primary/10"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || !form.name.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-udom-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}

                  {editingPermission
                    ? "Save Changes"
                    : "Create Permission"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}