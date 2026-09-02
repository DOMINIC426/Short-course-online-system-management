import { useEffect, useState } from "react";
import { api } from "../../api/backendClient.js";
import {
  Settings,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
} from "lucide-react";

function getErrorMessage(error, fallback) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    fallback
  );
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);

  const [form, setForm] = useState({
    settingKey: "",
    settingValue: "",
    description: "",
  });

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/v1/admin/settings");

      setSettings(response.data || []);
    } catch (err) {
      console.error("Failed to load system settings:", err);

      setError(
        getErrorMessage(
          err,
          "Unable to load system settings."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function openCreateModal() {
    setEditingSetting(null);

    setForm({
      settingKey: "",
      settingValue: "",
      description: "",
    });

    setShowModal(true);
  }

  function openEditModal(setting) {
    setEditingSetting(setting);

    setForm({
      settingKey: setting.settingKey || "",
      settingValue: setting.settingValue || "",
      description: setting.description || "",
    });

    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingSetting(null);

    setForm({
      settingKey: "",
      settingValue: "",
      description: "",
    });
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!form.settingKey.trim()) {
      setError("Setting key is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        settingKey: form.settingKey.trim(),
        settingValue: form.settingValue,
        description: form.description.trim(),
      };

      if (editingSetting) {
        await api.put(
          `/api/v1/admin/settings/${editingSetting.id}`,
          payload
        );
      } else {
        await api.post("/api/v1/admin/settings", payload);
      }

      closeModal();
      await loadSettings();
    } catch (err) {
      console.error("Failed to save system setting:", err);

      setError(
        getErrorMessage(
          err,
          "Unable to save the system setting."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(setting) {
    const confirmed = window.confirm(
      `Delete system setting "${setting.settingKey}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(setting.id);
      setError("");

      await api.delete(
        `/api/v1/admin/settings/${setting.id}`
      );

      await loadSettings();
    } catch (err) {
      console.error("Failed to delete system setting:", err);

      setError(
        getErrorMessage(
          err,
          "Unable to delete the system setting."
        )
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredSettings = settings.filter((setting) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      setting.settingKey?.toLowerCase().includes(query) ||
      setting.settingValue?.toLowerCase().includes(query) ||
      setting.description?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-7 w-7 animate-spin text-udom-primary" />

          <p className="mt-3 text-sm font-medium text-slate-600">
            Loading system settings...
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
            System Settings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Configure application-wide settings used by SCMS.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadSettings}
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
            Add Setting
          </button>
        </div>
      </div>

      {/* Error */}
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
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-udom-primary/10 p-2.5">
              <Settings className="h-5 w-5 text-udom-primary" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Settings
              </p>

              <p className="text-2xl font-bold text-slate-900">
                {settings.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-udom-primary/10 p-2.5">
              <Settings className="h-5 w-5 text-udom-primary" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                Visible Results
              </p>

              <p className="text-2xl font-bold text-slate-900">
                {filteredSettings.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Application Configuration
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage key-value settings for the system.
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
            placeholder="Search settings..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-udom-primary focus:ring-2 focus:ring-udom-primary/10"
          />
        </div>
      </div>

      {/* Settings Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {filteredSettings.length === 0 ? (
          <div className="p-10 text-center">
            <Settings className="mx-auto h-10 w-10 text-slate-300" />

            <p className="mt-3 font-medium text-slate-700">
              No system settings found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Add a setting or change your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Setting
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Value
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Description
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Updated
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredSettings.map((setting) => (
                  <tr
                    key={setting.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {setting.settingKey}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        ID: {setting.id}
                      </p>
                    </td>

                    <td className="max-w-xs px-5 py-4">
                      <div className="max-h-20 overflow-auto rounded-lg bg-slate-50 px-3 py-2">
                        <code className="break-all text-xs text-slate-700">
                          {setting.settingValue || "—"}
                        </code>
                      </div>
                    </td>

                    <td className="max-w-sm px-5 py-4">
                      <p className="text-sm text-slate-500">
                        {setting.description ||
                          "No description provided."}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                      {setting.updatedAt
                        ? new Date(
                            setting.updatedAt
                          ).toLocaleString()
                        : setting.createdAt
                          ? new Date(
                              setting.createdAt
                            ).toLocaleString()
                          : "—"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(setting)
                          }
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          title="Edit setting"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(setting)
                          }
                          disabled={
                            deletingId === setting.id
                          }
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          title="Delete setting"
                        >
                          {deletingId === setting.id ? (
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingSetting
                    ? "Edit System Setting"
                    : "Create System Setting"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Configure an application-wide setting.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="space-y-5 p-5"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Setting Key
                </label>

                <input
                  type="text"
                  value={form.settingKey}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      settingKey: event.target.value,
                    }))
                  }
                  placeholder="e.g. SYSTEM_NAME"
                  required
                  disabled={Boolean(editingSetting)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-udom-primary focus:ring-2 focus:ring-udom-primary/10 disabled:bg-slate-100 disabled:text-slate-500"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Use a unique key such as SYSTEM_NAME or
                  REGISTRATION_ENABLED.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Setting Value
                </label>

                <textarea
                  value={form.settingValue}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      settingValue: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Enter the setting value..."
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-udom-primary focus:ring-2 focus:ring-udom-primary/10"
                />
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
                  rows={3}
                  placeholder="Describe what this setting controls..."
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-udom-primary focus:ring-2 focus:ring-udom-primary/10"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || !form.settingKey.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-udom-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}

                  {editingSetting
                    ? "Save Changes"
                    : "Create Setting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}