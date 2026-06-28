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

  const inputClasses = `w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-60`;

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
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Header Title Section */}
        <div className="border-b border-slate-200 pb-5">
          <p className="text-xs font-bold uppercase text-teal-600 tracking-wider">Phase 3</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            User Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Welcome, <span className="font-semibold text-slate-700">{username || email}</span>. Manage your system settings, emergency communication channels, and track system health feeds.
          </p>
        </div>

        {/* Global Notifications Container */}
        <div className="space-y-2">
          {message && <StatusMessage type="success">{message}</StatusMessage>}
          {error && <StatusMessage type="error">{error}</StatusMessage>}
        </div>

        {/* Metric Cards Top Row */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Status</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">{currentStatus}</h2>
            </div>
            <span className={`h-2.5 w-2.5 rounded-full ${currentStatus === "Safe" ? "bg-emerald-500" : currentStatus === "Need Help" ? "bg-amber-500" : "bg-rose-500 animate-pulse"}`} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Emergency Contacts</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {emergencyContacts.length} <span className="text-xs font-normal text-slate-400">assigned</span>
            </h2>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recent Alerts</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {recentAlerts.length} <span className="text-xs font-normal text-slate-400">logged logs</span>
            </h2>
          </div>
        </section>

        {/* Split Section Grid Row 1: Profile & Status Control */}
        <section className="grid gap-6 lg:grid-cols-2">
          
          <form
            onSubmit={handleUpdateProfile}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Edit Profile</h2>
              <p className="text-xs text-slate-400 mb-4">Update your structural parameters used for active dispatches.</p>
              
              <div className="space-y-4">
                <input
                  className={inputClasses}
                  name="fullName"
                  placeholder="Full Name"
                  value={profile.fullName}
                  onChange={updateProfileForm}
                  required
                  disabled={loading}
                />

                <input
                  className={inputClasses}
                  name="phone"
                  placeholder="Phone"
                  value={profile.phone}
                  onChange={updateProfileForm}
                  required
                  disabled={loading}
                />

                <input
                  className={inputClasses}
                  name="location"
                  placeholder="Location"
                  value={profile.location}
                  onChange={updateProfileForm}
                  disabled={loading}
                />

                <textarea
                  className={`${inputClasses} min-h-[100px] resize-none`}
                  name="medicalNotes"
                  placeholder="Medical Notes (e.g., blood group, allergies)"
                  value={profile.medicalNotes}
                  onChange={updateProfileForm}
                  disabled={loading}
                />
              </div>
            </div>

            <motion.button
              whileTap={!loading ? { scale: 0.985 } : {}}
              className="mt-5 w-full rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-700 disabled:opacity-50 shadow-sm"
              disabled={loading}
            >
              {loading ? "Saving Changes..." : "Update Profile"}
            </motion.button>
          </form>

          {/* Status Broadcaster Box */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Current Status</h2>
              <p className="text-xs text-slate-400 mb-4">Directly toggle system alerts mapped out across endpoints.</p>

              <div className="grid gap-3 sm:grid-cols-3">
                {["Safe", "Need Help", "Emergency"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusChange(status)}
                    disabled={loading}
                    className={`rounded-xl border px-4 py-4 text-sm font-semibold transition-all text-left flex flex-col justify-between h-20 ${
                      currentStatus === status
                        ? status === "Safe"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-500/10"
                          : status === "Need Help"
                          ? "border-amber-500 bg-amber-50 text-amber-700 ring-4 ring-amber-500/10"
                          : "border-rose-600 bg-rose-50 text-rose-700 ring-4 ring-rose-500/10"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${status === "Safe" ? "bg-emerald-500" : status === "Need Help" ? "bg-amber-500" : "bg-rose-500"}`} />
                    <span>{status}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 leading-relaxed">
              <strong>Notice:</strong> Changing your profile alert updates critical priority values across operational indices. Confirm configuration states are valid.
            </div>
          </div>
        </section>

        {/* Split Section Grid Row 2: Emergency Connections & Alerts */}
        <section className="grid gap-6 lg:grid-cols-2">
          
          <form
            onSubmit={handleAddContact}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col"
          >
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Emergency Contacts</h2>
            <p className="text-xs text-slate-400 mb-4">Add designated connections authorized for immediate ping dispatches.</p>

            <div className="space-y-4">
              <input
                className={inputClasses}
                name="name"
                placeholder="Contact Name"
                value={newContact.name}
                onChange={updateContactForm}
                required
                disabled={loading}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  className={inputClasses}
                  name="relation"
                  placeholder="Relation"
                  value={newContact.relation}
                  onChange={updateContactForm}
                  required
                  disabled={loading}
                />

                <input
                  className={inputClasses}
                  name="phone"
                  placeholder="Phone"
                  value={newContact.phone}
                  onChange={updateContactForm}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-slate-800 disabled:opacity-50"
              disabled={loading}
            >
              Add Contact
            </button>

            {/* Render Output List loop */}
            <div className="mt-6 space-y-3 overflow-y-auto max-h-[260px] pr-1">
              {emergencyContacts.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                  No emergency connections set up yet.
                </div>
              ) : (
                emergencyContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {contact.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="inline-block px-1.5 py-0.5 bg-slate-200 text-slate-700 font-medium rounded text-[10px] mr-2">{contact.relation}</span>
                        {contact.phone}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteContact(contact._id)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/60 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </form>

          {/* Activity Logs Frame */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Alerts</h2>
            <p className="text-xs text-slate-400 mb-4">Direct stream configuration logs broadcasted from index nodes.</p>

            <div className="space-y-3 overflow-y-auto max-h-[460px] pr-1">
              {recentAlerts.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                  No tracking broadcasts captured.
                </div>
              ) : (
                recentAlerts.map((alert) => (
                  <div
                    key={alert._id}
                    className={`rounded-xl border border-slate-200 border-l-4 p-4 bg-slate-50/40 ${
                      alert.level?.toLowerCase() === "critical"
                        ? "border-l-rose-500"
                        : alert.level?.toLowerCase() === "warning"
                        ? "border-l-amber-500"
                        : "border-l-teal-500"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {alert.title}
                      </h3>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                        alert.level?.toLowerCase() === "critical"
                          ? "bg-rose-50 text-rose-700"
                          : alert.level?.toLowerCase() === "warning"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-teal-50 text-teal-700"
                      }`}>
                        {alert.level}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{alert.detail}</p>
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