import { useEffect, useRef, useState } from "react";
import { useEmergencyTracking } from "../context/EmergencyTrackingContext";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, PhoneCall, Radio, History, AlertTriangle } from "lucide-react"; // Highly recommended for clean icons
import StatusMessage from "../components/StatusMessage";
import { emergencyApi } from "../api/emergencyApi";
import { socket } from "../socket";

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
          const payload = {
            userId,
            username,
            email,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            message: "SOS emergency triggered",
          };

          const response = await emergencyApi.createEmergency(payload);

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

  const openLiveTracking = (emergencyId) => {
    navigate(`/live-tracking/${emergencyId}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black px-4 py-12 text-white selection:bg-red-500 selection:text-white">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Main SOS Control Panel */}
        <section className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-slate-900/60 p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(239,68,68,0.1)]">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-red-600/10 blur-3xl" />

          <div className="relative flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              Phase 5 · Live Tracking
            </span>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              SOS Emergency System
            </h1>

            <p className="mt-2 max-w-md text-sm text-slate-400">
              Trigger instant emergency alerts with real-time live location broadcasted to your network.
            </p>

            {/* Glowing SOS Button */}
            <div className="relative mt-10 flex items-center justify-center">
              {!loading && (
                <div className="absolute inset-0 h-44 w-44 rounded-full bg-red-600/30 blur-2xl animate-pulse" />
              )}
              <motion.button
                whileHover={!loading ? { scale: 1.05 } : {}}
                whileTap={!loading ? { scale: 0.95 } : {}}
                onClick={triggerSOS}
                disabled={loading}
                className="relative z-10 h-44 w-44 rounded-full border-[6px] border-red-500/40 bg-gradient-to-tr from-red-700 to-red-500 text-4xl font-black tracking-wider text-white shadow-2xl transition-all duration-300 hover:border-red-400/60 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center"
              >
                {loading ? (
                  <span className="flex gap-1 items-center">
                    <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" />
                  </span>
                ) : (
                  "SOS"
                )}
              </motion.button>
            </div>

            {/* Quick Action Actions */}
            <div className="mt-8 w-full border-t border-slate-800/80 pt-6 flex justify-center">
              <Link
                to="/fake-call"
                className="group flex items-center gap-2 rounded-2xl border border-slate-850 bg-slate-950/60 px-6 py-3 text-sm font-semibold text-slate-350 hover:text-white transition-all duration-300 hover:border-red-500/30 hover:bg-slate-900"
              >
                <PhoneCall size={16} className="text-red-400 transition-transform group-hover:scale-110" />
                Simulate a Fake Call
              </Link>
            </div>
          </div>
        </section>

        {/* Feedback Messages */}
        <div className="space-y-3">
          {message && <StatusMessage type="success">{message}</StatusMessage>}
          {error && <StatusMessage type="error">{error}</StatusMessage>}
        </div>

        {/* Bottom Split Dashboards */}
        <section className="grid gap-6 md:grid-cols-2">

          {/* Live Alerts Panel */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md flex flex-col">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-850">
              <Radio size={18} className="text-red-400 animate-pulse" />
              <h2 className="text-lg font-bold text-slate-100">Live Emergency Broadcast</h2>
            </div>

            <div className="mt-4 flex-1 space-y-3 overflow-y-auto max-h-[350px] pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {liveAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                  <AlertTriangle size={32} className="opacity-25 mb-2" />
                  <p className="text-sm">No active emergency broadcasts at this time.</p>
                </div>
              ) : (
                liveAlerts.map((alert) => (
                  <div
                    key={alert._id}
                    className="group relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-500/5 to-transparent p-4 transition-all hover:border-red-500/40"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-red-200 text-sm">
                          {alert.username}
                        </h3>
                        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                          {alert.message}
                        </p>
                      </div>
                      <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider animate-pulse">
                        Live
                      </span>
                    </div>

                    <button
                      onClick={() => openLiveTracking(alert._id)}
                      className="mt-3 flex items-center gap-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 px-4 py-2 text-xs font-bold text-white transition-all shadow-md hover:shadow-red-900/30"
                    >
                      <MapPin size={13} />
                      Track Live
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Emergency History Panel */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md flex flex-col">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-850">
              <History size={18} className="text-slate-400" />
              <h2 className="text-lg font-bold text-slate-100">Emergency History</h2>
            </div>

            <div className="mt-4 flex-1 space-y-3 overflow-y-auto max-h-[350px] pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                  <History size={32} className="opacity-25 mb-2" />
                  <p className="text-sm">No historical log found.</p>
                </div>
              ) : (
                history.map((alert) => (
                  <div
                    key={alert._id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-sm text-slate-200">
                        {alert.message}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          alert.status?.toLowerCase() === "active"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>

                    <button
                      onClick={() =>
                        alert.status?.toLowerCase() === "active"
                          ? openLiveTracking(alert._id)
                          : openMap(alert.latitude, alert.longitude)
                      }
                      className="mt-3 flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/50 px-3.5 py-1.5 text-xs font-semibold text-slate-350 hover:text-white hover:bg-slate-800 transition-all"
                    >
                      <MapPin size={12} />
                      {alert.status?.toLowerCase() === "active" ? "Track Live" : "Open Map"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}