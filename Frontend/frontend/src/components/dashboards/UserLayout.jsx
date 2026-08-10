import { useEffect, useState } from "react";
import StatusMessage from "../../components/StatusMessage";
import { dashboardApi } from "../../api/dashboardApi";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../Logo";
import { motion, AnimatePresence } from "framer-motion";
import personal from "../../assets/personal.png";

export default function UserDashboard() {
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username") || "";
  const email = localStorage.getItem("email") || "";
  const navigate = useNavigate();

  // Intro splash state
  const [showIntro, setShowIntro] = useState(true);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
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
    <div className="relative min-h-screen bg-[#EFEBE4] text-[#2B2825] font-sans overflow-x-hidden selection:bg-[#D5C3B2]">
      {/* Editorial Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        .font-editorial-serif { font-family: 'Playfair Display', serif; }
        .font-script { font-family: 'Alex Brush', cursive; }
        .font-sans-clean { font-family: 'Montserrat', sans-serif; }
      `}</style>

      <AnimatePresence mode="wait">
        {showIntro ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#4F5643] cursor-pointer text-center p-6 text-[#EFEBE4]"
            onClick={() => setShowIntro(false)}
          >
            <img
              src={personal}
              alt="Welcome Screen"
              className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
            />
            <div className="relative z-10 space-y-4 max-w-lg">
              <p className="font-script text-4xl text-[#D8B092]">Protected & Safe</p>
              <h1 className="text-4xl md:text-6xl font-editorial-serif font-light tracking-wide text-white">
                Welcome, <span className="italic">{username || "Member"}</span>
              </h1>
              <p className="text-[10px] font-sans-clean tracking-[0.3em] uppercase text-[#C4C2B8]">
                Initializing SafeSphere Protocol
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="min-h-screen flex flex-col justify-between"
          >
            <div>
              {/* Header Navigation */}
              <header className="max-w-7xl mx-auto px-6 pt-8 pb-4 flex flex-col md:flex-row items-center justify-between gap-6 font-sans-clean">
                <div className="flex items-center gap-4">
                  <Logo />
                  <span className="font-script text-2xl text-[#A85A3C] pt-1">
                    {username || "Member"}
                  </span>
                </div>

                <nav className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#786E65]">
                  <span className="text-[#2B2825] border-b-2 border-[#A85A3C] pb-0.5">
                    Overview
                  </span>
                  <Link to="/sos" className="hover:text-[#A85A3C] transition">
                    SOS Signal
                  </Link>
                  <Link to="/reports" className="hover:text-[#A85A3C] transition">
                    Reports
                  </Link>
                  <Link to="/checkins" className="hover:text-[#A85A3C] transition">
                    Check-ins
                  </Link>
                  <Link to="/subscription" className="hover:text-[#A85A3C] transition">
                    Subscription
                  </Link>
                  <button onClick={handleLogout} className="hover:text-[#A85A3C] transition">
                    Logout
                  </button>
                </nav>
              </header>

              {/* Status Message Display */}
              {(message || error) && (
                <div className="max-w-4xl mx-auto px-6 my-2 font-sans-clean text-xs">
                  {message && <StatusMessage type="success">{message}</StatusMessage>}
                  {error && <StatusMessage type="error">{error}</StatusMessage>}
                </div>
              )}

              {/* Hero / Statement Header */}
              <section className="relative px-6 pt-10 pb-16 max-w-6xl mx-auto text-center">
                <p className="text-[10px] font-sans-clean tracking-[0.3em] uppercase text-[#A85A3C] font-semibold mb-2">
                  SAFETY · NETWORK · RESPONSE
                </p>
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-editorial-serif uppercase tracking-wider text-[#2B2825] leading-none mb-4">
                  SAFESPHERE
                </h1>
                <p className="text-xs uppercase tracking-[0.25em] text-[#786E65] font-sans-clean mb-6">
                  PROTECTION · CIRCLE · PROTOCOL
                </p>

                <div className="max-w-xl mx-auto relative space-y-4">
                  <p className="text-sm sm:text-base font-editorial-serif italic text-[#4F5643] leading-relaxed">
                    “Continuous vigilance interface and automated emergency response system designed to keep your trusted circle informed without compromise.”
                  </p>
                  <p className="font-script text-3xl text-[#A85A3C]">{username || "Member Safety"}</p>
                </div>
              </section>

              {/* Curved Organic Middle Banner */}
              <section className="relative bg-[#4F5643] text-[#EFEBE4] pt-12 pb-20 px-8 my-8 shadow-inner">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                  <div className="space-y-3 max-w-md">
                    <span className="text-[10px] font-sans-clean uppercase tracking-[0.25em] text-[#D8B092] font-semibold block">
                      CURRENT STATUS
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-editorial-serif italic">
                      Protocol Status: <span className="not-italic text-white underline decoration-[#A85A3C]">{currentStatus}</span>
                    </h2>
                    <p className="text-xs font-sans-clean font-light text-[#D5D2C8] leading-relaxed">
                      Live telemetry and automated alerts remain active for your registered contacts. Standard status monitoring is operational.
                    </p>
                  </div>

                  {/* Quick Action Button & Circle Counter */}
                  <div className="flex flex-col items-center gap-4 bg-[#424838] p-6 rounded-[2.5rem] border border-[#5C6350] shadow-md shrink-0">
                    <span className="text-3xl font-editorial-serif font-bold text-[#EFEBE4]">
                      {emergencyContacts.length}
                    </span>
                    <span className="text-[10px] font-sans-clean uppercase tracking-widest text-[#C4C2B8]">
                      Trusted Contacts
                    </span>
                    <Link
                      to="/sos"
                      className="mt-2 bg-[#A85A3C] hover:bg-[#8C462C] text-white px-6 py-2.5 rounded-full text-xs font-sans-clean font-semibold uppercase tracking-widest transition shadow-sm"
                    >
                      Trigger SOS
                    </Link>
                  </div>
                </div>

                {/* Organic Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none">
                  <svg className="relative block w-full h-10 sm:h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,0 C300,90 800,120 1200,40 L1200,120 L0,120 Z" fill="#EFEBE4"></path>
                  </svg>
                </div>
              </section>

              {/* Status Protocol Selection Buttons */}
              <section className="max-w-5xl mx-auto px-6 py-8">
                <div className="text-center mb-8">
                  <p className="font-script text-3xl text-[#A85A3C]">Broadcast Protocol</p>
                  <h2 className="text-xs font-sans-clean font-bold uppercase tracking-[0.2em] text-[#2B2825]">
                    Select Your State To Update Circle
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans-clean">
                  {/* Protocol Option 1 */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange("Safe")}
                    disabled={loading}
                    className={`p-6 rounded-[2rem] text-left transition-all border ${
                      currentStatus === "Safe"
                        ? "bg-[#2B2825] text-[#EFEBE4] border-[#2B2825] shadow-lg scale-[1.02]"
                        : "bg-[#F7F4EE] border-[#E2DDD3] text-[#2B2825] hover:border-[#A85A3C]"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#A85A3C] block mb-2">
                      Protocol I
                    </span>
                    <h3 className="text-lg font-editorial-serif italic mb-1">Safe &amp; Sound</h3>
                    <p className="text-xs font-light opacity-80">All clear, standard monitoring active.</p>
                  </button>

                  {/* Protocol Option 2 */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange("Need Help")}
                    disabled={loading}
                    className={`p-6 rounded-[2rem] text-left transition-all border ${
                      currentStatus === "Need Help"
                        ? "bg-[#2B2825] text-[#EFEBE4] border-[#2B2825] shadow-lg scale-[1.02]"
                        : "bg-[#F7F4EE] border-[#E2DDD3] text-[#2B2825] hover:border-[#A85A3C]"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#A85A3C] block mb-2">
                      Protocol II
                    </span>
                    <h3 className="text-lg font-editorial-serif italic mb-1">Request Check-in</h3>
                    <p className="text-xs font-light opacity-80">Notifies circle for a soft response check.</p>
                  </button>

                  {/* Protocol Option 3 */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange("Emergency")}
                    disabled={loading}
                    className={`p-6 rounded-[2rem] text-left transition-all border ${
                      currentStatus === "Emergency"
                        ? "bg-[#2B2825] text-[#EFEBE4] border-[#2B2825] shadow-lg scale-[1.02]"
                        : "bg-[#F7F4EE] border-[#E2DDD3] text-[#2B2825] hover:border-[#A85A3C]"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#A85A3C] block mb-2">
                      Protocol III
                    </span>
                    <h3 className="text-lg font-editorial-serif italic mb-1">Critical Distress</h3>
                    <p className="text-xs font-light opacity-80">Immediate distress alert dispatched.</p>
                  </button>
                </div>
              </section>

              {/* Bottom Split Layout: Dossier & Trusted Circle */}
              <section className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 rounded-[2.5rem] overflow-hidden shadow-xl">
                  
                  {/* Terracotta Block: Dossier Details */}
                  <div className="bg-[#A85A3C] text-white p-8 sm:p-10 font-sans-clean flex flex-col justify-between">
                    <div>
                      <span className="font-script text-3xl text-[#F7E1D3] block mb-1">Dossier Details</span>
                      <h2 className="text-lg font-bold uppercase tracking-widest text-white mb-6">
                        MY APPROACH & PROFILE
                      </h2>

                      <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-widest text-[#F0DFD5] mb-1">
                            Full Name
                          </label>
                          <input
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/50 outline-none focus:border-white transition"
                            name="fullName"
                            placeholder="Jane Doe"
                            value={profile.fullName}
                            onChange={updateProfileForm}
                            required
                            disabled={loading}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-widest text-[#F0DFD5] mb-1">
                            Phone Number
                          </label>
                          <input
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/50 outline-none focus:border-white transition"
                            name="phone"
                            placeholder="+1 (555) 000-0000"
                            value={profile.phone}
                            onChange={updateProfileForm}
                            required
                            disabled={loading}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-widest text-[#F0DFD5] mb-1">
                            Primary Location
                          </label>
                          <input
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/50 outline-none focus:border-white transition"
                            name="location"
                            placeholder="City or Region"
                            value={profile.location}
                            onChange={updateProfileForm}
                            disabled={loading}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-widest text-[#F0DFD5] mb-1">
                            Medical &amp; Personal Notes
                          </label>
                          <textarea
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/50 outline-none focus:border-white transition min-h-[80px] resize-none"
                            name="medicalNotes"
                            placeholder="Blood group, allergies, conditions..."
                            value={profile.medicalNotes}
                            onChange={updateProfileForm}
                            disabled={loading}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="mt-2 w-full bg-white text-[#A85A3C] hover:bg-[#F7F4EE] font-bold text-xs uppercase tracking-widest py-3 rounded-full transition"
                        >
                          {loading ? "Updating..." : "Save Safety Profile"}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Sage Green Block: Trusted Circle */}
                  <div className="bg-[#A4B096] text-[#2B2825] p-8 sm:p-10 font-sans-clean flex flex-col justify-between">
                    <div>
                      <span className="font-script text-3xl text-[#3A452D] block mb-1">Trusted Circle</span>
                      <h2 className="text-lg font-bold uppercase tracking-widest text-[#2B2825] mb-6">
                        SAFETY SERVICES & CONTACTS
                      </h2>

                      {/* Add Contact Form */}
                      <form onSubmit={handleAddContact} className="space-y-3 mb-6 bg-white/40 p-4 rounded-2xl border border-white/30">
                        <input
                          className="w-full bg-white/80 border border-[#8B987C] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#2B2825]"
                          name="name"
                          placeholder="Contact Name"
                          value={newContact.name}
                          onChange={updateContactForm}
                          required
                          disabled={loading}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            className="w-full bg-white/80 border border-[#8B987C] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#2B2825]"
                            name="relation"
                            placeholder="Relation"
                            value={newContact.relation}
                            onChange={updateContactForm}
                            required
                            disabled={loading}
                          />
                          <input
                            className="w-full bg-white/80 border border-[#8B987C] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#2B2825]"
                            name="phone"
                            placeholder="Phone Number"
                            value={newContact.phone}
                            onChange={updateContactForm}
                            required
                            disabled={loading}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-[#4F5643] hover:bg-[#3D4334] text-white text-xs font-bold uppercase tracking-widest py-2.5 rounded-full transition"
                        >
                          + Add Circle Member
                        </button>
                      </form>

                      {/* Contacts List */}
                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                        {emergencyContacts.length === 0 ? (
                          <p className="text-xs text-[#3A452D] text-center py-6 italic font-editorial-serif">
                            No members added to your trusted circle yet.
                          </p>
                        ) : (
                          emergencyContacts.map((contact) => (
                            <div
                              key={contact._id}
                              className="bg-white/80 rounded-xl p-3 flex items-center justify-between shadow-sm"
                            >
                              <div>
                                <h3 className="text-sm font-editorial-serif font-bold text-[#2B2825]">
                                  {contact.name}
                                </h3>
                                <p className="text-[11px] text-[#55504A]">
                                  {contact.relation} · {contact.phone}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteContact(contact._id)}
                                className="text-[10px] font-bold uppercase tracking-widest text-[#A85A3C] hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </section>
            </div>

            {/* Editorial Footer */}
            <footer className="border-t border-[#E2DDD3] py-8 text-center font-sans-clean text-[10px] uppercase tracking-[0.25em] text-[#786E65]">
              <p>SafeSphere · Personal Emergency Network Protocol</p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}