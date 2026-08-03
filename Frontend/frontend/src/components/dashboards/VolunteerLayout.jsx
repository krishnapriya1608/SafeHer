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
    <div className="min-h-screen bg-[#F4F1EA] text-[#3D473D] font-serif px-4 py-8 md:py-12">
      <div className="mx-auto max-w-4xl space-y-10">

        {/* Hero Header Section */}
        <section className="relative overflow-hidden rounded-2xl bg-[#4A5D4E] p-8 md:p-12 text-[#F4F1EA] shadow-xl border border-[#3E4E41]">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="font-serif italic text-2xl text-[#C9D6C5] tracking-wide block">
              welcome back,
            </span>
            <h1 className="text-3xl md:text-5xl font-light uppercase tracking-widest leading-tight text-[#FAF8F5]">
              {volunteerName}
            </h1>
            <p className="text-sm md:text-base text-[#D3DEC2] font-sans font-light tracking-wide leading-relaxed pt-2">
              Nourish your community with care and swift action. Respond to nearby SOS alerts and offer support where it’s needed most.
            </p>
          </div>
          {/* Faded background accent text */}
          <div className="absolute -bottom-6 -right-6 select-none opacity-5 font-serif text-8xl italic text-white pointer-events-none">
            Cup of Care
          </div>
        </section>

        {(message || error) && (
          <div className="space-y-2 font-sans">
            {message && <StatusMessage type="success">{message}</StatusMessage>}
            {error && <StatusMessage type="error">{error}</StatusMessage>}
          </div>
        )}

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative rounded-xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border border-[#DCD6CD] text-center">
            <span className="text-xs uppercase tracking-widest text-[#788577] font-sans font-medium block mb-2">
              New Alerts
            </span>
            <p className="text-4xl font-light text-[#3D473D]">{newAlerts.length}</p>
          </div>

          <div className="relative rounded-xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border border-[#DCD6CD] text-center">
            <span className="text-xs uppercase tracking-widest text-[#788577] font-sans font-medium block mb-2">
              Accepted Cases
            </span>
            <p className="text-4xl font-light text-[#3D473D]">{acceptedByMe.length}</p>
          </div>

          <div className="relative rounded-xl bg-white/80 backdrop-blur-sm p-6 shadow-sm border border-[#DCD6CD] text-center">
            <span className="text-xs uppercase tracking-widest text-[#788577] font-sans font-medium block mb-2">
              Completed
            </span>
            <p className="text-4xl font-light text-[#3D473D]">{completedByMe.length}</p>
          </div>
        </section>

        {/* Accepted Cases Section */}
        {acceptedByMe.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-sans font-semibold text-[#627061] border-b border-[#DCD6CD] pb-2">
              Your Active Cases
            </h2>
            <div className="grid gap-4">
              {acceptedByMe.map((alert) => (
                <div
                  key={alert._id}
                  className="relative rounded-xl bg-white p-6 shadow-md border-l-4 border-[#4A5D4E] space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-light uppercase tracking-wider text-[#3D473D]">
                      🚨 SOS Alert — Active Case
                    </h3>
                    <span className="text-xs font-sans bg-[#EBF0E9] text-[#4A5D4E] px-3 py-1 rounded-full border border-[#D0DDD0]">
                      In Progress
                    </span>
                  </div>
                  <div className="font-sans text-sm text-[#5C665B] space-y-1">
                    <p><strong className="text-[#3D473D]">User:</strong> {alert.username}</p>
                    <p>
                      <strong className="text-[#3D473D]">Distance:</strong>{" "}
                      {alert.distanceKm != null ? `${alert.distanceKm.toFixed(1)} km away` : "Unknown"}
                    </p>
                  </div>
                  <div className="pt-3 flex flex-wrap gap-3 font-sans">
                    <button
                      onClick={() => navigate(`/live-tracking/${alert._id}`)}
                      className="rounded-lg bg-[#4A5D4E] hover:bg-[#3D473D] text-[#FAF8F5] px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
                    >
                      Track Live
                    </button>
                    <button
                      onClick={() => handleResolve(alert._id)}
                      className="rounded-lg border border-[#B1C2AF] bg-transparent hover:bg-[#EBF0E9] text-[#4A5D4E] px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
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
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest font-sans font-semibold text-[#627061] border-b border-[#DCD6CD] pb-2">
            New SOS Alerts
          </h2>

          {loading ? (
            <p className="text-sm font-sans text-[#788577]">Loading nearby alerts…</p>
          ) : newAlerts.length === 0 ? (
            <div className="rounded-xl bg-white/60 p-8 shadow-sm border border-[#DCD6CD] text-center text-sm font-sans text-[#788577]">
              No unclaimed alerts right now.
            </div>
          ) : (
            <div className="grid gap-4">
              {newAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className="rounded-xl bg-white p-6 shadow-sm border border-[#E3DDD4] hover:border-[#B8C7B5] transition-all space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-light uppercase tracking-wider text-[#3D473D]">
                      🚨 SOS Alert
                    </h3>
                    {alert.distanceKm != null && (
                      <span className="text-xs font-sans text-[#788577] bg-[#F4F1EA] px-2.5 py-1 rounded">
                        {alert.distanceKm.toFixed(1)} km
                      </span>
                    )}
                  </div>

                  <div className="font-sans text-sm text-[#5C665B] space-y-1">
                    <p><strong className="text-[#3D473D]">User:</strong> {alert.username}</p>
                    {alert.message && (
                      <p className="italic text-[#788577] pt-1">"{alert.message}"</p>
                    )}
                  </div>

                  <div className="pt-3 flex flex-wrap gap-3 font-sans">
                    <button
                      onClick={() => handleAccept(alert._id)}
                      disabled={acceptingId === alert._id}
                      className="rounded-lg bg-[#C2A382] hover:bg-[#B39270] disabled:opacity-50 text-white px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
                    >
                      {acceptingId === alert._id ? "Accepting…" : "Accept"}
                    </button>
                    <button
                      onClick={() => navigate(`/live-tracking/${alert._id}`)}
                      className="rounded-lg border border-[#DCD6CD] bg-transparent hover:bg-[#F4F1EA] text-[#4A5D4E] px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
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
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-[#DCD6CD] space-y-4">
          <div className="flex items-center justify-between border-b border-[#F4F1EA] pb-3">
            <h2 className="text-lg font-light uppercase tracking-wider text-[#3D473D]">
              Nearby Alerts Map
            </h2>
            <span className="text-xs font-sans italic text-[#8C988B]">Live Overview</span>
          </div>

          <div className="rounded-xl overflow-hidden border border-[#E3DDD4]">
            <NearbyAlertsMap self={self} alerts={mapAlerts} />
          </div>

          {!self && (
            <p className="text-xs font-sans text-[#8C988B] text-center pt-1">
              Allow location access to see your position and exact distances on the map.
            </p>
          )}
        </section>

      </div>
    </div>
  );
}