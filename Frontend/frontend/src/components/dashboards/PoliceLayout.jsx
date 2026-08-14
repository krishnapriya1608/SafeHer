import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { emergencyApi } from "../../api/emergencyApi";
import { socket } from "../../socket";
import { distanceMeters } from "../../utils/geo";
import NearbyAlertsMap from "../../components/NearbyAlertsMap";
import StatusMessage from "../../components/StatusMessage";

export default function PoliceDashboard() {
  const navigate = useNavigate();
  const officerId = localStorage.getItem("userId");
  const officerName = localStorage.getItem("username") || "Officer";

  const [self, setSelf] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [priorityAlerts, setPriorityAlerts] = useState([]);
  const [needHelpAlerts, setNeedHelpAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [acceptingId, setAcceptingId] = useState(null);

  // Officer's current location — refreshed periodically (not just once) so
  // Pro users' priority alerts can be targeted to responders who are
  // actually still nearby, matching the volunteer dashboard's behavior.
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

  // Push location to the server so createEmergency's priority-targeting
  // step (5km radius) can find this officer as a nearby responder.
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

  // Distance (km) computation
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

  // Police-only queue: cases a volunteer explicitly flagged as needing
  // police backup. Still shows even if a volunteer already accepted it —
  // that's the point of escalation, they're asking for backup, not handoff.
  const escalatedCases = withDistance
    .filter((e) => e.escalated && e.status?.toLowerCase() !== "resolved")
    .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

  const acceptedByMe = withDistance.filter(
    (e) => e.status?.toLowerCase() === "active" && e.acceptedBy === officerId
  );

  const completedByMe = withDistance.filter(
    (e) => e.status?.toLowerCase() === "resolved" && e.acceptedBy === officerId
  );

  const handleAccept = async (emergencyId) => {
    setAcceptingId(emergencyId);
    setError("");
    setMessage("");
    try {
      const response = await emergencyApi.acceptEmergency(emergencyId, {
        volunteerId: officerId,
        volunteerName: officerName,
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
    setError("");
    try {
      await emergencyApi.acknowledgeCheckin(alertId);
      setNeedHelpAlerts((prev) => prev.filter((a) => a._id !== alertId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to acknowledge check-in");
    }
  };

  const mapAlerts = [...newAlerts, ...acceptedByMe];

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#1F2A3C] font-serif selection:bg-[#C7D3E8]   ">
      <div className="mx-auto max-w-9xl space-y-16">

        {/* Hero Header Section */}
        <section className="relative bg-[#F5F6F8] p-6 md:p-12 border border-[#DCE1E8] rounded-sm shadow-sm">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="font-serif italic text-3xl md:text-4xl text-[#5A6B85] font-light block tracking-wide">
              welcome back,
            </span>
            <h1 className="text-2xl md:text-4xl font-normal uppercase tracking-[0.2em] text-[#1F2A3C] leading-relaxed">
              {officerName}
            </h1>
            <p className="text-xs md:text-sm text-[#4B5A70] font-sans font-light tracking-widest uppercase leading-relaxed pt-2 border-t border-[#DCE1E8]/60 max-w-xl">
              Monitor live SOS alerts, dispatch response, and coordinate with your area's safety network.
            </p>
          </div>
        </section>

        {(message || error) && (
          <div className="space-y-2 font-sans">
            {message && <StatusMessage type="success">{message}</StatusMessage>}
            {error && <StatusMessage type="error">{error}</StatusMessage>}
          </div>
        )}

        {/* Full-width Muted Banner Section */}
        <section className="bg-[#2C3B57] text-[#F5F6F8] p-10 md:p-14 text-center rounded-sm space-y-6 shadow-sm border border-[#233047]">
          <span className="font-serif italic text-2xl md:text-3xl text-[#C7D3E8] font-light block">
            Current Dashboard Overview
          </span>
          <h2 className="text-sm md:text-base font-sans font-light tracking-[0.25em] uppercase max-w-2xl mx-auto text-[#EBEFF5]/90">
            Real-time status of emergency requests and department response
          </h2>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 max-w-4xl mx-auto">
            <div className="p-6 bg-[#233047]/50 border border-[#4B5A70] rounded-sm backdrop-blur-xs">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#C7D3E8] font-sans block mb-1">
                New Alerts
              </span>
              <p className="text-3xl font-light tracking-wider text-[#F5F6F8]">{newAlerts.length}</p>
            </div>

            <div className="p-6 bg-[#233047]/50 border border-[#4B5A70] rounded-sm backdrop-blur-xs">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#C7D3E8] font-sans block mb-1">
                Active Cases
              </span>
              <p className="text-3xl font-light tracking-wider text-[#F5F6F8]">{acceptedByMe.length}</p>
            </div>

            <div className="p-6 bg-[#4A2C2C]/60 border border-[#8C5A5A] rounded-sm backdrop-blur-xs">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#E8C7C7] font-sans block mb-1">
                Escalated
              </span>
              <p className="text-3xl font-light tracking-wider text-[#F5F6F8]">{escalatedCases.length}</p>
            </div>

            <div className="p-6 bg-[#233047]/50 border border-[#4B5A70] rounded-sm backdrop-blur-xs">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#C7D3E8] font-sans block mb-1">
                Resolved
              </span>
              <p className="text-3xl font-light tracking-wider text-[#F5F6F8]">{completedByMe.length}</p>
            </div>
          </div>
        </section>

        {/* Escalated Cases — police-only queue. A volunteer flagged these as
            needing police backup; nothing surfaces here on any other role's
            dashboard. */}
        {escalatedCases.length > 0 && (
          <section className="space-y-6">
            <div className="text-center space-y-1">
              <span className="font-serif italic text-xl text-[#8C2D2D] block">backup requested</span>
              <h2 className="text-xs uppercase tracking-[0.25em] font-sans text-[#1F2A3C] font-medium border-b border-[#DCE1E8] pb-3">
                🚓 Escalated Cases
              </h2>
            </div>
            <div className="grid gap-6">
              {escalatedCases.map((alert) => (
                <div
                  key={alert._id}
                  className="bg-[#FBEFEF] p-8 border-2 border-[#C97A7A] shadow-xs space-y-4 rounded-sm"
                >
                  <div className="flex justify-between items-start border-b border-[#EED9D9] pb-3">
                    <h3 className="text-base font-normal uppercase tracking-widest text-[#7A2E2E]">
                      🚨 Police Backup Requested
                    </h3>
                    {alert.distanceKm != null && (
                      <span className="text-[10px] font-sans uppercase tracking-widest bg-[#EED9D9] text-[#7A2E2E] px-3 py-1 rounded-xs border border-[#C97A7A]">
                        {alert.distanceKm.toFixed(1)} km away
                      </span>
                    )}
                  </div>
                  <div className="font-sans text-xs text-[#5C2626] space-y-1.5 tracking-wide">
                    <p><strong className="font-semibold">User:</strong> {alert.username}</p>
                    <p>
                      <strong className="font-semibold">Escalated by:</strong>{" "}
                      {alert.escalatedByName || "Volunteer"}
                    </p>
                    {alert.escalationReason && (
                      <p className="italic">"{alert.escalationReason}"</p>
                    )}
                    {alert.phone && (
                      <p>
                        <strong className="font-semibold">Phone:</strong>{" "}
                        <a href={`tel:${alert.phone}`} className="underline font-semibold">
                          {alert.phone}
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="pt-2 flex flex-wrap gap-4 font-sans">
                    {!alert.acceptedBy || alert.acceptedBy !== officerId ? (
                      <button
                        onClick={() => handleAccept(alert._id)}
                        disabled={acceptingId === alert._id}
                        className="bg-[#8C2D2D] hover:bg-[#7A2626] disabled:opacity-50 text-white px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all rounded-xs shadow-2xs"
                      >
                        {acceptingId === alert._id ? "Accepting…" : "Accept / Join"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleResolve(alert._id)}
                        className="bg-[#8C2D2D] hover:bg-[#7A2626] text-white px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all rounded-xs shadow-2xs"
                      >
                        Mark Resolved
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/live-tracking/${alert._id}`)}
                      className="border border-[#C97A7A] bg-transparent hover:bg-[#F5E5E5] text-[#7A2E2E] px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all rounded-xs"
                    >
                      Track Live
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Active Cases Section */}
        {acceptedByMe.length > 0 && (
          <section className="space-y-6">
            <div className="text-center space-y-1">
              <span className="font-serif italic text-xl text-[#5A6B85] block">active dispatch</span>
              <h2 className="text-xs uppercase tracking-[0.25em] font-sans text-[#1F2A3C] font-medium border-b border-[#DCE1E8] pb-3">
                Your Active Cases
              </h2>
            </div>
            <div className="grid gap-6">
              {acceptedByMe.map((alert) => (
                <div
                  key={alert._id}
                  className="bg-white p-8 border border-[#DCE1E8] shadow-xs space-y-4 rounded-sm relative"
                >
                  <div className="flex justify-between items-start border-b border-[#F5F6F8] pb-3">
                    <h3 className="text-base font-normal uppercase tracking-widest text-[#1F2A3C]">
                      🚨 SOS Alert — In Progress
                    </h3>
                    <span className="text-[10px] font-sans uppercase tracking-widest bg-[#EDF0F4] text-[#2C3B57] px-3 py-1 rounded-xs border border-[#DCE1E8]">
                      Active
                    </span>
                  </div>
                  <div className="font-sans text-xs text-[#3D4A5C] space-y-1.5 tracking-wide">
                    <p><strong className="text-[#1F2A3C] font-semibold">User:</strong> {alert.username}</p>
                    {alert.phone && (
                      <p>
                        <strong className="text-[#1F2A3C] font-semibold">Phone:</strong>{" "}
                        <a href={`tel:${alert.phone}`} className="text-[#2C3B57] underline font-semibold">
                          {alert.phone}
                        </a>
                      </p>
                    )}
                    {alert.medicalNotes && (
                      <p className="text-[#7A3B3B] bg-[#F8EFEF] border border-[#E6D3D3] rounded-xs px-2 py-1 mt-1 normal-case">
                        ⚕ Medical notes: {alert.medicalNotes}
                      </p>
                    )}
                    <p>
                      <strong className="text-[#1F2A3C] font-semibold">Distance:</strong>{" "}
                      {alert.distanceKm != null ? `${alert.distanceKm.toFixed(1)} km away` : "Unknown"}
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap gap-4 font-sans">
                    <button
                      onClick={() => navigate(`/live-tracking/${alert._id}`)}
                      className="bg-[#2C3B57] hover:bg-[#233047] text-[#F5F6F8] px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all rounded-xs shadow-2xs"
                    >
                      Track Live
                    </button>
                    <button
                      onClick={() => handleResolve(alert._id)}
                      className="border border-[#5A6B85] bg-transparent hover:bg-[#EDF0F4] text-[#1F2A3C] px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all rounded-xs"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Priority Alerts — Pro users' SOS, pushed directly to nearby responders */}
        {activePriorityAlerts.length > 0 && (
          <section className="space-y-6">
            <div className="text-center space-y-1">
              <span className="font-serif italic text-xl text-[#8C6D46] block">respond fast</span>
              <h2 className="text-xs uppercase tracking-[0.25em] font-sans text-[#1F2A3C] font-medium border-b border-[#DCE1E8] pb-3">
                ⚡ Priority Alerts Near You
              </h2>
            </div>
            <div className="grid gap-6">
              {activePriorityAlerts.map((p) => (
                <div
                  key={p.emergency._id}
                  className="bg-[#FBF4E9] p-8 border-2 border-[#C9A46A] shadow-xs space-y-4 rounded-sm"
                >
                  <div className="flex justify-between items-start border-b border-[#EDE0C8] pb-3">
                    <h3 className="text-base font-normal uppercase tracking-widest text-[#5C4420]">
                      🚨 Priority SOS
                    </h3>
                    <span className="text-[10px] font-sans uppercase tracking-widest bg-[#EDE0C8] text-[#5C4420] px-3 py-1 rounded-xs border border-[#C9A46A]">
                      {(p.distanceMeters / 1000).toFixed(1)} km away
                    </span>
                  </div>
                  <p className="font-sans text-xs text-[#5C4420] tracking-wide">
                    <strong className="font-semibold">User:</strong> {p.emergency.username}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-4 font-sans">
                    <button
                      onClick={() => handleAccept(p.emergency._id)}
                      disabled={acceptingId === p.emergency._id}
                      className="bg-[#8C6D46] hover:bg-[#7A5D3A] disabled:opacity-50 text-white px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all rounded-xs shadow-2xs"
                    >
                      {acceptingId === p.emergency._id ? "Accepting…" : "Accept"}
                    </button>
                    <button
                      onClick={() => navigate(`/live-tracking/${p.emergency._id}`)}
                      className="border border-[#C9A46A] bg-transparent hover:bg-[#F5ECD8] text-[#5C4420] px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all rounded-xs"
                    >
                      Track Live
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Check-in Requests — lower urgency than a full SOS */}
        {needHelpAlerts.length > 0 && (
          <section className="space-y-6">
            <div className="text-center space-y-1">
              <span className="font-serif italic text-xl text-[#5A6B85] block">wellness check</span>
              <h2 className="text-xs uppercase tracking-[0.25em] font-sans text-[#1F2A3C] font-medium border-b border-[#DCE1E8] pb-3">
                Check-in Requests
              </h2>
            </div>
            <div className="grid gap-4">
              {needHelpAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className="bg-[#EEF2F7] border border-[#C7D3E8] p-5 rounded-sm flex justify-between items-center"
                >
                  <p className="font-sans text-xs text-[#2C3B57] tracking-wide">
                    💬 <strong className="font-semibold">{alert.username}</strong> requested a check-in
                  </p>
                  <button
                    onClick={() => handleAcknowledgeCheckin(alert._id)}
                    className="bg-[#2C3B57] hover:bg-[#233047] text-white px-5 py-2 text-[11px] font-medium uppercase tracking-[0.2em] transition-all rounded-xs"
                  >
                    Acknowledge
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* New SOS Alerts Section */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <span className="font-serif italic text-xl text-[#5A6B85] block">incoming requests</span>
            <h2 className="text-xs uppercase tracking-[0.25em] font-sans text-[#1F2A3C] font-medium border-b border-[#DCE1E8] pb-3">
              New SOS Alerts
            </h2>
          </div>

          {loading ? (
            <p className="text-xs uppercase tracking-widest font-sans text-[#5A6B85] text-center py-6">
              Loading nearby alerts…
            </p>
          ) : newAlerts.length === 0 ? (
            <div className="bg-white p-10 border border-[#DCE1E8] text-center text-xs uppercase tracking-widest font-sans text-[#5A6B85] rounded-sm">
              No unclaimed alerts right now.
            </div>
          ) : (
            <div className="grid gap-6">
              {newAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className="bg-white p-8 border border-[#DCE1E8] hover:border-[#5A6B85] transition-all space-y-4 rounded-sm shadow-xs"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-normal uppercase tracking-widest text-[#1F2A3C]">
                      🚨 Emergency Alert
                    </h3>
                    {alert.distanceKm != null && (
                      <span className="text-[10px] font-sans uppercase tracking-wider text-[#5A6B85] bg-[#F5F6F8] px-3 py-1 border border-[#DCE1E8]">
                        {alert.distanceKm.toFixed(1)} km away
                      </span>
                    )}
                  </div>

                  <div className="font-sans text-xs text-[#3D4A5C] space-y-1.5 tracking-wide">
                    <p><strong className="text-[#1F2A3C] font-semibold">User:</strong> {alert.username}</p>
                    {alert.phone && (
                      <p>
                        <strong className="text-[#1F2A3C] font-semibold">Phone:</strong>{" "}
                        <a href={`tel:${alert.phone}`} className="text-[#2C3B57] underline font-semibold">
                          {alert.phone}
                        </a>
                      </p>
                    )}
                    {alert.medicalNotes && (
                      <p className="text-[#7A3B3B] bg-[#F8EFEF] border border-[#E6D3D3] rounded-xs px-2 py-1 mt-1 normal-case">
                        ⚕ Medical notes: {alert.medicalNotes}
                      </p>
                    )}
                    {alert.message && (
                      <p className="italic font-serif text-sm text-[#5A6B85] pt-1">"{alert.message}"</p>
                    )}
                  </div>

                  <div className="pt-2 flex flex-wrap gap-4 font-sans">
                    <button
                      onClick={() => handleAccept(alert._id)}
                      disabled={acceptingId === alert._id}
                      className="bg-[#8C6D46] hover:bg-[#7A5D3A] disabled:opacity-50 text-white px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all rounded-xs shadow-2xs"
                    >
                      {acceptingId === alert._id ? "Accepting…" : "Accept"}
                    </button>
                    <button
                      onClick={() => navigate(`/live-tracking/${alert._id}`)}
                      className="border border-[#DCE1E8] bg-transparent hover:bg-[#F5F6F8] text-[#1F2A3C] px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all rounded-xs"
                    >
                      Track Live
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Map Section */}
        <section className="bg-white p-8 border border-[#DCE1E8] space-y-6 rounded-sm shadow-xs">
          <div className="flex items-center justify-between border-b border-[#DCE1E8] pb-4">
            <h2 className="text-sm font-normal uppercase tracking-[0.2em] text-[#1F2A3C]">
              Nearby Alerts Map
            </h2>
            <span className="font-serif italic text-sm text-[#5A6B85]">Live Overview</span>
          </div>

          <div className="overflow-hidden border border-[#DCE1E8] rounded-xs">
            <NearbyAlertsMap self={self} alerts={mapAlerts} />
          </div>

          {!self && (
            <p className="text-[11px] uppercase tracking-widest font-sans text-[#5A6B85] text-center pt-2">
              Allow location access to see your position and exact distances on the map.
            </p>
          )}
        </section>

      </div>
    </div>
  );
}