import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StatusMessage from "../components/StatusMessage";
import { emergencyApi } from "../api/emergencyApi";
import { socket } from "../socket";

export default function SOSPage() {
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username") || "Unknown User";
  const email = localStorage.getItem("email") || "";

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

    socket.on("new-emergency", (data) => {
      setLiveAlerts((prev) => [data.emergency, ...prev]);
    });

    socket.on("emergency-resolved", (data) => {
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
    });

    return () => {
      socket.off("new-emergency");
      socket.off("emergency-resolved");
    };
  }, [userId]);

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

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-red-500/20 bg-slate-900 p-8 shadow-xl">
          <p className="text-xs font-bold uppercase tracking-wider text-red-400">
            Phase 4
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            SOS Emergency System
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Trigger emergency alerts with live location and real-time broadcast.
          </p>

          <div className="mt-8 flex justify-center">
            <motion.button
              whileTap={!loading ? { scale: 0.95 } : {}}
              onClick={triggerSOS}
              disabled={loading}
              className="h-48 w-48 rounded-full border-8 border-red-400/30 bg-red-600 text-4xl font-black text-white shadow-2xl shadow-red-600/40 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "..." : "SOS"}
            </motion.button>
          </div>
        </section>

        {message && <StatusMessage type="success">{message}</StatusMessage>}
        {error && <StatusMessage type="error">{error}</StatusMessage>}

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">Live Emergency Broadcast</h2>

            <div className="mt-5 space-y-3">
              {liveAlerts.length === 0 && (
                <p className="text-sm text-slate-400">
                  No live emergency broadcasts yet.
                </p>
              )}

              {liveAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4"
                >
                  <h3 className="font-semibold text-red-300">
                    {alert.username}
                  </h3>

                  <p className="mt-1 text-sm text-slate-300">
                    {alert.message}
                  </p>

                  <button
                    onClick={() => openMap(alert.latitude, alert.longitude)}
                    className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-700"
                  >
                    View Location
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">Emergency History</h2>

            <div className="mt-5 space-y-3">
              {history.length === 0 && (
                <p className="text-sm text-slate-400">
                  No emergency history found.
                </p>
              )}

              {history.map((alert) => (
                <div
                  key={alert._id}
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold">{alert.message}</h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        alert.status === "active"
                          ? "bg-red-500/10 text-red-300"
                          : "bg-emerald-500/10 text-emerald-300"
                      }`}
                    >
                      {alert.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>

                  <button
                    onClick={() => openMap(alert.latitude, alert.longitude)}
                    className="mt-3 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
                  >
                    Open Map
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}