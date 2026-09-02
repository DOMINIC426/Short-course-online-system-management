import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getNavigationForRole } from "../config/navigationConfig";

export default function PortalLayout() {
  const { user, logout } = useAuth();

  const role = user?.role;
  const navigation = getNavigationForRole(role);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-slate-200 bg-white lg:block">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-lg font-bold text-udom-primary">
              SCMS
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Short Course Management System
            </p>
          </div>

          <nav className="space-y-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.key}
                  to={item.path}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                      isActive
                        ? "bg-udom-primary text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    ].join(" ")
                  }
                >
                  <Icon className="h-5 w-5" />

                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between px-5 py-4 sm:px-8">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {user?.firstName || user?.username || "User"}
                </p>

                <p className="text-xs text-slate-500">
                  {role || "No role"}
                </p>
              </div>

              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}