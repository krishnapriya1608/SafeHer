import { Link, Navigate, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import { dashboardPathForRole } from "../utils/roles";

export default function DashboardLayout() {
  const { user, role, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to={dashboardPathForRole(role)}>
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-900">{user.username || user.name || "Account"}</p>
              <p className="text-xs font-semibold capitalize text-teal-700">{role}</p>
            </div>
            <button className="btn-secondary" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <Outlet />
      </motion.div>
    </main>
  );
}
