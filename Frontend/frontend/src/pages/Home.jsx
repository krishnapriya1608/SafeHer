import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { dashboardPathForRole } from "../utils/roles";

const features = [
  {
    title: "Emergency SOS",
    text: "Send live location alerts to volunteers, police, and trusted contacts.",
  },
  {
    title: "Role Based Access",
    text: "Separate dashboards for users, volunteers, police teams, and admins.",
  },
  {
    title: "Verified Accounts",
    text: "Email OTP verification before login keeps the platform more secure.",
  },
  {
    title: "Safety Network",
    text: "Manage contacts, alerts, reports, and response activity in one place.",
  },
];

const roleCards = [
  "User Dashboard",
  "Volunteer Alerts",
  "Police Response",
  "Admin Control",
];

export default function Home() {
  const { isAuthenticated, role } = useAuth();

  return (
    <main className="auth-bg min-h-screen">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link className="btn-primary" to={dashboardPathForRole(role)}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link className="btn-secondary" to="/login">
                Login
              </Link>
              <Link className="btn-primary" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-20 lg:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center"
        >
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">
            Women Safety Platform
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-6xl">
            A secure dashboard for emergency support and rapid response.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Register as a user, volunteer, police officer, or admin. Login with JWT
            authentication and open the dashboard designed for your role.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="btn-primary" to="/register">
              Create Account
            </Link>
            <Link className="btn-secondary" to="/login">
              Login Account
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="glass rounded-[2rem] p-5 shadow-soft sm:p-6"
        >
          <div className="rounded-3xl bg-slate-950 p-6 text-white">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-300">
              Access Panel
            </p>
            <h2 className="mt-3 text-3xl font-black">Choose your action</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link className="rounded-2xl bg-white p-5 text-slate-950 transition hover:-translate-y-1" to="/register">
                <span className="block text-lg font-black">Register</span>
                <span className="mt-2 block text-sm leading-6 text-slate-600">
                  Create a verified account.
                </span>
              </Link>
              <Link className="rounded-2xl bg-teal-400 p-5 text-slate-950 transition hover:-translate-y-1" to="/login">
                <span className="block text-lg font-black">Login</span>
                <span className="mt-2 block text-sm leading-6 text-slate-800">
                  Access your dashboard.
                </span>
              </Link>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {roleCards.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-black text-slate-950">{item}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Role protected route</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {features.map((feature) => (
          <motion.article
            key={feature.title}
            whileHover={{ y: -5 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h3 className="text-lg font-black text-slate-950">{feature.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p>
          </motion.article>
        ))}
      </section>
    </main>
  );
}
