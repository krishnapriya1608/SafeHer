import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Siren,
  MapPinned,
  Users,
  HeartHandshake,
  BarChart3,
  LockKeyhole,
  ArrowRight,
  PhoneCall,
  FileWarning,
  Route,
  Bot,
  Mail,
  Camera,
  Building2,
  Activity,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { dashboardPathForRole } from "../utils/roles";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const realWorldSafetyFeatures = [
  {
    title: "SOS Button",
    text: "A large emergency button that instantly sends the user's live location to trusted contacts, volunteers, and police.",
  },
  {
    title: "Live Location Sharing",
    text: "Share real-time movement with trusted contacts during travel or emergency situations.",
  },
  {
    title: "Fake Call",
    text: "Trigger a realistic fake incoming call to help the user escape uncomfortable situations.",
  },
  {
    title: "Follow Me Mode",
    text: "Trusted contacts can follow the user's journey live until they safely reach the destination.",
  },
  {
    title: "Voice Activation",
    text: "Activate SOS using a secret voice phrase when the user cannot touch the phone.",
  },
  {
    title: "Timer Alert",
    text: "User sets a safety timer. If they do not cancel it before time ends, an SOS alert is sent automatically.",
  },
  {
    title: "Trusted Guardians",
    text: "Add parents, friends, relatives, or guardians who receive emergency alerts and location updates.",
  },
  {
    title: "Video Evidence",
    text: "Automatically record audio/video during SOS and store it as evidence.",
  },
  {
    title: "Emergency SMS",
    text: "Send emergency SMS with location link to trusted contacts.",
  },
  {
    title: "Emergency Email",
    text: "Send emergency email with user details, location, and incident information.",
  },
  {
    title: "Nearby Help",
    text: "Show nearby police stations, hospitals, women support centers, and helpline numbers.",
  },
  {
    title: "Safe Route",
    text: "Suggest safer routes by avoiding unsafe or frequently reported areas.",
  },
  {
    title: "Community Reports",
    text: "Users can report harassment, stalking, poor lighting, unsafe roads, or suspicious areas.",
  },
  {
    title: "Danger Zone Alerts",
    text: "Warn users when they enter areas marked unsafe by reports or admin data.",
  },
  {
    title: "Volunteer Network",
    text: "Nearby verified volunteers receive SOS alerts and can accept response requests.",
  },
  {
    title: "Police Dashboard",
    text: "Police can view live SOS cases, location, user details, and response status.",
  },
  {
    title: "Admin Verification",
    text: "Admins can verify reports, approve volunteers, block fake users, and manage incidents.",
  },
  {
    title: "AI Safety Assistant",
    text: "User can ask questions like 'Someone is following me' and receive immediate safety steps.",
  },
];

const features = [
  {
    icon: Siren,
    title: "One Tap SOS",
    text: "Users can send an emergency alert with live location to volunteers, police teams, and trusted contacts.",
  },
  {
    icon: MapPinned,
    title: "Live Location Tracking",
    text: "Emergency responders can view current position, nearby help centers, and route information.",
  },
  {
    icon: Users,
    title: "Trusted Contacts",
    text: "Users can manage parents, friends, or relatives who receive emergency updates.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Role Access",
    text: "Separate access for users, volunteers, police, and admins using JWT authentication.",
  },
  {
    icon: HeartHandshake,
    title: "Volunteer Response",
    text: "Nearby volunteers can receive SOS alerts and help before official response arrives.",
  },
  {
    icon: BarChart3,
    title: "Incident Analytics",
    text: "Admins can monitor unsafe areas, SOS trends, monthly reports, and response activity.",
  },
];
const modules = [
  {
    icon: PhoneCall,
    title: "Trusted Contacts",
    text: "Add parents, friends, relatives, or guardians who receive emergency SMS and email alerts.",
  },
  {
    icon: FileWarning,
    title: "Community Reporting",
    text: "Report harassment, stalking, poor lighting, unsafe areas, and suspicious activity.",
  },
  {
    icon: Route,
    title: "Safe Route Finder",
    text: "Find safer routes by avoiding unsafe zones and showing estimated travel time.",
  },
  {
    icon: Bot,
    title: "AI Safety Assistant",
    text: "Ask safety questions and get immediate steps, emergency guidance, and legal information.",
  },
  {
    icon: Building2,
    title: "Nearby Help Centers",
    text: "Find nearby police stations, hospitals, women support centers, and helplines.",
  },
  {
    icon: Camera,
    title: "Photo Evidence Upload",
    text: "Attach photos while reporting unsafe incidents for admin verification.",
  },
];

const stats = [
  {
    value: "24/7",
    label: "Emergency access",
  },
  {
    value: "4",
    label: "Role dashboards",
  },
  {
    value: "Live",
    label: "SOS tracking",
  },
  {
    value: "OTP",
    label: "Verified login",
  },
];

const workflow = [
  {
    icon: Siren,
    title: "SOS Created",
    text: "User presses the emergency button and location is captured.",
  },
  {
    icon: Activity,
    title: "Alert Broadcast",
    text: "Volunteers and police receive real-time emergency notification.",
  },
  {
    icon: MapPinned,
    title: "Live Tracking",
    text: "Responders view location updates and route details.",
  },
  {
    icon: CheckCircle2,
    title: "Case Resolved",
    text: "Incident status is updated and stored for analytics.",
  },
];

const securityFeatures = [
  "JWT token authentication",
  "Password hashing with bcrypt",
  "OTP email verification",
  "Protected React routes",
  "Role-based dashboard access",
  "Admin control for fake users",
];

const roles = [
  {
    title: "User",
    text: "Send SOS, manage profile, add trusted contacts, report unsafe areas.",
  },
  {
    title: "Volunteer",
    text: "Receive nearby emergency alerts and help users in distress.",
  },
  {
    title: "Police",
    text: "Track active SOS cases and coordinate emergency response.",
  },
  {
    title: "Admin",
    text: "Manage users, volunteers, reports, SOS cases, and platform safety.",
  },
];

const steps = [
  "User presses SOS",
  "Location is saved",
  "Volunteers are notified",
  "Police dashboard updates",
  "Trusted contacts receive alert",
];

export default function Home() {
  const { isAuthenticated, role } = useAuth();

  return (
    <main className="min-h-screen bg-[#f7faf9] text-slate-950">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white">
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <Logo />

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950" to={dashboardPathForRole(role)}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10" to="/login">
                  Login
                </Link>
                <Link className="rounded-xl bg-teal-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-teal-300" to="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-28 lg:pt-20">
          <motion.div initial="hidden" animate="show" variants={fadeUp} transition={{ duration: 0.55 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-white/10 px-4 py-2 text-sm font-semibold text-teal-100">
              <LockKeyhole size={16} />
              JWT Secure Authentication
            </div>

            <h1 className="mt-7 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
              Real-time women safety and emergency response platform.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              A role-based web application where users can send emergency alerts,
              volunteers can respond quickly, police can track active incidents,
              and admins can manage safety reports.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-400 px-6 py-4 text-sm font-black text-slate-950 hover:bg-teal-300" to="/register">
                Get Started <ArrowRight size={18} />
              </Link>
              <Link className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-4 text-sm font-black text-white hover:bg-white/10" to="/login">
                Login Account
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl"
          >
            <div className="rounded-3xl bg-white p-5 text-slate-950">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500">Emergency Status</p>
                  <h2 className="mt-1 text-2xl font-black">Safety Network Active</h2>
                </div>
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-100 text-rose-600">
                  <Siren size={28} />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {steps.map((step, index) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + index * 0.08 }}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm font-bold text-slate-800">{step}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-700">Core Features</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            Built for real-world emergency workflows
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            This platform connects users, responders, and administrators through
            secure authentication, location sharing, live alerts, and safety reporting.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -6 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                  <Icon size={24} />
                </div>
                <h3 className="mt-5 text-xl font-black text-slate-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-700">User Roles</p>
              <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
                One platform, four dashboards
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Every account opens only the dashboard allowed by its role.
                This keeps the system organized and secure.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {roles.map((item) => (
                <motion.div
                  key={item.title}
                  whileHover={{ y: -5 }}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                  <h3 className="text-xl font-black text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <motion.div
              key={item.label}
              whileHover={{ y: -5 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <h3 className="text-3xl font-black text-slate-950">{item.value}</h3>
              <p className="mt-2 text-sm font-semibold text-slate-500">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-300">
              Platform Modules
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              More than login and registration
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              The system is designed as a complete safety platform with SOS, maps,
              reports, analytics, contacts, and AI support.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -6 }}
                  className="rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-400 text-slate-950">
                    <Icon size={24} />
                  </div>
                  <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{item.text}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-700">
                Emergency Workflow
              </p>
              <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
                From SOS to response tracking
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Every emergency follows a clear flow so users, volunteers, police,
                and admins know what is happening in real time.
              </p>
            </div>

            <div className="space-y-4">
              {workflow.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-950">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-teal-50 p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-700">
                Security
              </p>
              <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
                Secure by design
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                The authentication system protects user accounts and separates access
                based on responsibility.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {securityFeatures.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-white p-4">
                  <ShieldCheck className="text-teal-700" size={22} />
                  <span className="text-sm font-bold text-slate-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl text-center"
        >
          <Clock className="mx-auto text-teal-300" size={42} />
          <h2 className="mt-5 text-3xl font-black sm:text-4xl">
            Start building the emergency response system
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Create your account, verify your email, and open the dashboard for your role.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="rounded-xl bg-teal-400 px-6 py-4 text-sm font-black text-slate-950 hover:bg-teal-300"
            >
              Register Now
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-white/20 px-6 py-4 text-sm font-black text-white hover:bg-white/10"
            >
              Login
            </Link>
          </div>
        </motion.div>
      </section>
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-700">
              bSafe Style Features
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              Real-world safety tools for emergency situations
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              These features make the app useful in real situations, not only for login
              and dashboard access.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {realWorldSafetyFeatures.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ y: -6 }}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
              >
                <h3 className="text-xl font-black text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {feature.text}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <h2 className="text-2xl font-black">SafeCircle</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
              A women safety platform for SOS alerts, live location sharing,
              trusted contacts, volunteer response, police coordination, and
              community safety reporting.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-teal-200">
                JWT Secure
              </span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-teal-200">
                OTP Verified
              </span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-teal-200">
                Role Based
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-teal-300">
              Platform
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>SOS Alerts</li>
              <li>Live Tracking</li>
              <li>Safe Route</li>
              <li>Nearby Help</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-teal-300">
              Roles
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>User</li>
              <li>Volunteer</li>
              <li>Police</li>
              <li>Admin</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-teal-300">
              Account
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>
                <Link to="/register" className="hover:text-white">
                  Register
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/forgot-password" className="hover:text-white">
                  Forgot Password
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 SafeCircle. All rights reserved.</p>
          <p>Emergency-ready safety network platform.</p>
        </div>
      </footer>
    </main>
  );
}