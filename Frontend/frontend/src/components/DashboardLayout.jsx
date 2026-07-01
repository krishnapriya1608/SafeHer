import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StatusMessage from "../components/StatusMessage";
import { dashboardApi } from "../api/dashboardApi";

export default function UserDashboard() {
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username") || "";
  const email = localStorage.getItem("email") || "";

  const [profile, setProfile] = useState({
    fullName: username,
    phone: "",
    location: "",
    medicalNotes: "",
  });

  const [newContact, setNewContact] = useState({
    name: "",
    relation: "",
    phone: "",
  });

  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("Safe");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateProfileForm = (event) => {
    setProfile((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const updateContactForm = (event) => {
    setNewContact((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const loadDashboardData = (data) => {
    setProfile({
      fullName: data.fullName || username,
      phone: data.phone || "",
      location: data.location || "",
      medicalNotes: data.medicalNotes || "",
    });

    setEmergencyContacts(data.emergencyContacts || []);
    setRecentAlerts(data.recentAlerts || []);
    setCurrentStatus(data.currentStatus || "Safe");
  };

  const createDashboard = async () => {
    const response = await dashboardApi.createDashboard({
      userId,
      fullName: username || email,
      phone: "Not added",
      location: "",
      medicalNotes: "",
      emergencyContacts: [],
    });

    loadDashboardData(response.data.dashboard);
  };

  const fetchDashboard = async () => {
    if (!userId) {
      setError("User not found. Please login again.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await dashboardApi.getDashboard(userId);
      loadDashboardData(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        await createDashboard();
      } else {
        setError(err.response?.data?.message || "Failed to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleUpdateProfile = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await dashboardApi.updateProfile(userId, profile);
      loadDashboardData(response.data.dashboard);
      setMessage(response.data.message || "Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await dashboardApi.addContact(userId, newContact);

      setEmergencyContacts(response.data.emergencyContacts || []);
      setNewContact({ name: "", relation: "", phone: "" });

      setMessage(response.data.message || "Emergency contact added");
    } catch (err) {
      setError(err.response?.data?.message || "Contact add failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (contactId) => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await dashboardApi.deleteContact(userId, contactId);
      setEmergencyContacts(response.data.emergencyContacts || []);
      setMessage(response.data.message || "Emergency contact deleted");
    } catch (err) {
      setError(err.response?.data?.message || "Contact delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await dashboardApi.updateStatus(userId, {
        currentStatus: status,
      });

      setCurrentStatus(response.data.currentStatus);
      setRecentAlerts(response.data.recentAlerts || []);
      setMessage(response.data.message || "Status updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Status update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 antialiased px-4 py-8 md:py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header Block with Clean Minimalist Line */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-md">
              Operational Interface
            </span>
            <h1 className="mt-2.5 text-3xl font-extrabold tracking-tight text-white">
              User Command Hub
            </h1>
            <p className="mt-1.5 text-sm text-zinc-400">
              Welcome back, <span className="text-zinc-200 font-medium">{username }</span>. System monitoring and critical dispatches active.
            </p>
          </div>
        </div>

        {/* Dynamic System Alert Bars */}
        <div className="space-y-2">
          {message && <StatusMessage type="success">{message}</StatusMessage>}
          {error && <StatusMessage type="error">{error}</StatusMessage>}
        </div>

        {/* High-Contrast Glassmorphic Stats Section */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Live Status Indicator</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">{currentStatus}</h2>
            </div>
            <div className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentStatus === "Safe" ? "bg-emerald-400" : currentStatus === "Need Help" ? "bg-amber-400" : "bg-rose-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${currentStatus === "Safe" ? "bg-emerald-500" : currentStatus === "Need Help" ? "bg-amber-500" : "bg-rose-500"}`}></span>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Assigned Contacts</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
              {emergencyContacts.length} <span className="text-xs font-normal text-zinc-500">nodes configued</span>
            </h2>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Broadcast Stream Logs</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
              {recentAlerts.length} <span className="text-xs font-normal text-zinc-500">intercepts logged</span>
            </h2>
          </div>
        </section>

        {/* Container Row 1: Profile Modifications & Broadcast Toggle */}
        <section className="grid gap-6 lg:grid-cols-12">
          
          <form
            onSubmit={handleUpdateProfile}
            className="lg:col-span-7 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col justify-between space-y-6"
          >
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Identity Parameters</h2>
              <p className="text-xs text-zinc-500 mt-1">Configure baseline variables used during automated response executions.</p>
              
              <div className="mt-6 space-y-4">
                <input
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-40 transition-all"
                  name="fullName"
                  placeholder="Full Name"
                  value={profile.fullName}
                  onChange={updateProfileForm}
                  required
                  disabled={loading}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-40 transition-all"
                    name="phone"
                    placeholder="Phone Number"
                    value={profile.phone}
                    onChange={updateProfileForm}
                    required
                    disabled={loading}
                  />

                  <input
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-40 transition-all"
                    name="location"
                    placeholder="Location Node"
                    value={profile.location}
                    onChange={updateProfileForm}
                    disabled={loading}
                  />
                </div>

                <textarea
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-40 transition-all min-h-[110px] resize-none"
                  name="medicalNotes"
                  placeholder="Critical Health Registry (e.g. baseline vitals, known allergen reactions)"
                  value={profile.medicalNotes}
                  onChange={updateProfileForm}
                  disabled={loading}
                />
              </div>
            </div>

            <motion.button
              whileTap={!loading ? { scale: 0.99 } : {}}
              className="w-full rounded-xl bg-indigo-600 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-40 transition-all shadow-lg cursor-pointer"
              disabled={loading}
            >
              {loading ? "Recompiling..." : "Save Registry Parameters"}
            </motion.button>
          </form>

          {/* Status Vector Controller */}
          <div className="lg:col-span-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Signal Broadcaster</h2>
              <p className="text-xs text-zinc-500 mt-1">Force update network conditions across active monitoring endpoints.</p>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => handleStatusChange("Safe")}
                  disabled={loading}
                  className={`w-full rounded-xl border p-4 text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    currentStatus === "Safe"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Signal Nominal (Safe)</span>
                  </div>
                  {currentStatus === "Safe" && <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500">Active</span>}
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange("Need Help")}
                  disabled={loading}
                  className={`w-full rounded-xl border p-4 text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    currentStatus === "Need Help"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span>Elevated Status (Need Help)</span>
                  </div>
                  {currentStatus === "Need Help" && <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500">Active</span>}
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange("Emergency")}
                  disabled={loading}
                  className={`w-full rounded-xl border p-4 text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    currentStatus === "Emergency"
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                      : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>Critical Breach (Emergency)</span>
                  </div>
                  {currentStatus === "Emergency" && <span className="text-[10px] uppercase font-bold tracking-widest text-rose-500 animate-pulse">Tripped</span>}
                </button>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/60 text-xs text-zinc-500 leading-relaxed">
              <span className="text-zinc-400 font-semibold block mb-1">Broadcaster Notice:</span> Changes push immediate cryptographic telemetry arrays down operational relay lines. Confirm status authenticity before execution.
            </div>
          </div>
        </section>

        {/* Container Row 2: Emergency Network & Stream Processing Feed */}
        <section className="grid gap-6 lg:grid-cols-12">
          
          <form
            onSubmit={handleAddContact}
            className="lg:col-span-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col"
          >
            <h2 className="text-lg font-bold text-white tracking-tight">Proxy Intercept Nodes</h2>
            <p className="text-xs text-zinc-500 mt-1">Assign prioritized remote contacts cleared for immediate telemetry streams.</p>

            <div className="mt-6 space-y-4">
              <input
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-40 transition-all"
                name="name"
                placeholder="Connection Name"
                value={newContact.name}
                onChange={updateContactForm}
                required
                disabled={loading}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-40 transition-all"
                  name="relation"
                  placeholder="Relational Mapping"
                  value={newContact.relation}
                  onChange={updateContactForm}
                  required
                  disabled={loading}
                />

                <input
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-indigo-500 focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-40 transition-all"
                  name="phone"
                  placeholder="Data Relay Line"
                  value={newContact.phone}
                  onChange={updateContactForm}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              className="mt-4 w-full rounded-xl bg-zinc-100 py-3 text-xs font-bold uppercase tracking-wider text-zinc-950 hover:bg-zinc-200 transition-all cursor-pointer"
              disabled={loading}
            >
              Mount Proxy Node
            </button>

            {/* Configured Outputs Iteration */}
            <div className="mt-6 space-y-3 overflow-y-auto max-h-[280px] pr-1">
              {emergencyContacts.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl text-xs text-zinc-600">
                  No proxy interception paths allocated.
                </div>
              ) : (
                emergencyContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 p-4 bg-zinc-950/30 hover:bg-zinc-950/80 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold text-zinc-200 text-sm">{contact.name}</h3>
                      <p className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                        <span className="inline-block px-2 py-0.5 bg-zinc-800 text-zinc-400 font-bold rounded text-[9px] uppercase tracking-wider">{contact.relation}</span>
                        {contact.phone}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteContact(contact._id)}
                      className="text-xs font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/10 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Purge
                    </button>
                  </div>
                ))
              )}
            </div>
          </form>

          {/* Core System Telemetry Stream Grid */}
          <div className="lg:col-span-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col">
            <h2 className="text-lg font-bold text-white tracking-tight">Live Network Intercepts</h2>
            <p className="text-xs text-zinc-500 mt-1">Real-time status tracking loops populated across validation frameworks.</p>

            <div className="mt-6 space-y-3 overflow-y-auto max-h-[460px] pr-1">
              {recentAlerts.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl text-xs text-zinc-600">
                  No tracking broadcasts captured on current cycle indices.
                </div>
              ) : (
                recentAlerts.map((alert) => {
                  const level = alert.level?.toLowerCase();
                  const borderClass = level === "critical" ? "border-l-rose-500 bg-rose-500/[0.02]" : level === "warning" ? "border-l-amber-500 bg-amber-500/[0.02]" : "border-l-indigo-500 bg-indigo-500/[0.02]";
                  const badgeClass = level === "critical" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : level === "warning" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
                  
                  return (
                    <div key={alert._id} className={`rounded-xl border border-zinc-800 border-l-4 p-4 transition-all ${borderClass}`}>
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-semibold text-zinc-200 text-sm tracking-tight">{alert.title}</h3>
                        <span className={`text-[9px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded ${badgeClass}`}>
                          {alert.level}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{alert.detail}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
        </section>
      </div>
    </main>
  );
}