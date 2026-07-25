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
  Shield,
  Radio,
} from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { dashboardPathForRole } from "../utils/roles";
import dash2 from "../assets/dash2.png";
import personal from '../assets/personal.png'
import Community from '../assets/Community.png'
import response from '../assets/Response.png'
import dash3 from '../assets/dash3.png'
import followme from '../assets/followme.png'
import banner from '../assets/Bannerimg.png'
import { useNavigate } from "react-router-dom";
const modules = [
  { icon: PhoneCall, title: "Emergency Circles", text: "Instant communication channels with primary contacts." },
  { icon: FileWarning, title: "Community Reports", text: "Log lighting gaps, stalking incidents, and unsafe areas." },
  { icon: Route, title: "Safe Passages", text: "Intelligent navigation prioritizing well-lit, populated routes." },
  { icon: Bot, title: "AI Assistant", text: "On-demand guidance for personal safety and emergency protocol." },
  { icon: Building2, title: "Help Hub Locator", text: "Instant mapping to local police, clinics, and safe havens." },
  { icon: Camera, title: "Evidence Locker", text: "Securely document incident photography with automatic timestamps." },
];

const roles = [
  { title: "User", text: "Trigger emergency broadcasts, track routes, manage personal circles.", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400" },
  { title: "Volunteer", text: "Receive localized alerts to provide immediate physical support.", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" },
  { title: "Police", text: "Coordinate active emergency dispatches and track incident progress.", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400" },
  { title: "Admin", text: "Maintain platform safety, user verification, and analytical reports.", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400" },
];

const workflow = [
  { icon: Siren, title: "01. SOS Triggered", text: "Single press activates encrypted location broadcast." },
  { icon: Activity, title: "02. Network Broadcast", text: "Local responders and contacts receive immediate alerts." },
  { icon: MapPinned, title: "03. Real-Time Tracking", text: "Live position updates streamed to authorized monitors." },
  { icon: CheckCircle2, title: "04. Resolution Logged", text: "Incident secured, audited, and logged into safety metrics." },
];


const realWorldSafetyFeatures = [
  {
    title: "SOS Button",
    text: "A large emergency trigger that instantly broadcasts live location data to trusted contacts and response units.",
    image: personal
  },
  {
    title: "Live Location Sharing",
    text: "Share real-time movement continuously during night travel or high-risk transit situations.",
    image: dash2,
  },
  {
    title: "Fake Call Escapes",
    text: "Trigger a realistic incoming call interface to give you a discreet exit from uncomfortable settings.",
    image: response,
  },
  {
    title: "Follow Me Companion",
    text: "Designated guardians can track your route progress live until your safe arrival is confirmed.",
    image: followme
  },
  {
    title: "Voice Activation",
    text: "Broadcast an alert hands-free using custom secret voice phrases during urgent moments.",
    image: dash3,
  },
  {
    title: "Safety Timers",
    text: "Set a timed countdown. Automatic emergency signals deploy if the timer expires unverified.",
    image: Community
  },
];

export default function Home() {
  const navigate=useNavigate()

  const { isAuthenticated, role } = useAuth();

  return (
    <main className="min-h-screen bg-[#f8f5f0] text-[#2c2e2b] font-serif selection:bg-[#4d5940] selection:text-[#f8f5f0]">
      {/* SECTION 1: EDITORIAL HEADER & HERO BANNER */}
    <section className="relative w-full bg-[#c8d6ba] text-[#2c2a29] py-20 px-6 md:px-12 overflow-hidden">
  <Logo/>
  <div className="mx-auto max-w-5xl space-y-12">
   
    
    {/* Asymmetrical Collage Visuals */}
    <div className="relative w-full max-w-3xl mx-auto h-[380px] sm:h-[460px]">
      
      {/* Main Center Image */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[65%] sm:w-[55%] h-full overflow-hidden shadow-md">
        <img
          src={banner}
          alt="SafeCircle Main"
          className="w-full h-full object-cover filter grayscale contrast-110"
        />
      </div>

      {/* Floating Left Detail Accent Card */}
      <div className="absolute left-2 sm:left-6 bottom-8 w-[32%] sm:w-[28%] h-[40%] sm:h-[48%] overflow-hidden shadow-lg border-2 border-[#f3f1ec]">
        <img
          src={response}
          alt="Detail view left"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Floating Right Detail Accent Card */}
      <div className="absolute right-2 sm:right-6 top-10 w-[30%] sm:w-[26%] h-[45%] sm:h-[50%] overflow-hidden shadow-lg border-2 border-[#f3f1ec]">
        <img
          src={personal}
          alt="Detail view right"
          className="w-full h-full object-cover"
        />
      </div>
    </div>

    {/* Editorial Header Section */}
    <div className="text-center space-y-3 max-w-2xl mx-auto">
      <p className="text-[10px] sm:text-[11px] font-sans tracking-[0.35em] uppercase text-stone-500 font-medium">
        Emergency Response Network
      </p>
      
      <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-wider uppercase text-[#22201f]">
        Meet SafeCircle Network
      </h1>
    </div>

    {/* Two-Column Editorial Copy */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto font-serif text-xs leading-relaxed text-stone-600/90 text-justify">
      <p>
        SafeCircle reimagines personal safety through an interconnected emergency response framework. By pairing low-latency location intelligence with automated distress signals, our system provides continuous monitoring and direct action when seconds count.
      </p>
      <p>
        Built with discretion and user autonomy at its core, SafeCircle establishes an active perimeter of trust. Connect your primary circle, configure custom alert thresholds, and navigate daily journeys with total peace of mind.
      </p>
    </div>

    {/* Footer Tagline & Rounded Action Buttons */}
    <div className="flex flex-col items-center space-y-6 pt-2">
      <p className="text-[10px] sm:text-[11px] font-sans tracking-[0.25em] uppercase font-light text-stone-500 text-center max-w-xl">
        Location Intelligence paired with real-time community dispatch
      </p>

      <div className="flex gap-4 items-center justify-center">
        <button 
          onClick={() => navigate('/register')} 
          className="px-8 py-2.5 rounded-full bg-[#22201f] text-[#f3f1ec] text-xs uppercase tracking-widest hover:bg-stone-700 transition duration-300 hover:scale-105 shadow-sm cursor-pointer"
        >
          Register
        </button>
        <button 
          onClick={() => navigate('/login')} 
          className="px-8 py-2.5 rounded-full border border-[#22201f] text-[#22201f] text-xs uppercase tracking-widest hover:bg-[#22201f] hover:text-[#f3f1ec] transition duration-300 hover:scale-105 shadow-sm cursor-pointer"
        >
          Login
        </button>
      </div>
    </div>

  </div>
</section>

      {/* SECTION 2: EDITORIAL ABOUT / COLLAGE SECTION */}
      <section className="bg-[#f8f5f0] py-28 px-6 md:px-16">
        <div className="mx-auto max-w-5xl space-y-24">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-7 space-y-6 pt-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light tracking-wide text-[#2c2e2b]">
                Empowering Protection
              </h2>
              <p className="font-sans text-xs md:text-sm font-light leading-relaxed text-[#565952] max-w-md">
                Every individual deserves uncompromised movement and security. Built on fast JWT authentication and instant GPS triggers, our platform transforms how emergency calls reach families, trusted circles, and local authorities.
              </p>
              <p className="font-sans text-xs md:text-sm font-light leading-relaxed text-[#565952] max-w-md">
                We bridge the gap between initial distress signals and real-time response, bringing peace of mind back to daily commutes and high-risk environments.
              </p>
            </div>

            <div className="md:col-span-5 flex justify-end">
              <div className="w-full max-w-xs h-[340px] overflow-hidden shadow-sm border border-stone-300/40">
                <img
                  src={personal}
                  alt="Personal Security"
                  className="w-full h-full object-cover filter brightness-95"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end pt-8">
            <div className="md:col-span-7 flex items-end gap-4">
              <div className="w-1/2 h-[280px] overflow-hidden shadow-sm border border-stone-300/40">
                <img
                  src={Community}
                  alt="Community Network"
                  className="w-full h-full object-cover filter brightness-95"
                />
              </div>
              <div className="w-2/5 h-[210px] overflow-hidden shadow-sm border border-stone-300/40 mb-2">
                <img
                  src={response}
                  alt="Response Coordination"
                  className="w-full h-full object-cover filter brightness-95"
                />
              </div>
            </div>

            <div className="md:col-span-5 space-y-4 md:pb-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light tracking-wide text-[#2c2e2b]">
                Real-Time <br />
                <span className="italic">Connectivity</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 border-t border-stone-300/60 font-sans text-xs md:text-sm font-light text-[#565952] leading-relaxed">
            <div>
              <p className="uppercase tracking-[0.2em] text-[10px] text-[#8c5042] font-medium mb-3">
                01. Incident Intelligence
              </p>
              <p>
                Integrated with real-time mapping technology, SafeCircle enables instant live tracking that feeds into verified alert hubs for immediate situational awareness.
              </p>
            </div>
            <div>
              <p className="uppercase tracking-[0.2em] text-[10px] text-[#8c5042] font-medium mb-3">
                02. Decentralized Network
              </p>
              <p>
                From designated guardians to nearby community volunteers, safety becomes a collaborative ecosystem built for modern mobile living.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: SAGE GREEN SECTION */}
      <section className="bg-[#4e5844] text-[#f8f5f0] py-28 px-6 md:px-12 relative overflow-hidden">
        {/* Subtle decorative background accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-[#f8f5f0]/20 to-transparent" />

        <div className="mx-auto max-w-6xl space-y-20">
          {/* Header & Subtitle */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2">
              <span className="h-[1px] w-6 bg-[#d6705b]" />
              <p className="text-[10px] font-sans tracking-[0.35em] uppercase text-stone-300/80 font-medium">
                Philosophy & Vision
              </p>
              <span className="h-[1px] w-6 bg-[#d6705b]" />
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-light tracking-wide leading-tight">
              Hello, We Are <span className="italic font-normal text-amber-100">SafeCircle</span>
            </h2>

            <p className="font-sans text-xs md:text-sm font-light tracking-wider text-stone-200/90 max-w-lg mx-auto leading-relaxed">
              Designing emergency response networks with discretion, emotional calm, and uncompromising technical rigor.
            </p>
          </div>

          {/* Main Content Layout: Collage Imagery + Story Column */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Visual Collage Column */}
            <div className="lg:col-span-6 relative">
              <div className="relative z-10 w-full max-w-md mx-auto lg:max-w-none h-[420px] overflow-hidden border border-[#f8f5f0]/20 shadow-2xl">
                <img
                  src={dash2}
                  alt="Safe passage overview"
                  className="w-full h-full object-cover filter brightness-95 contrast-105 transition-transform duration-700 hover:scale-105"
                />
              </div>

              {/* Floating Secondary Image Badge */}
              <div className="hidden md:block absolute -bottom-8 -right-4 z-20 w-48 h-56 border-2 border-[#4e5844] overflow-hidden shadow-xl bg-[#3b4334]">
                <img
                  src={dash3}
                  alt="Community vigil"
                  className="w-full h-full object-cover filter grayscale contrast-125"
                />
              </div>
            </div>

            {/* Editorial Content Column */}
            <div className="lg:col-span-6 space-y-8 pl-0 lg:pl-6">
              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-serif tracking-wide text-amber-50">
                  Redefining Safety Through Intentional Architecture
                </h3>
                <p className="font-sans text-xs md:text-sm font-light text-stone-200/80 leading-relaxed">
                  Safety isn't just about calling for help—it's about creating an active perimeter of trust before panic sets in. SafeCircle bridges personal autonomy and community protection through real-time telemetry and structured local response.
                </p>
              </div>

              {/* Highlight Quote Block */}
              <blockquote className="border-l-2 border-[#d6705b] pl-4 py-1 italic font-serif text-sm md:text-base text-amber-100/90 leading-relaxed">
                "When an emergency strikes, technical precision must meet human empathy in fractions of a second."
              </blockquote>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 font-sans text-xs font-light text-stone-200/80 leading-relaxed">
                <div className="space-y-2 border-t border-[#f8f5f0]/15 pt-4">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#d6705b]">
                    Discrete Intervention
                  </span>
                  <p>
                    Our infrastructure combines low-latency emergency triggers with automated evidence logging, empowering users with tools built specifically for volatile situations.
                  </p>
                </div>

                <div className="space-y-2 border-t border-[#f8f5f0]/15 pt-4">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#d6705b]">
                    Unified Dispatch
                  </span>
                  <p>
                    By combining role-based access with continuous location streaming, we establish an integrated safety standard trusted across communities and dispatch centers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-[#f8f5f0]/15 text-center font-sans">
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-serif text-amber-100 font-light">&lt; 1.2s</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-stone-300/70">Broadcast Latency</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-serif text-amber-100 font-light">100%</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-stone-300/70">Encrypted Signals</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-serif text-amber-100 font-light">24/7</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-stone-300/70">Circle Monitoring</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-serif text-amber-100 font-light">4 Roles</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-stone-300/70">Coordinated Response</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: REAL WORLD SAFETY FEATURES */}
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

      {/* SECTION 5: OPERATIONAL FLOW & MODULES */}
      <section className="bg-[#2b2d26] text-[#e8e1d7] py-24 px-6 md:px-12">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-16">
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

      {/* NEW SECTION: CALL-TO-ACTION & DIRECT ENGAGEMENT BANNER */}
      <section className=" text-black py-28 px-6 md:px-12 border-t border-[#f8f5f0]/10">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Main Headline & Statement Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-[#d6705b]" />
              <p className="text-[11px] font-sans tracking-[0.25em] uppercase text-[#d6705b] font-medium">
                Immediate Onboarding
              </p>
            </div>

            <h2 className="text-3xl md:text-5xl font-serif font-light leading-tight tracking-wide">
              Ready to Strengthen <br />
              <span className="italic font-normal text-amber-800">Your Safety Network?</span>
            </h2>

            <p className="font-sans text-xs md:text-sm font-light leading-relaxed text-stone-500 max-w-xl">
              Whether you are looking to secure your personal transit, join as a verified neighborhood responder, or coordinate community emergency protocols, registration takes less than two minutes.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-5 font-sans">
              <Link
                to="/register"
                className="inline-flex items-center gap-3 rounded-full bg-[#d6705b] px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-[#c25e4a] shadow-md"
              >
                <span>Create An Account</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full border border-[#f8f5f0]/30 px-7 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-[#f8f5f0] transition hover:bg-[#f8f5f0] hover:text-[#2c2e2b]"
              >
                <span>Sign In</span>
              </Link>
            </div>
          </div>

          {/* Side Editorial Highlight Box */}
          <div className="lg:col-span-5">
            <div className="bg-[#2d3328] p-8 md:p-10 border border-[#f8f5f0]/10 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-600/50 pb-4">
                <span className="text-[10px] font-sans tracking-[0.2em] uppercase text-stone-400">
                  Infrastructure Status
                </span>
                <span className="flex items-center gap-2 text-[10px] font-sans tracking-wider text-emerald-400 uppercase">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Monitoring Active
                </span>
              </div>

              <div className="space-y-4 font-sans text-xs font-light text-stone-300">
                <div className="flex items-start gap-3">
                  <Shield size={18} className="text-amber-100 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-serif uppercase text-sm tracking-wide text-amber-50 mb-1">
                      Encrypted Channels
                    </h4>
                    <p className="text-[#a8ad9e]">
                      All emergency broadcasts pass through end-to-end token verification.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <Radio size={18} className="text-amber-100 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-serif uppercase text-sm tracking-wide text-amber-50 mb-1">
                      Zero-Lag Dispatch
                    </h4>
                    <p className="text-[#a8ad9e]">
                      Sub-second geolocation updates pushed directly to registered guardians.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-600/50 flex justify-between items-center text-[10px] font-sans tracking-widest uppercase text-stone-400">
                <span>SafeCircle v2.4</span>
                <span className="text-amber-100/80">24/7 Response Active</span>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* SECTION 6: ROLES */}
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