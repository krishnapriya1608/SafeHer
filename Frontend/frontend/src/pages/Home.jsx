import { useEffect, useState, useRef, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Siren,
  MapPinned,
  ArrowRight,
  PhoneCall,
  FileWarning,
  Route,
  Bot,
  Building2,
  Camera,
  Activity,
  CheckCircle2,
  ChevronRight,
  Shield,
  Radio,
} from "lucide-react";

import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import dash2 from "../assets/dash2.png";
import personal from "../assets/personal.png";
import Community from "../assets/Community.png";
import response from "../assets/Response.png";
import dash3 from "../assets/dash3.png";
import followme from "../assets/followme.png";
import banner from "../assets/Bannerimg.png";
import FloatingAIAssistant from "../components/FloatingAIAssistant";
import coverimg from "../assets/Coverimg.jpg";

gsap.registerPlugin(ScrollTrigger, useGSAP);

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
  { title: "SOS Button", text: "A large emergency trigger that instantly broadcasts live location data to trusted contacts and response units.", image: personal },
  { title: "Live Location Sharing", text: "Share real-time movement continuously during night travel or high-risk transit situations.", image: dash2 },
  { title: "Fake Call Escapes", text: "Trigger a realistic incoming call interface to give you a discreet exit from uncomfortable settings.", image: response },
  { title: "Follow Me Companion", text: "Designated guardians can track your route progress live until your safe arrival is confirmed.", image: followme },
  { title: "Voice Activation", text: "Broadcast an alert hands-free using custom secret voice phrases during urgent moments.", image: dash3 },
  { title: "Safety Timers", text: "Set a timed countdown. Automatic emergency signals deploy if the timer expires unverified.", image: Community },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showIntro, setShowIntro] = useState(true);

  const mainRef = useRef(null);
  const aboutRef = useRef(null);
  const sageRef = useRef(null);
  const featuresRef = useRef(null);
  const workflowRef = useRef(null);
  const ctaRef = useRef(null);
  const rolesRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  useGSAP(
    () => {
      if (showIntro || !mainRef.current) return;

      // 1. Hero Entrance Animations
      gsap.fromTo(
        ".hero-img-center",
        { scale: 1.2, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" }
      );

      gsap.fromTo(
        ".hero-card-left",
        { x: -100, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2, delay: 0.2, ease: "power3.out" }
      );

      gsap.fromTo(
        ".hero-card-right",
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2, delay: 0.2, ease: "power3.out" }
      );

      // 2. ScrollTrigger Config for Content Sections
      const scrollSections = [
        { ref: aboutRef, target: ".gsap-fade-up", y: 50 },
        { ref: sageRef, target: ".gsap-sage-item", y: 50 },
        { ref: featuresRef, target: ".gsap-feature-card", y: 50 },
        { ref: workflowRef, target: ".gsap-workflow-step", x: -40 },
        { ref: workflowRef, target: ".gsap-module-card", y: 40 },
        { ref: ctaRef, target: ".gsap-cta-content", y: 50 },
        { ref: rolesRef, target: ".gsap-role-card", y: 60 },
      ];

      scrollSections.forEach(({ ref, target, y, x }) => {
        if (!ref.current) return;
        const elements = ref.current.querySelectorAll(target);
        if (!elements.length) return;

        gsap.fromTo(
          elements,
          { opacity: 0, y: y || 0, x: x || 0 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.9,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // Timeout forces recalculation after layout settles
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);

      return () => clearTimeout(timer);
    },
    { scope: mainRef, dependencies: [showIntro] }
  );

  return (
    <div className="relative min-h-screen bg-[#f8f5f0] text-[#2c2e2b] font-serif selection:bg-[#2b3d17] selection:text-[#f8f5f0] overflow-x-hidden">
      <AnimatePresence mode="wait">
        {showIntro ? (
          <motion.div
            key="intro-splash-police-running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            onClick={() => setShowIntro(false)}
            className="fixed inset-0 z-50 w-full h-full cursor-pointer bg-black"
          >
            <img
              src={coverimg}
              alt="Woman running to police station safeguards"
              className="w-full h-full object-cover filter contrast-105"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!showIntro && (
        <main ref={mainRef}>
          {/* SECTION 1: EDITORIAL HEADER & HERO BANNER */}
          <section className="relative w-full bg-[#9aa88d] text-[#0a0a0a] py-20 px-6 md:px-12 overflow-hidden">
            <Logo />
            <FloatingAIAssistant userId={user?._id} />
            <div className="mx-auto max-w-5xl space-y-12">

              {/* Asymmetrical Collage Visuals */}
              <div className="relative w-full max-w-3xl mx-auto h-[380px] sm:h-[460px]">

                {/* Main Center Image */}
                <div className="hero-img-center absolute left-1/2 top-0 -translate-x-1/2 w-[65%] sm:w-[55%] h-full overflow-hidden shadow-md">
                  <img
                    src={banner}
                    alt="SafeCircle Main"
                    className="w-full h-full object-cover filter grayscale contrast-110"
                  />
                </div>

                {/* Floating Left Detail Accent Card */}
                <div className="hero-card-left absolute left-2 sm:left-6 bottom-8 w-[32%] sm:w-[28%] h-[40%] sm:h-[48%] overflow-hidden shadow-lg border-2 border-[#f3f1ec]">
                  <img
                    src={response}
                    alt="Detail view left"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Right Detail Accent Card */}
                <div className="hero-card-right absolute right-2 sm:right-6 top-10 w-[30%] sm:w-[26%] h-[45%] sm:h-[50%] overflow-hidden shadow-lg border-2 border-[#f3f1ec]">
                  <img
                    src={personal}
                    alt="Detail view right"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Editorial Header Section */}
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <p className="text-[10px] sm:text-[11px] font-sans tracking-[0.35em] uppercase text-stone-900 font-medium">
                  Emergency Response Network
                </p>

                <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-wider uppercase text-[#0a0908]">
                  Meet SafeCircle Network
                </h1>
              </div>

              {/* Two-Column Editorial Copy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto font-serif text-xs leading-relaxed text-stone-200/90 text-justify">
                <p>
                  SafeCircle reimagines personal safety through an interconnected emergency response framework. By pairing low-latency location intelligence with automated distress signals, our system provides continuous monitoring and direct action when seconds count.
                </p>
                <p>
                  Built with discretion and user autonomy at its core, SafeCircle establishes an active perimeter of trust. Connect your primary circle, configure custom alert thresholds, and navigate daily journeys with total peace of mind.
                </p>
              </div>

              {/* Footer Tagline & Action Buttons */}
              <div className="flex flex-col items-center space-y-6 pt-2">
                <p className="text-[10px] sm:text-[11px] font-sans tracking-[0.25em] uppercase font-light text-stone-100 text-center max-w-xl">
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
                  <button
                    onClick={() => navigate('/subscription')}
                    className="px-8 py-2.5 rounded-full border border-[#22201f] text-[#22201f] text-xs uppercase tracking-widest hover:bg-[#22201f] hover:text-[#f3f1ec] transition duration-300 hover:scale-105 shadow-sm cursor-pointer"
                  >
                    Pricing
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* SECTION 2: EDITORIAL ABOUT / COLLAGE SECTION */}
          <section ref={aboutRef} className="bg-[#f8f5f0] py-28 px-6 md:px-16">
            <div className="mx-auto max-w-5xl space-y-24">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
                <div className="md:col-span-7 space-y-6 pt-4 gsap-fade-up">
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

                <div className="md:col-span-5 flex justify-end gsap-fade-up">
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
                <div className="md:col-span-7 flex items-end gap-4 gsap-fade-up">
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

                <div className="md:col-span-5 space-y-4 md:pb-6 gsap-fade-up">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light tracking-wide text-[#2c2e2b]">
                    Real-Time <br />
                    <span className="italic">Connectivity</span>
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 border-t border-stone-300/60 font-sans text-xs md:text-sm font-light text-[#565952] leading-relaxed gsap-fade-up">
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
          <section ref={sageRef} className="bg-[#4e5844] text-[#f8f5f0] py-28 px-6 md:px-12 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-[#f8f5f0]/20 to-transparent" />

            <div className="mx-auto max-w-6xl space-y-20">
              <div className="text-center space-y-4 max-w-3xl mx-auto gsap-sage-item">
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

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-6 relative gsap-sage-item">
                  <div className="relative z-10 w-full max-w-md mx-auto lg:max-w-none h-[420px] overflow-hidden border border-[#f8f5f0]/20 shadow-2xl">
                    <img
                      src={dash2}
                      alt="Safe passage overview"
                      className="w-full h-full object-cover filter brightness-95 contrast-105 transition-transform duration-700 hover:scale-105"
                    />
                  </div>

                  <div className="hidden md:block absolute -bottom-8 -right-4 z-20 w-48 h-56 border-2 border-[#4e5844] overflow-hidden shadow-xl bg-[#3b4334]">
                    <img
                      src={dash3}
                      alt="Community vigil"
                      className="w-full h-full object-cover filter grayscale contrast-125"
                    />
                  </div>
                </div>

                <div className="lg:col-span-6 space-y-8 pl-0 lg:pl-6 gsap-sage-item">
                  <div className="space-y-4">
                    <h3 className="text-xl md:text-2xl font-serif tracking-wide text-amber-50">
                      Redefining Safety Through Intentional Architecture
                    </h3>
                    <p className="font-sans text-xs md:text-sm font-light text-stone-200/80 leading-relaxed">
                      Safety isn't just about calling for help—it's about creating an active perimeter of trust before panic sets in. SafeCircle bridges personal autonomy and community protection through real-time telemetry and structured local response.
                    </p>
                  </div>

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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-[#f8f5f0]/15 text-center font-sans gsap-sage-item">
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
          <section ref={featuresRef} className="bg-[#e8e1d7] py-24 px-6 md:px-12 border-t border-[#2b2d26]/10">
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
                    className="gsap-feature-card bg-[#dfd7cc] p-6 border border-[#2b2d26]/10 flex flex-col justify-between transition hover:border-[#2b2d26]/40"
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
          <section ref={workflowRef} className="bg-[#2b2d26] text-[#e8e1d7] py-24 px-6 md:px-12">
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
                    <div key={step.title} className="gsap-workflow-step border-b border-[#e8e1d7]/15 pb-4">
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
                    const card = (
                      <div className="gsap-module-card p-5 border border-[#e8e1d7]/15 bg-[#34372e] flex flex-col justify-between h-full">
                        <div>
                          <Icon className="text-amber-200/80 mb-4" size={20} />
                          <h4 className="text-sm font-serif uppercase tracking-wider mb-2">{m.title}</h4>
                          <p className="font-sans text-xs font-light text-[#a4a99b] leading-relaxed">
                            {m.text}
                          </p>
                        </div>
                      </div>
                    );
                    return m.title === "AI Assistant" ? (
                      <Link to="/ai-safety" key={m.title}>
                        {card}
                      </Link>
                    ) : (
                      <Fragment key={m.title}>{card}</Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* CALL-TO-ACTION BANNER */}
          <section ref={ctaRef} className="text-black py-28 px-6 md:px-12 border-t border-[#f8f5f0]/10">
            <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center gsap-cta-content">

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
          <section ref={rolesRef} className="bg-[#5b6851] text-[#e8e1d7] py-24 px-6 md:px-12">
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
                  <div key={roleItem.title} className="gsap-role-card group flex flex-col">
                    <div className="h-64 overflow-hidden mb-6 border border-[#e8e1d7]/20">
                      <img
                        src={roleItem.img}
                        alt={roleItem.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                    </div>
                    <p className="text-[10px] font-sans tracking-widest uppercase opacity-60">0{idx + 1}</p>
                    <h3 className="text-lg font-serif uppercase tracking-wide my-2">{roleItem.title}</h3>
                    <p className="font-sans text-xs font-light text-[#d0cbc2] leading-relaxed">
                      {roleItem.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}