import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Radio, MapPin, ArrowLeft } from "lucide-react";
import { socket } from "../socket";
import LiveTrackingMap from "../pages/LiveTrackingMap";
import { emergencyApi } from "../api/emergencyApi";

export default function LiveTrackingPage() {
  const { emergencyId } = useParams();

  const [position, setPosition] = useState({ latitude: null, longitude: null });
  const [username, setUsername] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [connected, setConnected] = useState(socket.connected);

  // Load the emergency's last known position so the map isn't empty
  // before the first live "location-update" event arrives.
  useEffect(() => {
    emergencyApi
      .getAllEmergencies()
      .then((res) => {
        const match = (res.data.emergencies || []).find((e) => e._id === emergencyId);
        if (match) {
          setPosition({ latitude: match.latitude, longitude: match.longitude });
          setUsername(match.username);
        }
      })
      .catch(() => {});
  }, [emergencyId]);

  useEffect(() => {
    if (!emergencyId) return;

    socket.emit("join-emergency-room", emergencyId);

    const onConnect = () => {
      setConnected(true);
      socket.emit("join-emergency-room", emergencyId);
    };
    const onDisconnect = () => setConnected(false);

    const onLocationUpdate = (data) => {
      if (data.emergencyId !== emergencyId) return;
      setPosition({ latitude: data.latitude, longitude: data.longitude });
      setLastUpdated(data.timestamp);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("location-update", onLocationUpdate);

    return () => {
      socket.emit("leave-emergency-room", emergencyId);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("location-update", onLocationUpdate);
    };
  }, [emergencyId]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black px-4 py-12 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          to="/sos"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to SOS
        </Link>

        <section className="rounded-3xl border border-red-500/20 bg-slate-900/60 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Radio size={18} className="text-red-400 animate-pulse" />
              <h1 className="text-xl font-bold">
                Live Tracking{username ? ` — ${username}` : ""}
              </h1>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                connected
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {connected ? "Live" : "Reconnecting…"}
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            {lastUpdated
              ? `Last update: ${new Date(lastUpdated).toLocaleTimeString()}`
              : "Waiting for the first location update…"}
          </p>

          <div className="mt-5">
            <LiveTrackingMap
              latitude={position.latitude}
              longitude={position.longitude}
              label={username || "Emergency"}
              height={460}
            />
          </div>

          {position.latitude != null && (
            <button
              onClick={() =>
                window.open(
                  `https://www.google.com/maps?q=${position.latitude},${position.longitude}`,
                  "_blank"
                )
              }
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 px-4 py-2 text-xs font-bold text-white transition-all"
            >
              <MapPin size={13} />
              Open in Google Maps
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
