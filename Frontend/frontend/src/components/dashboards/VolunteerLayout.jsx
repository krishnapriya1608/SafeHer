import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { emergencyApi } from "../../api/emergencyApi";
import { socket } from "../../socket";
import { distanceMeters } from "../../utils/geo";
import NearbyAlertsMap from "../../components/NearbyAlertsMap";
import StatusMessage from "../../components/StatusMessage";

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const volunteerId = localStorage.getItem("userId");
  const volunteerName = localStorage.getItem("username") || "Volunteer";

  const [self, setSelf] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [priorityAlerts, setPriorityAlerts] = useState([]);
  const [needHelpAlerts, setNeedHelpAlerts] = useState([]); // ← moved here, with other hooks
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [acceptingId, setAcceptingId] = useState(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => setSelf({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    updateLocation();
    const interval = setInterval(updateLocation, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (self) {
      socket.emit("update-location", { lat: self.lat, lng: self.lng });
    }
  }, [self]);

  const loadEmergencies = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await emergencyApi.getAllEmergencies();
      setEmergencies(response.data.emergencies || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load emergencies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmergencies();

    const onNew = (data) => setEmergencies((prev) => [data.emergency, ...prev]);
    const onUpdate = (data) =>
      setEmergencies((prev) => prev.map((e) => (e._id === data.emergency._id ? data.emergency : e)));
    const onLocation = (data) =>
      setEmergencies((prev) =>
        prev.map((e) =>
          e._id === data.emergencyId
            ? { ...e, latitude: data.latitude, longitude: data.longitude }
            : e
        )
      );
    const onPriority = (data) =>
      setPriorityAlerts((prev) => {
        const withoutDupe = prev.filter((p) => p.emergency._id !== data.emergency._id);
        return [{ ...data, receivedAt: Date.now() }, ...withoutDupe].slice(0, 5);
      });
    // ← moved here: check-in listener, alongside the other socket listeners
    const onCheckin = (data) =>
      setNeedHelpAlerts((prev) => [
        data.emergency,
        ...prev.filter((e) => e._id !== data.emergency._id),
      ]);

    socket.on("new-emergency", onNew);
    socket.on("emergency-resolved", onUpdate);
    socket.on("emergency-accepted", onUpdate);
    socket.on("location-update", onLocation);
    socket.on("priority-emergency", onPriority);
    socket.on("new-checkin", onCheckin);

    return () => {
      socket.off("new-emergency", onNew);
      socket.off("emergency-resolved", onUpdate);
      socket.off("emergency-accepted", onUpdate);
      socket.off("location-update", onLocation);
      socket.off("priority-emergency", onPriority);
      socket.off("new-checkin", onCheckin);
    };
  }, []);

  const withDistance = useMemo(() => {
    return emergencies.map((e) => ({
      ...e,
      distanceKm: self ? distanceMeters([self.lat, self.lng], [e.latitude, e.longitude]) / 1000 : null,
    }));
  }, [emergencies, self]);

  const newAlerts = withDistance
    .filter((e) => e.status?.toLowerCase() === "active" && !e.acceptedBy)
    .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

  const activeEmergencyIds = new Set(newAlerts.map((e) => e._id));
  const activePriorityAlerts = priorityAlerts.filter((p) =>
    activeEmergencyIds.has(p.emergency._id)
  );

  const acceptedByMe = withDistance.filter(
    (e) => e.status?.toLowerCase() === "active" && e.acceptedBy === volunteerId
  );

  const completedByMe = withDistance.filter(
    (e) => e.status?.toLowerCase() === "resolved" && e.acceptedBy === volunteerId
  );

  const handleAccept = async (emergencyId) => {
    setAcceptingId(emergencyId);
    setError("");
    setMessage("");
    try {
      const response = await emergencyApi.acceptEmergency(emergencyId, {
        volunteerId,
        volunteerName,
      });
      setMessage(response.data.message || "Case accepted");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept case");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleResolve = async (emergencyId) => {
    setError("");
    setMessage("");
    try {
      const response = await emergencyApi.resolveEmergency(emergencyId);
      setMessage(response.data.message || "Marked resolved");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resolve case");
    }
  };

  const handleAcknowledgeCheckin = async (alertId) => {
    try {
      await emergencyApi.acknowledgeCheckin(alertId);
      setNeedHelpAlerts((prev) => prev.filter((a) => a._id !== alertId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to acknowledge check-in");
    }
  };

  const mapAlerts = [...newAlerts, ...acceptedByMe];

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 md:py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-3xl bg-blue-900 p-8 text-white">
          <h1 className="text-4xl font-bold">Volunteer Dashboard</h1>
          <p className="mt-2">
            Welcome, {volunteerName}. Respond to nearby SOS alerts and assist users.
          </p>
        </section>

        {(message || error) && (
          <div className="space-y-2">
            {message && <StatusMessage type="success">{message}</StatusMessage>}
            {error && <StatusMessage type="error">{error}</StatusMessage>}
          </div>
        )}

        <section className="grid md:grid-cols-3 gap-5">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-semibold text-stone-500">New Alerts</h2>
            <p className="text-3xl font-bold text-stone-900">{newAlerts.length}</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-semibold text-stone-500">Accepted Cases</h2>
            <p className="text-3xl font-bold text-stone-900">{acceptedByMe.length}</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-sm font-semibold text-stone-500">Completed</h2>
            <p className="text-3xl font-bold text-stone-900">{completedByMe.length}</p>
          </div>
        </section>

        {/* Accepted by me — active cases this volunteer is handling right now */}
        {acceptedByMe.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
              Your Active Cases
            </h2>
            {acceptedByMe.map((alert) => (
              <div key={alert._id} className="rounded-xl bg-white p-5 shadow">
                <h2 className="font-bold">🚨 SOS Alert — You accepted this</h2>
                <p>User : {alert.username}</p>
                {alert.phone && (
                  <p>
                    Phone :{" "}
                    <a href={`tel:${alert.phone}`} className="text-blue-700 underline font-semibold">
                      {alert.phone}
                    </a>
                  </p>
                )}
                {alert.medicalNotes && (
                  <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1 mt-1">
                    ⚕ Medical notes: {alert.medicalNotes}
                  </p>
                )}
                <p>
                  Distance :{" "}
                  {alert.distanceKm != null ? `${alert.distanceKm.toFixed(1)} km` : "Unknown"}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => navigate(`/live-tracking/${alert._id}`)}
                    className="rounded bg-blue-600 px-4 py-2 text-white text-sm font-semibold"
                  >
                    Track Live
                  </button>
                  <button
                    onClick={() => handleResolve(alert._id)}
                    className="rounded border border-emerald-600 px-4 py-2 text-emerald-700 text-sm font-semibold"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Priority Alerts — Pro users' SOS, pushed directly to nearby responders */}
        {activePriorityAlerts.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              ⚡ Priority Alerts Near You
            </h2>
            {activePriorityAlerts.map((p) => (
              <div
                key={p.emergency._id}
                className="rounded-xl bg-amber-50 border-2 border-amber-400 p-5 shadow"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-amber-900">🚨 Priority SOS — respond fast</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full">
                    {(p.distanceMeters / 1000).toFixed(1)} km away
                  </span>
                </div>
                <p className="text-sm text-amber-900 mt-1">User: {p.emergency.username}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleAccept(p.emergency._id)}
                    disabled={acceptingId === p.emergency._id}
                    className="rounded bg-amber-600 hover:bg-amber-700 px-4 py-2 text-white text-sm font-semibold disabled:opacity-50"
                  >
                    {acceptingId === p.emergency._id ? "Accepting…" : "Accept"}
                  </button>
                  <button
                    onClick={() => navigate(`/live-tracking/${p.emergency._id}`)}
                    className="rounded border border-amber-600 px-4 py-2 text-amber-800 text-sm font-semibold"
                  >
                    Track Live
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Need Help / Check-in Requests — lower urgency than SOS */}
        {needHelpAlerts.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
              Check-in Requests
            </h2>
            {needHelpAlerts.map((alert) => (
              <div key={alert._id} className="rounded-xl bg-blue-50 border border-blue-300 p-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-blue-900">
                    💬 {alert.username} requested a check-in
                  </p>
                  <button
                    onClick={() => handleAcknowledgeCheckin(alert._id)}
                    className="rounded bg-blue-600 px-3 py-1.5 text-white text-xs font-semibold"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* SOS Cards — new, unclaimed alerts, nearest first */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
            New SOS Alerts
          </h2>

          {loading ? (
            <p className="text-sm text-zinc-500">Loading…</p>
          ) : newAlerts.length === 0 ? (
            <div className="rounded-xl bg-white p-5 shadow text-sm text-stone-500">
              No unclaimed alerts right now.
            </div>
          ) : (
            newAlerts.map((alert) => (
              <div key={alert._id} className="rounded-xl bg-white p-5 shadow">
                <h2 className="font-bold">🚨 SOS Alert</h2>
                <p>User : {alert.username}</p>
                {alert.phone && (
                  <p>
                    Phone :{" "}
                    <a href={`tel:${alert.phone}`} className="text-blue-700 underline font-semibold">
                      {alert.phone}
                    </a>
                  </p>
                )}
                {alert.medicalNotes && (
                  <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1 mt-1">
                    ⚕ Medical notes: {alert.medicalNotes}
                  </p>
                )}
                <p>
                  Distance :{" "}
                  {alert.distanceKm != null ? `${alert.distanceKm.toFixed(1)} km` : "Unknown"}
                </p>
                {alert.message && <p className="text-sm text-stone-500 italic">"{alert.message}"</p>}

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleAccept(alert._id)}
                    disabled={acceptingId === alert._id}
                    className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                  >
                    {acceptingId === alert._id ? "Accepting…" : "Accept"}
                  </button>
                  <button
                    onClick={() => navigate(`/live-tracking/${alert._id}`)}
                    className="rounded border border-blue-600 px-4 py-2 text-blue-700 text-sm font-semibold"
                  >
                    Track Live
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="rounded-xl bg-white p-5 shadow">
          <h2 className="font-bold mb-3">Nearby Alerts Map</h2>
          <NearbyAlertsMap self={self} alerts={mapAlerts} />
          {!self && (
            <p className="mt-2 text-xs text-stone-400">
              Allow location access to see your position and distances to each alert.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}