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
      {/* Premium Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 text-white shadow-xl shadow-slate-950/10 sm:p-8">
        {/* Subtle Decorative Background Light Glowing Orbs */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -bottom-10 left-1/3 h-32 w-32 rounded-full bg-slate-500/10 blur-3xl" />

        <div className="relative z-10">
          <p className="inline-flex items-center rounded-md bg-teal-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-teal-400 ring-1 ring-inset ring-teal-400/20">
            {roleName}
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            {data.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
            {data.subtitle}
          </p>
          
          <div className="mt-6 flex items-center gap-2 border-t border-slate-800 pt-4 text-sm font-medium text-slate-400">
            <span>Welcome back,</span>
            <span className="font-semibold text-white">
              {user?.username || user?.name || user?.email || "User"}
            </span>
          </div>
        </div>
      </section>

      {/* Stats KPI Overview Blocks */}
      <section className="grid gap-4 md:grid-cols-3">
        {data.stats.map((stat) => (
          <motion.div
            key={stat}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300/80 hover:shadow-md"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 transition-colors group-hover:text-slate-500">
              Overview Status
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
              {stat}
            </h2>
          </motion.div>
        ))}
      </section>

      {/* Interactive Action Modules Panel */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Quick Actions & Modules
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.actions.map((action) => (
            <button 
              key={action} 
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:border-teal-500 hover:shadow-lg hover:shadow-teal-500/5 focus:outline-none focus:ring-4 focus:ring-teal-500/10 active:scale-[0.99]"
            >
              <div>
                <span className="block text-base font-bold tracking-tight text-slate-900 transition-colors duration-150 group-hover:text-teal-950">
                  {action}
                </span>
                <span className="mt-1.5 block text-xs leading-normal text-slate-500 group-hover:text-slate-600">
                  Access and manage your {action.toLowerCase()} details.
                </span>
              </div>
              
              <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-teal-600 transition-colors group-hover:text-teal-700">
                <span>Open module</span>
                {/* Micro chevron arrow that slides out on hover */}
                <svg className="h-3 w-3 translate-x-0 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}