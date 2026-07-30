// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { emergencyApi } from "../api/emergencyApi";
// import { socket } from "../socket";
// import { distanceMeters } from "../utils/geo";
// import NearbyAlertsMap from "../components/NearbyAlertsMap";
// import StatusMessage from "../components/StatusMessage";

// export default function VolunteerDashboard() {
//   const navigate = useNavigate();
//   const volunteerId = localStorage.getItem("userId");
//   const volunteerName = localStorage.getItem("username") || "Volunteer";

//   const [self, setSelf] = useState(null);
//   const [emergencies, setEmergencies] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [message, setMessage] = useState("");
//   const [acceptingId, setAcceptingId] = useState(null);

//   // This volunteer's own current location, used to compute distance to
//   // each SOS and to plot a "you are here" pin on the map.
//   useEffect(() => {
//     if (!("geolocation" in navigator)) return;
//     navigator.geolocation.getCurrentPosition(
//       (pos) => setSelf({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
//       () => {},
//       { enableHighAccuracy: true, timeout: 10000 }
//     );
//   }, []);

//   const loadEmergencies = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const response = await emergencyApi.getAllEmergencies();
//       setEmergencies(response.data.emergencies || []);
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to load emergencies");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadEmergencies();

//     const onNew = (data) => setEmergencies((prev) => [data.emergency, ...prev]);
//     const onUpdate = (data) =>
//       setEmergencies((prev) => prev.map((e) => (e._id === data.emergency._id ? data.emergency : e)));
//     const onLocation = (data) =>
//       setEmergencies((prev) =>
//         prev.map((e) =>
//           e._id === data.emergencyId
//             ? { ...e, latitude: data.latitude, longitude: data.longitude }
//             : e
//         )
//       );

//     socket.on("new-emergency", onNew);
//     socket.on("emergency-resolved", onUpdate);
//     socket.on("emergency-accepted", onUpdate);
//     socket.on("location-update", onLocation);

//     return () => {
//       socket.off("new-emergency", onNew);
//       socket.off("emergency-resolved", onUpdate);
//       socket.off("emergency-accepted", onUpdate);
//       socket.off("location-update", onLocation);
//     };
//   }, []);

//   // Distance (km) from this volunteer to each alert, when we know both points.
//   const withDistance = useMemo(() => {
//     return emergencies.map((e) => ({
//       ...e,
//       distanceKm: self ? distanceMeters([self.lat, self.lng], [e.latitude, e.longitude]) / 1000 : null,
//     }));
//   }, [emergencies, self]);

//   const newAlerts = withDistance
//     .filter((e) => e.status?.toLowerCase() === "active" && !e.acceptedBy)
//     .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

//   const acceptedByMe = withDistance.filter(
//     (e) => e.status?.toLowerCase() === "active" && e.acceptedBy === volunteerId
//   );

//   const completedByMe = withDistance.filter(
//     (e) => e.status?.toLowerCase() === "resolved" && e.acceptedBy === volunteerId
//   );

//   const handleAccept = async (emergencyId) => {
//     setAcceptingId(emergencyId);
//     setError("");
//     setMessage("");
//     try {
//       const response = await emergencyApi.acceptEmergency(emergencyId, {
//         volunteerId,
//         volunteerName,
//       });
//       setMessage(response.data.message || "Case accepted");
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to accept case");
//     } finally {
//       setAcceptingId(null);
//     }
//   };

//   const handleResolve = async (emergencyId) => {
//     setError("");
//     setMessage("");
//     try {
//       const response = await emergencyApi.resolveEmergency(emergencyId);
//       setMessage(response.data.message || "Marked resolved");
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to resolve case");
//     }
//   };

//   const mapAlerts = [...newAlerts, ...acceptedByMe];

//   return (
//     <div className="min-h-screen bg-zinc-950 px-4 py-8 md:py-12">
//       <div className="mx-auto max-w-4xl space-y-6">
//         {/* Header */}
//         <section className="rounded-3xl bg-blue-900 p-8 text-white">
//           <h1 className="text-4xl font-bold">Volunteer Dashboard</h1>
//           <p className="mt-2">
//             Welcome, {volunteerName}. Respond to nearby SOS alerts and assist users.
//           </p>
//         </section>

//         {(message || error) && (
//           <div className="space-y-2">
//             {message && <StatusMessage type="success">{message}</StatusMessage>}
//             {error && <StatusMessage type="error">{error}</StatusMessage>}
//           </div>
//         )}

//         {/* Stats */}
//         <section className="grid md:grid-cols-3 gap-5">
//           <div className="rounded-xl bg-white p-6 shadow">
//             <h2 className="text-sm font-semibold text-stone-500">New Alerts</h2>
//             <p className="text-3xl font-bold text-stone-900">{newAlerts.length}</p>
//           </div>

//           <div className="rounded-xl bg-white p-6 shadow">
//             <h2 className="text-sm font-semibold text-stone-500">Accepted Cases</h2>
//             <p className="text-3xl font-bold text-stone-900">{acceptedByMe.length}</p>
//           </div>

//           <div className="rounded-xl bg-white p-6 shadow">
//             <h2 className="text-sm font-semibold text-stone-500">Completed</h2>
//             <p className="text-3xl font-bold text-stone-900">{completedByMe.length}</p>
//           </div>
//         </section>

//         {/* Accepted by me — active cases this volunteer is handling right now */}
//         {acceptedByMe.length > 0 && (
//           <section className="space-y-4">
//             <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
//               Your Active Cases
//             </h2>
//             {acceptedByMe.map((alert) => (
//               <div key={alert._id} className="rounded-xl bg-white p-5 shadow">
//                 <h2 className="font-bold">🚨 SOS Alert — You accepted this</h2>
//                 <p>User : {alert.username}</p>
//                 <p>
//                   Distance :{" "}
//                   {alert.distanceKm != null ? `${alert.distanceKm.toFixed(1)} km` : "Unknown"}
//                 </p>
//                 <div className="mt-3 flex gap-2">
//                   <button
//                     onClick={() => navigate(`/live-tracking/${alert._id}`)}
//                     className="rounded bg-blue-600 px-4 py-2 text-white text-sm font-semibold"
//                   >
//                     Track Live
//                   </button>
//                   <button
//                     onClick={() => handleResolve(alert._id)}
//                     className="rounded border border-emerald-600 px-4 py-2 text-emerald-700 text-sm font-semibold"
//                   >
//                     Mark Resolved
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </section>
//         )}

//         {/* SOS Cards — new, unclaimed alerts, nearest first */}
//         <section className="space-y-4">
//           <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
//             New SOS Alerts
//           </h2>

//           {loading ? (
//             <p className="text-sm text-zinc-500">Loading…</p>
//           ) : newAlerts.length === 0 ? (
//             <div className="rounded-xl bg-white p-5 shadow text-sm text-stone-500">
//               No unclaimed alerts right now.
//             </div>
//           ) : (
//             newAlerts.map((alert) => (
//               <div key={alert._id} className="rounded-xl bg-white p-5 shadow">
//                 <h2 className="font-bold">🚨 SOS Alert</h2>
//                 <p>User : {alert.username}</p>
//                 <p>
//                   Distance :{" "}
//                   {alert.distanceKm != null ? `${alert.distanceKm.toFixed(1)} km` : "Unknown"}
//                 </p>
//                 {alert.message && <p className="text-sm text-stone-500 italic">"{alert.message}"</p>}

//                 <div className="mt-3 flex gap-2">
//                   <button
//                     onClick={() => handleAccept(alert._id)}
//                     disabled={acceptingId === alert._id}
//                     className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
//                   >
//                     {acceptingId === alert._id ? "Accepting…" : "Accept"}
//                   </button>
//                   <button
//                     onClick={() => navigate(`/live-tracking/${alert._id}`)}
//                     className="rounded border border-blue-600 px-4 py-2 text-blue-700 text-sm font-semibold"
//                   >
//                     Track Live
//                   </button>
//                 </div>
//               </div>
//             ))
//           )}
//         </section>

//         {/* Map — nearby unclaimed + your own accepted cases, plus your position */}
//         <section className="rounded-xl bg-white p-5 shadow">
//           <h2 className="font-bold mb-3">Nearby Alerts Map</h2>
//           <NearbyAlertsMap self={self} alerts={mapAlerts} />
//           {!self && (
//             <p className="mt-2 text-xs text-stone-400">
//               Allow location access to see your position and distances to each alert.
//             </p>
//           )}
//         </section>
//       </div>
//     </div>
//   );
// }
