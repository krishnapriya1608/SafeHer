import { useEffect, useState } from "react";
import StatusMessage from "../../components/StatusMessage";
import { dashboardApi } from "../../api/dashboardApi";
import { Link } from "react-router-dom";

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
      setError("User profile not loaded. Please log in again.");
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
      setMessage(response.data.message || "Safety profile updated successfully");
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
      setMessage(response.data.message || "Trusted contact added");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add contact");
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
      setMessage(response.data.message || "Contact removed from safety net");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove contact");
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
    <div className="flex min-h-screen bg-[#3b6070] text-[#2b3a42] font-sans p-4 lg:p-6 gap-6">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col justify-between w-20 lg:w-24 py-4 items-center text-white/70">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-white text-lg">
            <span className="text-2xl">❖</span>
            <span className="hidden lg:inline text-sm font-semibold tracking-wide">Circle</span>
          </div>

          <nav className="flex flex-col gap-6 text-xs font-medium items-center">
            <button className="flex flex-col items-center gap-1 text-white bg-white/10 p-3 rounded-2xl w-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="hidden lg:inline text-[10px]">OVERVIEW</span>
            </button>
            <button className="flex flex-col items-center gap-1 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="hidden lg:inline text-[10px]">REPORTS</span>
            </button>
          </nav>
        </div>

        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" alt="Profile" className="w-full h-full object-cover" />
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 bg-[#f4f7f8] rounded-3xl p-6 lg:p-8 flex flex-col gap-6 shadow-2xl overflow-y-auto">
        {/* Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/60 pb-4">
          <div className="flex items-center gap-6 text-sm font-medium text-stone-500">
            <span className="text-[#1c5569] font-bold tracking-wider uppercase text-xs">DASHBOARD</span>
            <span className="cursor-pointer hover:text-stone-800 transition">INSIGHTS</span>
            <span className="cursor-pointer hover:text-stone-800 transition">CHANNELS</span>
          </div>

          <Link
            to="/sos"
            className="bg-[#f08554] hover:bg-[#e07240] text-white px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide shadow-md transition duration-200 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Trigger SOS
          </Link>
        </header>

        {/* Dynamic Alerts */}
        {(message || error) && (
          <div className="space-y-2">
            {message && <StatusMessage type="success">{message}</StatusMessage>}
            {error && <StatusMessage type="error">{error}</StatusMessage>}
          </div>
        )}

        {/* Hero Section Banner */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-gradient-to-r from-[#2c7185] to-[#408a9f] rounded-3xl p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-sm">
            <div className="space-y-2 z-10">
              <span className="text-xs uppercase tracking-widest text-teal-100 font-medium">SafeCircle Network</span>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Welcome back, {username || email || "User"}
              </h1>
              <p className="text-sm text-teal-50 max-w-sm pt-1 opacity-90">
                Personal Emergency Network & Continuous Vigilance Interface
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 z-10">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl flex items-center gap-3">
                <span className="text-xs text-teal-100">Status</span>
                <span className="text-sm font-semibold text-white">{currentStatus}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl flex items-center gap-3">
                <span className="text-xs text-teal-100">Network</span>
                <span className="text-sm font-semibold text-white">{emergencyContacts.length} Linked</span>
              </div>
            </div>

            <button className="self-start mt-6 bg-[#1f505f] hover:bg-[#173e4a] text-white text-xs font-medium px-6 py-3 rounded-full flex items-center gap-2 transition z-10 shadow-sm">
              VIEW FULL STATISTIC
              <span>›</span>
            </button>
          </div>

          {/* Side Highlight Card */}
          <div className="lg:col-span-4 bg-[#fde9df] rounded-3xl p-6 flex flex-col justify-between shadow-sm border border-orange-100">
            <div>
              <span className="text-xs font-bold text-stone-700 tracking-wide">Protocol Overview</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-black text-stone-800">{emergencyContacts.length + recentAlerts.length}</span>
                <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">+2 Active</span>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <p className="text-xs text-stone-600 leading-relaxed">
                Your emergency contact list and status updates help keep your personal circle informed in real-time.
              </p>
              <div className="bg-white/80 p-3 rounded-2xl flex items-center gap-3 text-xs text-stone-700 shadow-xs">
                <span className="p-2 bg-orange-100 text-orange-600 rounded-xl">⚡</span>
                <span className="font-medium">Live Telemetry & GPS Sync Active</span>
              </div>
            </div>
          </div>
        </section>

        {/* Status Broadcaster Options */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4">
          <div>
            <h2 className="text-base font-bold text-stone-800">Select Current Protocol</h2>
            <p className="text-xs text-stone-400">Broadcast your state instantly to your trusted circle</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => handleStatusChange("Safe")}
              disabled={loading}
              className={`p-4 rounded-2xl text-left border transition flex items-center justify-between ${
                currentStatus === "Safe"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : "bg-stone-50 border-stone-100 text-stone-600 hover:bg-stone-100"
              }`}
            >
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-600">Status I</div>
                <div className="text-sm font-semibold mt-0.5">Safe & Sound</div>
              </div>
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange("Need Help")}
              disabled={loading}
              className={`p-4 rounded-2xl text-left border transition flex items-center justify-between ${
                currentStatus === "Need Help"
                  ? "bg-amber-50 border-amber-300 text-amber-900"
                  : "bg-stone-50 border-stone-100 text-stone-600 hover:bg-stone-100"
              }`}
            >
              <div>
                <div className="text-[10px] uppercase font-bold text-amber-600">Status II</div>
                <div className="text-sm font-semibold mt-0.5">Need Check-in</div>
              </div>
              <span className="h-3 w-3 rounded-full bg-amber-500" />
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange("Emergency")}
              disabled={loading}
              className={`p-4 rounded-2xl text-left border transition flex items-center justify-between ${
                currentStatus === "Emergency"
                  ? "bg-rose-50 border-rose-300 text-rose-900"
                  : "bg-stone-50 border-stone-100 text-stone-600 hover:bg-stone-100"
              }`}
            >
              <div>
                <div className="text-[10px] uppercase font-bold text-rose-600">Status III</div>
                <div className="text-sm font-semibold mt-0.5">Critical Distress</div>
              </div>
              <span className="h-3 w-3 rounded-full bg-rose-500" />
            </button>
          </div>
        </section>

        {/* Profile & Form Card Section */}
        <section className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-stone-100 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-stone-800">Emergency Profile Dossier</h2>
            <p className="text-xs text-stone-400">Information dispatched to responder services during active alerts</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Full Name</label>
                <input
                  className="w-full bg-[#f4f7f8] rounded-xl px-4 py-2.5 text-xs text-stone-800 border border-transparent focus:border-[#3b6070] focus:bg-white outline-none transition"
                  name="fullName"
                  placeholder="Jane Doe"
                  value={profile.fullName}
                  onChange={updateProfileForm}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">Phone Number</label>
                <input
                  className="w-full bg-[#f4f7f8] rounded-xl px-4 py-2.5 text-xs text-stone-800 border border-transparent focus:border-[#3b6070] focus:bg-white outline-none transition"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={profile.phone}
                  onChange={updateProfileForm}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">Primary Zone / Location</label>
              <input
                className="w-full bg-[#f4f7f8] rounded-xl px-4 py-2.5 text-xs text-stone-800 border border-transparent focus:border-[#3b6070] focus:bg-white outline-none transition"
                name="location"
                placeholder="City, District or Zone"
                value={profile.location}
                onChange={updateProfileForm}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">Medical & Emergency Notes</label>
              <textarea
                className="w-full bg-[#f4f7f8] rounded-xl px-4 py-2.5 text-xs text-stone-800 border border-transparent focus:border-[#3b6070] focus:bg-white outline-none transition min-h-[80px] resize-none"
                name="medicalNotes"
                placeholder="Allergies, blood type, pre-existing conditions..."
                value={profile.medicalNotes}
                onChange={updateProfileForm}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#2c7185] hover:bg-[#1f505f] text-white px-6 py-2.5 rounded-full text-xs font-semibold transition duration-200 shadow-sm"
            >
              {loading ? "Saving Profile..." : "Update Safety Profile"}
            </button>
          </form>
        </section>

        {/* Two Column Grid: Trusted Circle & Activity Feed */}
        <section className="grid gap-6 lg:grid-cols-12">
          {/* Trusted Circle */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-sm border border-stone-100 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-800">Trusted Safety Circle</h2>
              <p className="text-xs text-stone-400 mb-4">Contacts notified on emergency broadcasts</p>

              <form onSubmit={handleAddContact} className="space-y-3 bg-[#f4f7f8] p-4 rounded-2xl">
                <input
                  className="w-full bg-white rounded-xl px-3 py-2 text-xs text-stone-800 border border-stone-200 focus:outline-none"
                  name="name"
                  placeholder="Contact Name"
                  value={newContact.name}
                  onChange={updateContactForm}
                  required
                  disabled={loading}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="w-full bg-white rounded-xl px-3 py-2 text-xs text-stone-800 border border-stone-200 focus:outline-none"
                    name="relation"
                    placeholder="Relation"
                    value={newContact.relation}
                    onChange={updateContactForm}
                    required
                    disabled={loading}
                  />
                  <input
                    className="w-full bg-white rounded-xl px-3 py-2 text-xs text-stone-800 border border-stone-200 focus:outline-none"
                    name="phone"
                    placeholder="Phone"
                    value={newContact.phone}
                    onChange={updateContactForm}
                    required
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3b6070] hover:bg-[#2c4a57] text-white py-2 rounded-xl text-xs font-semibold transition"
                >
                  + Add Contact
                </button>
              </form>

              <div className="mt-4 space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {emergencyContacts.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-6">No emergency contacts added yet.</p>
                ) : (
                  emergencyContacts.map((contact) => (
                    <div
                      key={contact._id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#f4f7f8]"
                    >
                      <div>
                        <h3 className="text-xs font-bold text-stone-800">{contact.name}</h3>
                        <p className="text-[11px] text-stone-500">
                          {contact.relation} • {contact.phone}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteContact(contact._id)}
                        className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold uppercase tracking-wider"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-sm border border-stone-100 flex flex-col">
            <h2 className="text-base font-bold text-stone-800">Safety Activity Feed</h2>
            <p className="text-xs text-stone-400 mb-4">Audit log of system telemetry and user status updates</p>

            <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
              {recentAlerts.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-12">No system activity logs recorded.</p>
              ) : (
                recentAlerts.map((alert) => (
                  <div key={alert._id} className="p-3.5 rounded-2xl bg-[#f4f7f8] space-y-1">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold text-stone-800">{alert.title}</h3>
                      <span className="text-[9px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                        {alert.level}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500">{alert.detail}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}