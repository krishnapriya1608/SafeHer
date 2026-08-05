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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [acceptingId, setAcceptingId] = useState(null);

  // Volunteer's own current location
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setSelf({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

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

    socket.on("new-emergency", onNew);
    socket.on("emergency-resolved", onUpdate);
    socket.on("emergency-accepted", onUpdate);
    socket.on("location-update", onLocation);

    return () => {
      socket.off("new-emergency", onNew);
      socket.off("emergency-resolved", onUpdate);
      socket.off("emergency-accepted", onUpdate);
      socket.off("location-update", onLocation);
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

  const mapAlerts = [...newAlerts, ...acceptedByMe];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#3B4A3E] font-serif selection:bg-[#D3DEC2] px-4 py-8 md:py-16">
      <div className="mx-auto max-w-11xl space-y-16">

        {/* Hero Header Section */}
        <section className="relative bg-[#FAF8F5] p-6 md:p-12 border border-[#E2DDD5] rounded-sm shadow-sm">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="font-serif italic text-3xl md:text-4xl text-[#788876] font-light block tracking-wide">
              Welcome back,
            </span>
            <h1 className="text-2xl md:text-4xl font-normal uppercase tracking-[0.2em] text-[#3B4A3E] leading-relaxed">
              {volunteerName}
            </h1>
            <p className="text-xs md:text-sm text-[#637262] font-sans font-light tracking-widest uppercase leading-relaxed pt-2 border-t border-[#E2DDD5]/60 max-w-xl">
              Nourish your community with care and swift action. Respond to nearby SOS alerts and offer support where it's needed most.
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
        <section className="bg-[#5F6F5E] text-[#FAF8F5] p-10 md:p-14 text-center rounded-sm space-y-6 shadow-sm border border-[#4F5E4E]">
          <span className="font-serif italic text-2xl md:text-3xl text-[#D8E2D5] font-light block">
            Volunteer Dashboard Overview
          </span>
          <h2 className="text-sm md:text-base font-sans font-light tracking-[0.25em] uppercase max-w-2xl mx-auto text-[#EBF0E9]/90">
            Real-time status of emergency requests and your contributions
          </h2>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 max-w-3xl mx-auto">
            <div className="p-6 bg-[#4F5E4E]/50 border border-[#718270] rounded-sm backdrop-blur-xs">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#D8E2D5] font-sans block mb-1">
                New Alerts
              </span>
              <p className="text-3xl font-light tracking-wider text-[#FAF8F5]">{newAlerts.length}</p>
            </div>

            <div className="p-6 bg-[#4F5E4E]/50 border border-[#718270] rounded-sm backdrop-blur-xs">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#D8E2D5] font-sans block mb-1">
                Accepted Cases
              </span>
              <p className="text-3xl font-light tracking-wider text-[#FAF8F5]">{acceptedByMe.length}</p>
            </div>

            <div className="p-6 bg-[#4F5E4E]/50 border border-[#718270] rounded-sm backdrop-blur-xs">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#D8E2D5] font-sans block mb-1">
                Completed
              </span>
              <p className="text-3xl font-light tracking-wider text-[#FAF8F5]">{completedByMe.length}</p>
            </div>
          </div>
        </section>

        {/* Accepted Cases Section */}
        {acceptedByMe.length > 0 && (
          <section className="space-y-6">
            <div className="text-center space-y-1">
              <span className="font-serif italic text-xl text-[#788876] block">active commitment</span>
              <h2 className="text-xs uppercase tracking-[0.25em] font-sans text-[#3B4A3E] font-medium border-b border-[#E2DDD5] pb-3">
                Your Active Cases
              </h2>
            </div>
            <div className="grid gap-6">
              {acceptedByMe.map((alert) => (
                <div
                  key={alert._id}
                  className="bg-white p-8 border border-[#E2DDD5] shadow-xs space-y-4 rounded-sm relative"
                >
                  <div className="flex justify-between items-start border-b border-[#FAF8F5] pb-3">
                    <h3 className="text-base font-normal uppercase tracking-widest text-[#3B4A3E]">
                      🚨 SOS Alert — In Progress
                    </h3>
                    <span className="text-[10px] font-sans uppercase tracking-widest bg-[#F2EDE4] text-[#5F6F5E] px-3 py-1 rounded-xs border border-[#E2DDD5]">
                      Active
                    </span>
                  </div>
                  <div className="font-sans text-xs text-[#556354] space-y-1.5 tracking-wide">
                    <p><strong className="text-[#3B4A3E] font-semibold">User:</strong> {alert.username}</p>
                    <p>
                      <strong className="text-[#3B4A3E] font-semibold">Distance:</strong>{" "}
                      {alert.distanceKm != null ? `${alert.distanceKm.toFixed(1)} km away` : "Unknown"}
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap gap-4 font-sans">
                    <button
                      onClick={() => navigate(`/live-tracking/${alert._id}`)}
                      className="bg-[#5F6F5E] hover:bg-[#4F5E4E] text-[#FAF8F5] px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all rounded-xs shadow-2xs"
                    >
                      Track Live
                    </button>
                    <button
                      onClick={() => handleResolve(alert._id)}
                      className="border border-[#788876] bg-transparent hover:bg-[#F2EDE4] text-[#3B4A3E] px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all rounded-xs"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* New SOS Alerts Section */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <span className="font-serif italic text-xl text-[#788876] block">community requests</span>
            <h2 className="text-xs uppercase tracking-[0.25em] font-sans text-[#3B4A3E] font-medium border-b border-[#E2DDD5] pb-3">
              New SOS Alerts
            </h2>
          </div>

          {loading ? (
            <p className="text-xs uppercase tracking-widest font-sans text-[#788876] text-center py-6">
              Loading nearby alerts…
            </p>
          ) : newAlerts.length === 0 ? (
            <div className="bg-white p-10 border border-[#E2DDD5] text-center text-xs uppercase tracking-widest font-sans text-[#788876] rounded-sm">
              No unclaimed alerts right now.
            </div>
          ) : (
            <div className="grid gap-6">
              {newAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className="bg-white p-8 border border-[#E2DDD5] hover:border-[#788876] transition-all space-y-4 rounded-sm shadow-xs"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-normal uppercase tracking-widest text-[#3B4A3E]">
                      🚨 Emergency Alert
                    </h3>
                    {alert.distanceKm != null && (
                      <span className="text-[10px] font-sans uppercase tracking-wider text-[#788876] bg-[#FAF8F5] px-3 py-1 border border-[#E2DDD5]">
                        {alert.distanceKm.toFixed(1)} km away
                      </span>
                    )}
                  </div>

                  <div className="font-sans text-xs text-[#556354] space-y-1.5 tracking-wide">
                    <p><strong className="text-[#3B4A3E] font-semibold">User:</strong> {alert.username}</p>
                    {alert.message && (
                      <p className="italic font-serif text-sm text-[#788876] pt-1">"{alert.message}"</p>
                    )}
                  </div>

                  <div className="pt-2 flex flex-wrap gap-4 font-sans">
                    <button
                      onClick={() => handleAccept(alert._id)}
                      disabled={acceptingId === alert._id}
                      className="bg-[#C8B29B] hover:bg-[#B8A087] disabled:opacity-50 text-white px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all rounded-xs shadow-2xs"
                    >
                      {acceptingId === alert._id ? "Accepting…" : "Accept"}
                    </button>
                    <button
                      onClick={() => navigate(`/live-tracking/${alert._id}`)}
                      className="border border-[#E2DDD5] bg-transparent hover:bg-[#FAF8F5] text-[#3B4A3E] px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-all rounded-xs"
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
        <section className="bg-white p-8 border border-[#E2DDD5] space-y-6 rounded-sm shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E2DDD5] pb-4">
            <h2 className="text-sm font-normal uppercase tracking-[0.2em] text-[#3B4A3E]">
              Nearby Alerts Map
            </h2>
            <span className="font-serif italic text-sm text-[#788876]">Live Overview</span>
          </div>

          <div className="overflow-hidden border border-[#E2DDD5] rounded-xs">
            <NearbyAlertsMap self={self} alerts={mapAlerts} />
          </div>

          {!self && (
            <p className="text-[11px] uppercase tracking-widest font-sans text-[#788876] text-center pt-2">
              Allow location access to see your position and exact distances on the map.
            </p>
          )}
        </section>

      </div>
    </div>
  );
}