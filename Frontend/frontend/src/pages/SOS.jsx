import { useEffect, useState } from "react";
import { useEmergencyTracking } from "../context/EmergencyTrackingContext";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  PhoneCall,
  Radio,
  History,
  AlertTriangle,
  ShieldAlert,
  Activity,
  CheckCircle2,
  ExternalLink,
  Mail,
  Clock,
  Download,
} from "lucide-react";
import StatusMessage from "../components/StatusMessage";
import { emergencyApi } from "../api/emergencyApi";
import { socket } from "../socket";
import alone from '../assets/ALoneimg.png'

export default function SOSPage() {
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username") || "Unknown User";
  const email = localStorage.getItem("email") || "";

  const navigate = useNavigate();
  const { startTracking, stopTracking, emergencyId } = useEmergencyTracking();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [pdfError, setPdfError] = useState("");

  const handleDownloadPdf = async (emergencyId) => {
    setPdfError("");
    try {
      const response = await emergencyApi.exportPdf(emergencyId);
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `incident-report-${emergencyId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      if (err.response?.status === 403) {
        setPdfError("Downloading incident reports is a Pro feature — upgrade to unlock it.");
      } else {
        setPdfError("Failed to download report. Please try again.");
      }
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await emergencyApi.getEmergencyHistory(userId);
      setHistory(response.data.emergencies || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load emergency history");
    }
  };

  useEffect(() => {
    if (userId) {
      fetchHistory();
    }

    const onNewEmergency = (data) => {
      setLiveAlerts((prev) => [data.emergency, ...prev]);
    };

    const onEmergencyResolved = (data) => {
      setLiveAlerts((prev) =>
        prev.map((alert) =>
          alert._id === data.emergency._id ? data.emergency : alert
        )
      );

      setHistory((prev) =>
        prev.map((alert) =>
          alert._id === data.emergency._id ? data.emergency : alert
        )
      );

      if (emergencyId === data.emergency._id) {
        stopTracking();
      }
    };

    socket.on("new-emergency", onNewEmergency);
    socket.on("emergency-resolved", onEmergencyResolved);

    return () => {
      socket.off("new-emergency", onNewEmergency);
      socket.off("emergency-resolved", onEmergencyResolved);
    };
  }, [userId, emergencyId]);

  const triggerSOS = () => {
    setError("");
    setMessage("");

    if (!userId) {
      setError("User not found. Please login again.");
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
         const response = await emergencyApi.createEmergency(userId, {
            username,
            email,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            message: "SOS emergency triggered",
          });

          setMessage(response.data.message || "SOS alert sent successfully");

          setMessage(response.data.message || "SOS alert sent successfully");
          setHistory((prev) => [response.data.emergency, ...prev]);
          startTracking(response.data.emergency._id);
        } catch (err) {
          setError(err.response?.data?.message || "Failed to send SOS alert");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setError("Location permission denied. Please allow location access.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const openMap = (latitude, longitude) => {
    window.open(
      `https://www.google.com/maps?q=${latitude},${longitude}`,
      "_blank"
    );
  };

  const openLiveTracking = (id) => {
    navigate(`/live-tracking/${id}`);
  };

  return (
    <main className="min-h-screen bg-[#f8f6ee] text-[#2c3e2e] font-sans pb-16">
      {/* Hero Header Banner */}
      <header className="relative bg-[#2e4f32] text-white pt-12 pb-24 px-6 text-center overflow-hidden">
        {/* Subtle Background Image Mask */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <img
            src={alone}
            alt="Safety Background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Navigation Bar */}
        <nav className="max-w-5xl mx-auto flex items-center justify-between pb-8 border-b border-white/20 text-xs font-semibold tracking-wider uppercase">
          <div className="flex items-center gap-2 text-lg font-black tracking-widest text-[#a8d59d]">
            <ShieldAlert size={22} />
            <span>SAFEHER</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-[#a8d59d] transition-colors">Home</Link>
            <Link to="/about" className="hover:text-[#a8d59d] transition-colors">About Us</Link>
            <Link to="/dashboard/user" className="hover:text-[#a8d59d] transition-colors">Dashboard</Link>
            <Link to="/sos" className="text-[#a8d59d] font-bold">SOS Center</Link>
          </div>
        </nav>

        {/* Header Hero Content */}
        <div className="relative z-10 max-w-2xl mx-auto mt-8">
          <span className="inline-block border border-white/30 rounded-full px-5 py-1 text-xs font-semibold tracking-wide bg-white/10 mb-4">
            Rapid Response Hub
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Emergency Contacts
          </h1>
          <p className="mt-3 text-sm text-emerald-100/80 leading-relaxed max-w-lg mx-auto">
            Broadcast live alerts and share real-time GPS locations instantly with your trusted network.
          </p>
        </div>

        {/* Torn/Wavy Bottom Paper Divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none z-20">
          <svg
            className="relative block w-full h-12 text-[#f8f6ee]"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 C150,90 350,-40 500,65 C650,170 900,-20 1200,40 L1200,120 L0,120 Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-6 -mt-12 relative z-30 space-y-12">
        {/* Top 3 Info & Action Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Phone Support / Fake Call */}
          <div className="bg-[#f0ece1] border-2 border-dashed border-[#d8d0ba] rounded-3xl p-6 text-center flex flex-col items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#2e4f32] text-white flex items-center justify-center mb-4 shadow">
              <PhoneCall size={20} />
            </div>
            <h3 className="font-extrabold text-lg text-[#2e4f32]">
              Fake Call Escort
            </h3>
            <p className="text-xs text-[#5a6b5c] mt-2 leading-relaxed">
              Simulate an incoming phone call to help exit uncomfortable situations discreetly.
            </p>
            <Link
              to="/fake-call"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#2e4f32] hover:underline"
            >
              <span>Trigger Call</span> →
            </Link>
          </div>

          {/* Card 2: Main Dynamic SOS Button */}
          <div className="bg-[#2e4f32] text-white border-2 border-dashed border-[#446b49] rounded-3xl p-6 text-center flex flex-col items-center justify-between shadow-lg">
            <div className="w-12 h-12 rounded-full bg-[#a8d59d] text-[#2e4f32] flex items-center justify-center mb-2 shadow">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#a8d59d]">
                Send SOS Alert
              </h3>
              <p className="text-xs text-emerald-100/70 mt-1 leading-relaxed">
                Press to send live location coordinates immediately.
              </p>
            </div>

            <motion.button
              whileHover={!loading ? { scale: 1.05 } : {}}
              whileTap={!loading ? { scale: 0.95 } : {}}
              onClick={triggerSOS}
              disabled={loading}
              className="mt-4 px-6 py-2.5 rounded-full bg-[#8cc63f] hover:bg-[#7bb335] text-[#1c331e] font-extrabold text-xs uppercase tracking-wider shadow transition-all disabled:opacity-50"
            >
              {loading ? "Sending Signal..." : "Trigger SOS Now"}
            </motion.button>
          </div>

          {/* Card 3: Location / Map Link */}
          <div className="bg-[#f0ece1] border-2 border-dashed border-[#d8d0ba] rounded-3xl p-6 text-center flex flex-col items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-[#2e4f32] text-white flex items-center justify-center mb-4 shadow">
              <MapPin size={20} />
            </div>
            <h3 className="font-extrabold text-lg text-[#2e4f32]">
              Emergency Network
            </h3>
            <p className="text-xs text-[#5a6b5c] mt-2 leading-relaxed">
              Active tracking monitoring center for nearby security services and contacts.
            </p>
            <Link
              to="/safe-route"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#2e4f32] hover:underline"
            >
              <span className="mt-5 text-xs font-bold text-[#2e4f32]">
                GPS Live Signal Active
              </span>
            </Link>

          </div>
        </section>

        {/* Feedback Messages */}
        <div className="space-y-3">
          {message && <StatusMessage type="success">{message}</StatusMessage>}
          {error && <StatusMessage type="error">{error}</StatusMessage>}
        </div>

        {/* Bottom Section: Working Time / Details & History Card */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Information & Map Preview */}
          <div className="md:col-span-5 space-y-6">
            <div>
              <span className="inline-block border border-[#d8d0ba] rounded-full px-4 py-1 text-[11px] font-bold text-[#2e4f32] bg-[#f0ece1]">
                System Info
              </span>
              <h2 className="text-2xl font-extrabold text-[#2e4f32] mt-2">
                Get In Touch !
              </h2>
              <p className="text-xs text-[#5a6b5c] mt-2 leading-relaxed">
                Emergency services operate 24/7. Instant broadcasts automatically alert registered responders.
              </p>
            </div>

            {/* Operating Hours */}
            <div className="space-y-2 text-xs font-medium text-[#3b4e3e] bg-white p-4 rounded-2xl border border-[#e5dfce]">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#8cc63f]" />
                <span>Monday - Sunday : 24/7 Active Monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#8cc63f]" />
                <span>{email || "support@safeher.com"}</span>
              </div>
            </div>

            {/* Map Preview Card */}
            <div>
              <h4 className="text-xs font-bold text-[#2e4f32] uppercase tracking-wider mb-2">
                Location Preview:
              </h4>
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#d8d0ba] shadow-sm h-48 bg-[#e8e4d8]">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600"
                  alt="Map Location"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-white text-[11px] font-semibold text-[#2e4f32] shadow-sm flex items-center gap-1.5">
                  <MapPin size={13} className="text-red-500" />
                  <span>GPS System Connected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Broadcasts & Emergency History Log */}
          <div className="md:col-span-7 bg-white rounded-3xl border border-[#e5dfce] p-6 shadow-sm space-y-6">
            {/* Live Alerts Panel */}
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-[#f0ece1]">
                <Radio size={18} className="text-red-500 animate-pulse" />
                <h3 className="font-extrabold text-base text-[#2e4f32]">
                  Live Emergency Broadcasts
                </h3>
              </div>

              <div className="mt-3 space-y-3 max-h-48 overflow-y-auto pr-1">
                {liveAlerts.length === 0 ? (
                  <p className="text-xs text-[#8a9a8c] text-center py-6">
                    No active emergency broadcasts at this time.
                  </p>
                ) : (
                  liveAlerts.map((alert) => (
                    <div
                      key={alert._id}
                      className="p-3.5 rounded-2xl bg-[#f0ece1] border border-[#d8d0ba] flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="text-xs font-extrabold text-[#2e4f32]">
                          {alert.username}
                        </span>
                        <p className="text-[11px] text-[#5a6b5c]">
                          {alert.message}
                        </p>
                      </div>
                      <button
                        onClick={() => openLiveTracking(alert._id)}
                        className="px-3 py-1.5 rounded-full bg-[#8cc63f] hover:bg-[#7bb335] text-[#1c331e] text-[11px] font-bold shrink-0"
                      >
                        Track Live
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* History Log Panel */}
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-[#f0ece1]">
                <History size={18} className="text-[#2e4f32]" />
                <h3 className="font-extrabold text-base text-[#2e4f32]">
                  Emergency History Log
                </h3>
              </div>

              {pdfError && (
                <p className="text-[10px] text-red-600 mt-1">{pdfError}</p>
              )}

              <div className="mt-3 space-y-3 max-h-56 overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <p className="text-xs text-[#8a9a8c] text-center py-6">
                    No historical emergency logs found.
                  </p>
                ) : (
                  history.map((alert) => (
                    <div
                      key={alert._id}
                      className="p-3.5 rounded-2xl bg-[#faf8f2] border border-[#e5dfce] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#2e4f32] truncate">
                            {alert.message}
                          </span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase ${alert.status?.toLowerCase() === "active"
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-800"
                              }`}
                          >
                            {alert.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8a9a8c] block mt-0.5">
                          {new Date(alert.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleDownloadPdf(alert._id)}
                          className="p-2 rounded-xl bg-[#e8e4d8] hover:bg-[#d8d0ba] text-[#2e4f32] transition-colors"
                          aria-label="Download incident report PDF"
                          title="Download incident report (Pro)"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() =>
                            alert.status?.toLowerCase() === "active"
                              ? openLiveTracking(alert._id)
                              : openMap(alert.latitude, alert.longitude)
                          }
                          className="p-2 rounded-xl bg-[#e8e4d8] hover:bg-[#d8d0ba] text-[#2e4f32] transition-colors"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}