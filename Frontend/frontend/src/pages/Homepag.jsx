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
  Building2,
  Camera,
  Activity,
  CheckCircle2,
  Clock,
  ChevronRight,
} from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { dashboardPathForRole } from "../utils/roles";
import dash2 from '../assets/dash2.png'
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

const realWorldSafetyFeatures = [
  {
    title: "SOS Button",
    text: "A large emergency trigger that instantly broadcasts live location data to trusted contacts and response units.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
  },
  {
    title: "Live Location Sharing",
    text: "Share real-time movement continuously during night travel or high-risk transit situations.",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600",
  },
  {
    title: "Fake Call Escapes",
    text: "Trigger a realistic incoming call interface to give you a discreet exit from uncomfortable settings.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600",
  },
  {
    title: "Follow Me Companion",
    text: "Designated guardians can track your route progress live until your safe arrival is confirmed.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600",
  },
  {
    title: "Voice Activation",
    text: "Broadcast an alert hands-free using custom secret voice phrases during urgent moments.",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=600",
  },
  {
    title: "Safety Timers",
    text: "Set a timed countdown. Automatic emergency signals deploy if the timer expires unverified.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
  },
];

const features = [
  {
    icon: Siren,
    title: "One-Tap SOS",
    text: "Broadcast emergency alerts with precise geolocation directly to network responders.",
  },
  {
    icon: MapPinned,
    title: "Live Geolocation",
    text: "Continuous geographic tracking providing immediate route mapping for help teams.",
  },
  {
    icon: Users,
    title: "Trusted Network",
    text: "Manage designated emergency contacts to receive instant SMS and email broadcasts.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Gateways",
    text: "Role-differentiated access secured by encrypted authentication standards.",
  },
  {
    icon: HeartHandshake,
    title: "Community First-Responders",
    text: "Nearby verified volunteers receive immediate callouts to assist before official arrival.",
  },
  {
    icon: BarChart3,
    title: "Incident Intelligence",
    text: "Map unsafe density patterns and response metrics to optimize safety routing.",
  },
];

const modules = [
  { icon: PhoneCall, title: "Emergency Circles", text: "Instant communication channels with primary contacts." },
  { icon: FileWarning, title: "Community Reports", text: "Log lighting gaps, stalking incidents, and unsafe areas." },
  { icon: Route, title: "Safe Passages", text: "Intelligent navigation prioritizing well-lit, populated routes." },
  { icon: Bot, title: "AI Assistant", text: "On-demand guidance for personal safety and emergency protocol." },
  { icon: Building2, title: "Help Hub Locator", text: "Instant mapping to local police, clinics, and safe havens." },
  { icon: Camera, title: "Evidence Locker", text: "Securely document incident photography with automatic timestamps." },
];

const workflow = [
  { icon: Siren, title: "01. SOS Triggered", text: "Single press activates encrypted location broadcast." },
  { icon: Activity, title: "02. Network Broadcast", text: "Local responders and contacts receive immediate alerts." },
  { icon: MapPinned, title: "03. Real-Time Tracking", text: "Live position updates streamed to authorized monitors." },
  { icon: CheckCircle2, title: "04. Resolution Logged", text: "Incident secured, audited, and logged into safety metrics." },
];

const roles = [
  { title: "User", text: "Trigger emergency broadcasts, track routes, manage personal circles.", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400" },
  { title: "Volunteer", text: "Receive localized alerts to provide immediate physical support.", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" },
  { title: "Police", text: "Coordinate active emergency dispatches and track incident progress.", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400" },
  { title: "Admin", text: "Maintain platform safety, user verification, and analytical reports.", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400" },
];

export default function Home() {
  const { isAuthenticated, role } = useAuth();

  return (
    <main className="min-h-screen bg-[#e8e1d7] text-[#2b2d26] font-serif selection:bg-[#4d5940] selection:text-[#e8e1d7]">
      {/* SECTION 1: HERO SECTION */}
      <section className="relative min-h-[90vh] bg-[url('https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=1800')] bg-cover bg-center text-[#e8e1d7] flex flex-col justify-between">
        <div className="absolute inset-0 bg-black/40 backdrop-brightness-90" />

        {/* Navigation */}
        <nav className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-8">
          <div className="tracking-widest uppercase text-sm font-light">
            <Logo />
          </div>
          <div className="flex items-center gap-6 text-xs uppercase tracking-widest font-sans">
            {isAuthenticated ? (
              <Link
                className="rounded-full bg-[#e8e1d7] px-6 py-2.5 font-medium text-[#2b2d26] transition hover:bg-white"
                to={dashboardPathForRole(role)}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link className="hover:text-amber-100 transition" to="/login">
                  Login
                </Link>
                <Link
                  className="rounded-full border border-[#e8e1d7]/40 px-6 py-2.5 transition hover:bg-[#e8e1d7] hover:text-[#2b2d26]"
                  to="/register"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-xs font-sans tracking-[0.3em] uppercase text-amber-100/80 mb-4">
            A New Standard for Personal Safety
          </p>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal italic tracking-wide leading-tight uppercase font-serif">
            Empowering Protection <br />
            <span className="not-italic text-2xl md:text-4xl lg:text-5xl block mt-2 font-light tracking-widest">
              THROUGH REAL-TIME CONNECTIVITY
            </span>
          </h1>
          <p className="mt-8 text-sm md:text-base font-sans font-light tracking-wide max-w-xl mx-auto text-amber-50/80 leading-relaxed">
            An interconnected emergency response framework pairing location tracking with instant community and authority dispatches.
          </p>
          <div className="mt-10 flex justify-center gap-4 text-xs font-sans uppercase tracking-widest">
            <Link
              to="/register"
              className="rounded-full bg-[#d6705b] px-8 py-3.5 text-white transition hover:bg-[#c25e4a]"
            >
              Get Started
            </Link>
          </div>
        </div>

        <div className="relative z-10 pb-8 text-center text-[10px] font-sans tracking-widest uppercase opacity-60">
          Scroll to explore network features
        </div>
      </section>

      {/* SECTION 2: ARCHED & OFFSET COLLAGE (WARM SAND BACKGROUND) */}
      <section className="bg-[#e8e1d7] py-24 px-6 md:px-12">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Offset Collaged Photos */}
          <div className="lg:col-span-5 relative flex justify-center items-center min-h-[420px]">
            {/* Arched Photo */}
            <div className="w-52 h-72 rounded-t-full overflow-hidden shadow-xl border-4 border-[#e8e1d7] absolute -top-4 left-4 z-10">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"
                alt="Safe walk"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Overlapping Rectangular Photo */}
            <div className="w-56 h-72 overflow-hidden shadow-2xl border-4 border-[#e8e1d7] absolute top-12 right-2 z-20">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600"
                alt="Community response"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6">
            <p className="text-xs font-sans tracking-[0.25em] uppercase text-[#a35c4e]">
              Reimagining Peace of Mind
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl uppercase tracking-wider font-serif font-light leading-snug">
              Every individual deserves <br />
              <span className="italic">uncompromised movement</span> & security.
            </h2>
            <div className="w-12 h-[1px] bg-[#2b2d26]/30 my-4" />
            <p className="font-sans text-xs md:text-sm font-light leading-relaxed text-[#4a4d42] max-w-lg">
              Built on fast JWT authentication and instant GPS triggers, our safety suite transforms how alerts reach families, emergency responders, and community volunteers.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-block rounded-full bg-[#d6705b] px-8 py-3 text-xs font-sans uppercase tracking-widest text-white transition hover:bg-[#c25e4a]"
              >
                Join SafeCircle
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: FULL WIDTH SUN-DAPPLED CINEMATIC BANNER */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img
          src={dash2}
          alt="Sunlight shadow editorial"
          className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-8 md:p-16">
          <p className="text-white font-serif text-xl md:text-3xl italic tracking-wide max-w-xl">
            "Protection is not a feature—it's a fundamental freedom."
          </p>
        </div>
      </section>

      {/* SECTION 4: SAGE GREEN EDITORIAL SECTION */}
      <section className="bg-[#5b6851] text-[#e8e1d7] py-24 px-6 md:px-12">
        <div className="mx-auto max-w-6xl">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-sans tracking-[0.3em] uppercase text-amber-200/70">
              Personalized Ecosystem
            </h2>
            <p className="text-2xl md:text-4xl font-serif italic tracking-wide uppercase">
              Roles Tailored for Instant Action
            </p>
            <div className="w-8 h-[1px] bg-amber-200/30 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {roles.map((roleItem, idx) => (
              <div key={roleItem.title} className="group flex flex-col">
                <div className="h-64 overflow-hidden mb-6 border border-[#e8e1d7]/20">
                  <img
                    src={roleItem.img}
                    alt={roleItem.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
                <p className="text-[10px] font-sans tracking-widest uppercase opacity-60">0{idx + 1}</p>
                <h3 className="text-xl font-serif uppercase tracking-wider mb-2">{roleItem.title}</h3>
                <p className="font-sans text-xs font-light text-[#d0d6c9] leading-relaxed">
                  {roleItem.text}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 5: REAL-WORLD SAFETY FEATURES */}
      <section className="bg-[#e8e1d7] py-24 px-6 md:px-12 border-t border-[#2b2d26]/10">
        <div className="mx-auto max-w-6xl">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-xs font-sans tracking-[0.25em] uppercase text-[#a35c4e] mb-2">
                Ecosystem
              </p>
              <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-wider">
                Purpose-Built Tools
              </h2>
            </div>
            <p className="font-sans text-xs max-w-xs text-[#525648] leading-relaxed">
              Designed around real-world emergencies, ensuring seamless operation when every second counts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {realWorldSafetyFeatures.map((item) => (
              <div
                key={item.title}
                className="bg-[#dfd7cc] p-6 border border-[#2b2d26]/10 flex flex-col justify-between transition hover:border-[#2b2d26]/40"
              >
                <div>
                  <div className="h-44 overflow-hidden mb-6 filter contrast-95">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-serif uppercase tracking-wide mb-3">{item.title}</h3>
                  <p className="font-sans text-xs font-light text-[#4a4d42] leading-relaxed mb-6">
                    {item.text}
                  </p>
                </div>
                <div className="pt-4 border-t border-[#2b2d26]/10 flex justify-between items-center text-[10px] font-sans tracking-widest uppercase text-[#a35c4e]">
                  <span>Active Module</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 6: WORKFLOW & MODULES LIST */}
      <section className="bg-[#2b2d26] text-[#e8e1d7] py-24 px-6 md:px-12">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left: Process */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <p className="text-xs font-sans tracking-[0.3em] uppercase text-amber-200/60 mb-2">
                Operational Flow
              </p>
              <h2 className="text-3xl font-serif uppercase tracking-wide">
                How Emergency <br /> Response Activates
              </h2>
            </div>

            <div className="space-y-6 pt-4">
              {workflow.map((step) => (
                <div key={step.title} className="border-b border-[#e8e1d7]/15 pb-4">
                  <h3 className="text-sm font-sans tracking-widest uppercase text-amber-100/90 mb-1">
                    {step.title}
                  </h3>
                  <p className="font-sans text-xs font-light text-[#b3b8aa] leading-relaxed">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Platform Modules Grid */}
          <div className="lg:col-span-7">
            <p className="text-xs font-sans tracking-[0.3em] uppercase text-amber-200/60 mb-6">
              Extended Protection
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((m) => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.title}
                    className="p-5 border border-[#e8e1d7]/15 bg-[#34372e] flex flex-col justify-between"
                  >
                    <div>
                      <Icon className="text-amber-200/80 mb-4" size={20} />
                      <h4 className="text-sm font-serif uppercase tracking-wider mb-2">{m.title}</h4>
                      <p className="font-sans text-xs font-light text-[#a4a99b] leading-relaxed">
                        {m.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1e201b] text-[#e8e1d7] py-16 px-6 md:px-12 border-t border-white/5 font-sans">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-10 text-xs">
          <div className="space-y-4">
            <h3 className="font-serif text-lg uppercase tracking-widest">SafeCircle</h3>
            <p className="font-light text-[#929688] leading-relaxed">
              An editorial approach to safety infrastructure. Connecting users, guardians, and local authorities seamlessly.
            </p>
          </div>

          <div>
            <h4 className="uppercase tracking-widest text-amber-200/70 mb-4">Navigation</h4>
            <ul className="space-y-2 font-light text-[#b3b8aa]">
              <li><Link to="/login" className="hover:text-white">Login</Link></li>
              <li><Link to="/register" className="hover:text-white">Register</Link></li>
              <li><Link to="/forgot-password" className="hover:text-white">Recovery</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="uppercase tracking-widest text-amber-200/70 mb-4">Architecture</h4>
            <ul className="space-y-2 font-light text-[#b3b8aa]">
              <li>JWT Protection</li>
              <li>Geolocation Stream</li>
              <li>Role Access Control</li>
            </ul>
          </div>

          <div>
            <h4 className="uppercase tracking-widest text-amber-200/70 mb-4">Direct Contact</h4>
            <p className="font-light text-[#b3b8aa] leading-relaxed mb-4">
              24/7 Monitoring & System Support.
            </p>
            <Link
              to="/register"
              className="inline-block rounded-full bg-[#d6705b] px-6 py-2.5 text-[10px] uppercase tracking-widest text-white hover:bg-[#c25e4a]"
            >
              Get Started
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-6xl mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between text-[10px] tracking-widest uppercase text-[#737769]">
          <p>© 2026 SafeCircle Network. All rights reserved.</p>
          <p>Earth Tone Editorial Layout System</p>
        </div>
      </footer>
    </main>
  );
}