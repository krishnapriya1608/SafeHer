import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const dashboardData = {
  user: {
    title: "User Dashboard",
    subtitle: "Manage your profile, trusted contacts, recent alerts, and emergency status.",
    stats: ["0 Active SOS", "3 Trusted Contacts", "Safe Status"],
    actions: ["Create SOS", "Edit Profile", "Trusted Contacts", "Recent Alerts"],
  },
  volunteer: {
    title: "Volunteer Dashboard",
    subtitle: "Monitor nearby emergency alerts and respond to verified SOS requests.",
    stats: ["0 New Alerts", "Ready", "Within 5 km"],
    actions: ["New SOS Alerts", "Accepted Cases", "Live Location", "Response History"],
  },
  police: {
    title: "Police Dashboard",
    subtitle: "Track emergency cases, assign response teams, and view real-time incident locations.",
    stats: ["0 Active Cases", "Live Map", "Response Queue"],
    actions: ["SOS Cases", "Dispatch", "Incident Map", "Reports"],
  },
  admin: {
    title: "Admin Dashboard",
    subtitle: "Manage platform users, approve volunteers, review reports, and monitor system activity.",
    stats: ["Users", "Volunteers", "Reports"],
    actions: ["Manage Users", "Approve Volunteers", "Manage SOS", "Block Fake Users"],
  },
};

export default function RoleDashboard({ roleName }) {
  const { user } = useAuth();
  const data = dashboardData[roleName] || dashboardData.user;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-soft sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-300">
          {roleName}
        </p>
        <h1 className="mt-3 text-3xl font-black sm:text-5xl">{data.title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
          {data.subtitle}
        </p>
        <p className="mt-6 text-sm font-semibold text-white/80">
          Welcome, {user?.username || user?.name || user?.email}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {data.stats.map((stat) => (
          <motion.div
            key={stat}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-bold text-slate-500">Status</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{stat}</h2>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.actions.map((action) => (
          <button key={action} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-teal-300 hover:shadow-lg">
            <span className="text-base font-black text-slate-950">{action}</span>
            <span className="mt-2 block text-sm leading-6 text-slate-600">Open module</span>
          </button>
        ))}
      </section>
    </div>
  );
}
