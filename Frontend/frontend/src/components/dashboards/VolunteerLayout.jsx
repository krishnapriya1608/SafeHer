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
  const [needHelpAlerts, setNeedHelpAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [acceptingId, setAcceptingId] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/login");
  };

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
    const onCheckin = (data) =>
      setNeedHelpAlerts((prev) => [
        data.emergency,
        ...prev.filter((e) => e._id !== data.emergency._id),
      ]);
    const onEscalate = (data) =>
      setEmergencies((prev) => prev.map((e) => (e._id === data.emergency._id ? data.emergency : e)));

    socket.on("new-emergency", onNew);
    socket.on("emergency-resolved", onUpdate);
    socket.on("emergency-accepted", onUpdate);
    socket.on("location-update", onLocation);
    socket.on("priority-emergency", onPriority);
    socket.on("new-checkin", onCheckin);
    socket.on("emergency-escalated", onEscalate);

    return () => {
      socket.off("new-emergency", onNew);
      socket.off("emergency-resolved", onUpdate);
      socket.off("emergency-accepted", onUpdate);
      socket.off("location-update", onLocation);
      socket.off("priority-emergency", onPriority);
      socket.off("new-checkin", onCheckin);
      socket.off("emergency-escalated", onEscalate);
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

  const handleEscalate = async (emergencyId) => {
    setError("");
    setMessage("");
    try {
      const response = await emergencyApi.escalateEmergency(
        emergencyId,
        "Volunteer requested police backup"
      );
      setMessage(response.data.message || "Escalated to police");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to escalate case");
    }
  };

  const mapAlerts = [...newAlerts, ...acceptedByMe];

  return (
    <div className="min-h-screen bg-[#3a4d39] bg-opacity-[0.95] px-4 py-8 md:py-12 font-serif text-[#2c352e]">
      <div className="mx-auto max-w-9xl space-y-8">
        {/* Banner Section */}
        <section className="rounded-2xl bg-[#fdfbf7] p-8 md:p-10 shadow-lg border border-[#e2dacb] text-[#2c352e] relative overflow-hidden flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4f644e]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-sans font-semibold text-[#6b7c6a]">
              Community Support
            </span>
            <h1 className="text-3xl md:text-4xl font-normal mt-1 tracking-wide text-[#1f2921]">
              Volunteer Dashboard
            </h1>
            <p className="mt-2 text-stone-600 font-sans text-sm md:text-base leading-relaxed">
              Welcome, <span className="font-semibold text-[#3a4d39]">{volunteerName}</span>. Respond to nearby SOS alerts and bring tranquility to your community.
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="z-10 self-start md:self-auto font-sans text-xs uppercase tracking-wider font-semibold text-[#702929] border border-[#e8c4c4] bg-[#f9ebeb] hover:bg-[#a14040] hover:text-white px-5 py-2.5 rounded-lg transition-colors duration-200"
          >
            Logout
          </button>
        </section>

        {(message || error) && (
          <div className="space-y-2 font-sans">
            {message && <StatusMessage type="success">{message}</StatusMessage>}
            {error && <StatusMessage type="error">{error}</StatusMessage>}
          </div>
        )}

        {/* Stats Grid */}
        <section className="grid md:grid-cols-3 gap-5 font-sans">
          <div className="rounded-xl bg-[#fdfbf7] p-6 shadow-md border border-[#e2dacb]">
            <h2 className="text-xs font-semibold text-[#6b7c6a] uppercase tracking-wider">New Alerts</h2>
            <p className="text-3xl font-light text-[#1f2921] mt-2">{newAlerts.length}</p>
          </div>
          <div className="rounded-xl bg-[#fdfbf7] p-6 shadow-md border border-[#e2dacb]">
            <h2 className="text-xs font-semibold text-[#6b7c6a] uppercase tracking-wider">Accepted Cases</h2>
            <p className="text-3xl font-light text-[#1f2921] mt-2">{acceptedByMe.length}</p>
          </div>
          <div className="rounded-xl bg-[#fdfbf7] p-6 shadow-md border border-[#e2dacb]">
            <h2 className="text-xs font-semibold text-[#6b7c6a] uppercase tracking-wider">Completed</h2>
            <p className="text-3xl font-light text-[#1f2921] mt-2">{completedByMe.length}</p>
          </div>
        </section>

        {/* Accepted Cases */}
        {acceptedByMe.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs font-sans font-bold text-[#e8e2d5] uppercase tracking-[0.15em]">
              Your Active Cases
            </h2>
            {acceptedByMe.map((alert) => (
              <div key={alert._id} className="rounded-xl bg-[#fdfbf7] p-6 shadow-md border border-[#e2dacb] font-sans">
                <h2 className="font-serif text-lg font-medium text-[#2c352e]">🚨 SOS Alert — You accepted this</h2>
                <div className="mt-2 text-sm text-stone-700 space-y-1">
                  <p><span className="font-semibold text-[#3a4d39]">User:</span> {alert.username}</p>
                  {alert.phone && (
                    <p>
                      <span className="font-semibold text-[#3a4d39]">Phone:</span>{" "}
                      <a href={`tel:${alert.phone}`} className="text-[#3a4d39] underline font-semibold hover:text-[#2c352e]">
                        {alert.phone}
                      </a>
                    </p>
                  )}
                  {alert.medicalNotes && (
                    <p className="text-xs text-[#702929] bg-[#f9ebeb] border border-[#e8c4c4] rounded px-3 py-2 mt-2">
                      ⚕ Medical notes: {alert.medicalNotes}
                    </p>
                  )}
                  <p><span className="font-semibold text-[#3a4d39]">Distance:</span> {alert.distanceKm != null ? `${alert.distanceKm.toFixed(1)} km` : "Unknown"}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => navigate(`/live-tracking/${alert._id}`)}
                    className="rounded-lg bg-[#3a4d39] hover:bg-[#2c352e] px-4 py-2 text-[#fdfbf7] font-semibold transition"
                  >
                    Track Live
                  </button>
                  <button
                    onClick={() => handleResolve(alert._id)}
                    className="rounded-lg border border-[#3a4d39] text-[#3a4d39] hover:bg-[#3a4d39]/10 px-4 py-2 font-semibold transition"
                  >
                    Mark Resolved
                  </button>
                  {alert.escalated ? (
                    <span className="rounded-lg bg-[#f9ebeb] border border-[#e8c4c4] px-4 py-2 text-[#702929] font-semibold flex items-center">
                      🚓 Escalated to police
                    </span>
                  ) : (
                    <button
                      onClick={() => handleEscalate(alert._id)}
                      className="rounded-lg border border-[#a14040] text-[#a14040] hover:bg-[#a14040]/10 px-4 py-2 font-semibold transition"
                    >
                      Escalate to Police
                    </button>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Priority Alerts */}
        {activePriorityAlerts.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-sans font-bold text-[#f1dca7] uppercase tracking-[0.15em] flex items-center gap-1.5">
              ⚡ Priority Alerts Near You
            </h2>
            {activePriorityAlerts.map((p) => (
              <div
                key={p.emergency._id}
                className="rounded-xl bg-[#fcf8ed] border-2 border-[#d1a656] p-6 shadow-md font-sans"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg text-[#5c4314]">🚨 Priority SOS — respond fast</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c4314] bg-[#f0dfb8] px-2.5 py-1 rounded-full">
                    {(p.distanceMeters / 1000).toFixed(1)} km away
                  </span>
                </div>
                <p className="text-sm text-[#5c4314] mt-2">User: <span className="font-medium">{p.emergency.username}</span></p>
                <div className="mt-4 flex gap-2 text-xs">
                  <button
                    onClick={() => handleAccept(p.emergency._id)}
                    disabled={acceptingId === p.emergency._id}
                    className="rounded-lg bg-[#d1a656] hover:bg-[#b58c3e] text-[#2c352e] font-semibold px-4 py-2 disabled:opacity-50 transition"
                  >
                    {acceptingId === p.emergency._id ? "Accepting…" : "Accept"}
                  </button>
                  <button
                    onClick={() => navigate(`/live-tracking/${p.emergency._id}`)}
                    className="rounded-lg border border-[#d1a656] text-[#5c4314] hover:bg-[#d1a656]/20 px-4 py-2 font-semibold transition"
                  >
                    Track Live
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Need Help / Check-in Requests */}
        {needHelpAlerts.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-sans font-bold text-[#e8e2d5] uppercase tracking-[0.15em]">
              Check-in Requests
            </h2>
            {needHelpAlerts.map((alert) => (
              <div key={alert._id} className="rounded-xl bg-[#fdfbf7] border border-[#e2dacb] p-4 shadow-sm font-sans">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-[#2c352e]">
                    💬 <span className="font-semibold text-[#3a4d39]">{alert.username}</span> requested a check-in
                  </p>
                  <button
                    onClick={() => handleAcknowledgeCheckin(alert._id)}
                    className="rounded-lg bg-[#3a4d39] hover:bg-[#2c352e] px-3 py-1.5 text-xs text-[#fdfbf7] font-semibold transition"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* SOS Cards — Unclaimed Alerts */}
        <section className="space-y-4">
          <h2 className="text-xs font-sans font-bold text-[#e8e2d5] uppercase tracking-[0.15em]">
            New SOS Alerts
          </h2>

          {loading ? (
            <p className="text-sm font-sans text-[#e8e2d5]">Loading…</p>
          ) : newAlerts.length === 0 ? (
            <div className="rounded-xl bg-[#fdfbf7] p-6 shadow border border-[#e2dacb] text-sm font-sans text-stone-500">
              No unclaimed alerts right now.
            </div>
          ) : (
            newAlerts.map((alert) => (
              <div key={alert._id} className="rounded-xl bg-[#fdfbf7] p-6 shadow-md border border-[#e2dacb] font-sans">
                <h2 className="font-serif text-lg font-medium text-[#2c352e]">🚨 SOS Alert</h2>
                <div className="mt-2 text-sm text-stone-700 space-y-1">
                  <p><span className="font-semibold text-[#3a4d39]">User:</span> {alert.username}</p>
                  {alert.phone && (
                    <p>
                      <span className="font-semibold text-[#3a4d39]">Phone:</span>{" "}
                      <a href={`tel:${alert.phone}`} className="text-[#3a4d39] underline font-semibold hover:text-[#2c352e]">
                        {alert.phone}
                      </a>
                    </p>
                  )}
                  {alert.medicalNotes && (
                    <p className="text-xs text-[#702929] bg-[#f9ebeb] border border-[#e8c4c4] rounded px-3 py-2 mt-2">
                      ⚕ Medical notes: {alert.medicalNotes}
                    </p>
                  )}
                  <p><span className="font-semibold text-[#3a4d39]">Distance:</span> {alert.distanceKm != null ? `${alert.distanceKm.toFixed(1)} km` : "Unknown"}</p>
                  {alert.message && <p className="text-xs text-stone-500 italic mt-1">"{alert.message}"</p>}
                </div>

                <div className="mt-4 flex gap-2 text-xs">
                  <button
                    onClick={() => handleAccept(alert._id)}
                    disabled={acceptingId === alert._id}
                    className="rounded-lg bg-[#3a4d39] hover:bg-[#2c352e] text-[#fdfbf7] font-semibold px-4 py-2 disabled:opacity-50 transition"
                  >
                    {acceptingId === alert._id ? "Accepting…" : "Accept"}
                  </button>
                  <button
                    onClick={() => navigate(`/live-tracking/${alert._id}`)}
                    className="rounded-lg border border-[#3a4d39] text-[#3a4d39] hover:bg-[#3a4d39]/10 px-4 py-2 font-semibold transition"
                  >
                    Track Live
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Map Section */}
        <section className="rounded-2xl bg-[#fdfbf7] p-6 shadow-lg border border-[#e2dacb]">
          <h2 className="font-serif text-xl text-[#1f2921] mb-4">Nearby Alerts Map</h2>
          <div className="rounded-xl overflow-hidden border border-[#e2dacb]">
            <NearbyAlertsMap self={self} alerts={mapAlerts} />
          </div>
          {!self && (
            <p className="mt-3 text-xs font-sans text-stone-500">
              Allow location access to see your position and distances to each alert.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}