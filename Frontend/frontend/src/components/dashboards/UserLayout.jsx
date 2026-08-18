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
    <div className="relative min-h-screen bg-[#F9F8F3] text-[#2C3531] font-sans overflow-x-hidden selection:bg-[#D4B683]">
      {/* Editorial Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
        .font-editorial-serif { font-family: 'Cormorant Garamond', serif; }
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
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#4A6054] cursor-pointer text-center p-6 text-[#F9F8F3]"
            onClick={() => setShowIntro(false)}
          >
            <img
              src={personal}
              alt="Welcome Screen"
              className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-overlay"
            />
            <div className="relative z-10 space-y-4 max-w-lg">
              <p className="font-script text-5xl text-[#D4B683]">welcome</p>
              <h1 className="text-4xl md:text-5xl font-editorial-serif font-light tracking-wider uppercase text-white">
                NOURISH YOUR MIND, BODY AND SOUL
              </h1>
              <p className="text-[10px] font-sans-clean tracking-[0.35em] uppercase text-[#C2C9C5]">
                INITIALIZING SAFESPHERE PROTOCOL
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
              {/* Top Navigation */}
              <header className="max-w-6xl mx-auto px-6 pt-8 pb-4 flex flex-col md:flex-row items-center justify-between gap-6 font-sans-clean border-b border-[#E3E0D6]">
                <div className="flex items-center gap-3">
                  <Logo />
                  <span className="font-script text-3xl text-[#4A6054] pt-1">
                    {username || "Member"}
                  </span>
                </div>

                <nav className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-medium uppercase tracking-[0.25em] text-[#6A7570]">
                  <span className="text-[#2C3531] border-b border-[#4A6054] pb-0.5 font-semibold">
                    Overview
                  </span>
                  <Link to="/sos" className="hover:text-[#4A6054] transition">
                    SOS Signal
                  </Link>
                  <Link to="/reports" className="hover:text-[#4A6054] transition">
                    Reports
                  </Link>
                  <Link to="/checkins" className="hover:text-[#4A6054] transition">
                    Check-ins
                  </Link>
                  <Link to="/subscription" className="hover:text-[#4A6054] transition">
                    Subscription
                  </Link>
                  <Link to="/trusted-contacts" className="hover:text-[#4A6054] transition">
                    Trusted Contacts
                  </Link>
                  <button onClick={handleLogout} className="hover:text-[#4A6054] transition">
                    Logout
                  </button>
                </nav>
              </header>

              {/* Status Message Display */}
              {(message || error) && (
                <div className="max-w-4xl mx-auto px-6 my-4 font-sans-clean text-xs">
                  {message && <StatusMessage type="success">{message}</StatusMessage>}
                  {error && <StatusMessage type="error">{error}</StatusMessage>}
                </div>
              )}

              {/* Hero / Welcome Split Layout */}
              <section className="relative px-6 pt-12 pb-16 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Asymmetric Image Frame */}
                  <div className="md:col-span-5 relative">
                    <div className="absolute -top-4 -left-4 w-full h-full border border-[#D4B683] rounded-sm pointer-events-none" />
                    <div className="relative bg-[#3B4E44] p-3 shadow-lg">
                      <img
                        src={personal}
                        alt="Profile Overview"
                        className="w-full h-[320px] object-cover filter brightness-95 contrast-105"
                      />
                    </div>
                  </div>

                  {/* Right Editorial Copy */}
                  <div className="md:col-span-7 space-y-4 md:pl-6">
                    <p className="font-script text-4xl text-[#D4B683]">welcome</p>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-editorial-serif font-light uppercase tracking-wider text-[#2C3531] leading-tight">
                      NOURISH YOUR MIND, BODY, AND SOUL WITH PEACE OF MIND.
                    </h1>
                    <p className="text-xs font-sans-clean text-[#6A7570] leading-relaxed max-w-lg">
                      Continuous vigilance interface and automated emergency response system designed to keep your trusted circle informed without compromise.
                    </p>
                    <div className="pt-2">
                      <Link
                        to="/sos"
                        className="inline-block bg-[#4A6054] hover:bg-[#3B4E44] text-[#F9F8F3] px-7 py-3 text-[10px] font-sans-clean tracking-[0.25em] uppercase transition shadow-sm"
                      >
                        Explore Protection
                      </Link>
                    </div>
                  </div>

                </div>
              </section>

              {/* Full-width Sage Green Banner Section */}
              <section className="relative bg-[#4A6054] text-[#F9F8F3] py-20 px-8 my-8 overflow-hidden">
                {/* Background particle shimmer overlay */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4B683_1px,transparent_1px)] [background-size:16px_16px]" />

                <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
                  <h2 className="text-2xl sm:text-4xl font-editorial-serif font-light uppercase tracking-widest text-[#F9F8F3]">
                    ARE YOU FEELING OVERWHELMED, STRESSED &amp; ANXIOUS?
                  </h2>
                  <p className="text-xs font-sans-clean text-[#D3DAD6] leading-relaxed max-w-2xl mx-auto">
                    Live telemetry and automated alerts remain active for your registered contacts. Current Protocol Status: <span className="text-[#D4B683] font-semibold uppercase">{currentStatus}</span>
                  </p>
                  <div>
                    <span className="inline-block border-b border-[#D4B683] pb-1 text-[#D4B683] text-[10px] font-sans-clean uppercase tracking-[0.3em]">
                      {emergencyContacts.length} Trusted Contacts Connected
                    </span>
                  </div>
                </div>
              </section>

              {/* Status Protocol Options */}
              <section className="max-w-5xl mx-auto px-6 py-12">
                <div className="text-center mb-10">
                  <p className="font-script text-4xl text-[#D4B683]">broadcast protocol</p>
                  <h2 className="text-xs font-sans-clean font-semibold uppercase tracking-[0.25em] text-[#2C3531]">
                    SELECT YOUR STATE TO UPDATE YOUR CIRCLE
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans-clean">
                  {/* Option 1 */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange("Safe")}
                    disabled={loading}
                    className={`p-8 text-left transition-all border ${
                      currentStatus === "Safe"
                        ? "bg-[#4A6054] text-[#F9F8F3] border-[#4A6054] shadow-md"
                        : "bg-white border-[#E3E0D6] text-[#2C3531] hover:border-[#4A6054]"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-semibold tracking-[0.2em] text-[#D4B683] block mb-2">
                      Protocol I
                    </span>
                    <h3 className="text-2xl font-editorial-serif italic mb-2">Safe &amp; Sound</h3>
                    <p className="text-xs font-light opacity-80 leading-relaxed">
                      All clear, standard monitoring active across your circle.
                    </p>
                  </button>

                  {/* Option 2 */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange("Need Help")}
                    disabled={loading}
                    className={`p-8 text-left transition-all border ${
                      currentStatus === "Need Help"
                        ? "bg-[#4A6054] text-[#F9F8F3] border-[#4A6054] shadow-md"
                        : "bg-white border-[#E3E0D6] text-[#2C3531] hover:border-[#4A6054]"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-semibold tracking-[0.2em] text-[#D4B683] block mb-2">
                      Protocol II
                    </span>
                    <h3 className="text-2xl font-editorial-serif italic mb-2">Request Check-in</h3>
                    <p className="text-xs font-light opacity-80 leading-relaxed">
                      Notifies circle for a soft response check.
                    </p>
                  </button>

                  {/* Option 3 */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange("Emergency")}
                    disabled={loading}
                    className={`p-8 text-left transition-all border ${
                      currentStatus === "Emergency"
                        ? "bg-[#4A6054] text-[#F9F8F3] border-[#4A6054] shadow-md"
                        : "bg-white border-[#E3E0D6] text-[#2C3531] hover:border-[#4A6054]"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-semibold tracking-[0.2em] text-[#D4B683] block mb-2">
                      Protocol III
                    </span>
                    <h3 className="text-2xl font-editorial-serif italic mb-2">Critical Distress</h3>
                    <p className="text-xs font-light opacity-80 leading-relaxed">
                      Immediate distress alert dispatched to trusted list.
                    </p>
                  </button>
                </div>
              </section>

              {/* Bottom Split Section: Profile & Contacts */}
              <section className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Left Block: Dossier Profile */}
                  <div className="bg-white border border-[#E3E0D6] p-8 sm:p-10 font-sans-clean relative">
                    <span className="font-script text-3xl text-[#D4B683] block mb-1">dossier details</span>
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2C3531] mb-6 border-b border-[#E3E0D6] pb-3">
                      MY APPROACH &amp; PROFILE
                    </h2>

                    <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                      <div>
                        <label className="block text-[10px] uppercase font-semibold tracking-wider text-[#6A7570] mb-1">
                          Full Name
                        </label>
                        <input
                          className="w-full bg-[#F9F8F3] border border-[#E3E0D6] rounded-none px-4 py-2.5 text-[#2C3531] outline-none focus:border-[#4A6054] transition"
                          name="fullName"
                          placeholder="Jane Doe"
                          value={profile.fullName}
                          onChange={updateProfileForm}
                          required
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-semibold tracking-wider text-[#6A7570] mb-1">
                          Phone Number
                        </label>
                        <input
                          className="w-full bg-[#F9F8F3] border border-[#E3E0D6] rounded-none px-4 py-2.5 text-[#2C3531] outline-none focus:border-[#4A6054] transition"
                          name="phone"
                          placeholder="+1 (555) 000-0000"
                          value={profile.phone}
                          onChange={updateProfileForm}
                          required
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-semibold tracking-wider text-[#6A7570] mb-1">
                          Primary Location
                        </label>
                        <input
                          className="w-full bg-[#F9F8F3] border border-[#E3E0D6] rounded-none px-4 py-2.5 text-[#2C3531] outline-none focus:border-[#4A6054] transition"
                          name="location"
                          placeholder="City or Region"
                          value={profile.location}
                          onChange={updateProfileForm}
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-semibold tracking-wider text-[#6A7570] mb-1">
                          Medical &amp; Personal Notes
                        </label>
                        <textarea
                          className="w-full bg-[#F9F8F3] border border-[#E3E0D6] rounded-none px-4 py-2.5 text-[#2C3531] outline-none focus:border-[#4A6054] transition min-h-[80px] resize-none"
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
                        className="mt-2 w-full bg-[#4A6054] hover:bg-[#3B4E44] text-[#F9F8F3] font-semibold text-[10px] uppercase tracking-[0.2em] py-3 transition"
                      >
                        {loading ? "Updating..." : "Save Safety Profile"}
                      </button>
                    </form>
                  </div>

                  {/* Right Block: Trusted Circle */}
                  <div className="bg-[#4A6054] text-[#F9F8F3] p-8 sm:p-10 font-sans-clean flex flex-col justify-between">
                    <div>
                      <span className="font-script text-3xl text-[#D4B683] block mb-1">trusted circle</span>
                      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#F9F8F3] mb-6 border-b border-[#6A7D72] pb-3">
                        SAFETY SERVICES &amp; CONTACTS
                      </h2>

                      {/* Add Contact Form */}
                      <form onSubmit={handleAddContact} className="space-y-3 mb-6 bg-[#3B4E44] p-4 border border-[#5C7366]">
                        <input
                          className="w-full bg-[#F9F8F3] border border-transparent px-3 py-2 text-xs text-[#2C3531] outline-none focus:border-[#D4B683]"
                          name="name"
                          placeholder="Contact Name"
                          value={newContact.name}
                          onChange={updateContactForm}
                          required
                          disabled={loading}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            className="w-full bg-[#F9F8F3] border border-transparent px-3 py-2 text-xs text-[#2C3531] outline-none focus:border-[#D4B683]"
                            name="relation"
                            placeholder="Relation"
                            value={newContact.relation}
                            onChange={updateContactForm}
                            required
                            disabled={loading}
                          />
                          <input
                            className="w-full bg-[#F9F8F3] border border-transparent px-3 py-2 text-xs text-[#2C3531] outline-none focus:border-[#D4B683]"
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
                          className="w-full bg-[#D4B683] hover:bg-[#c2a370] text-[#2C3531] text-[10px] font-semibold uppercase tracking-[0.2em] py-2.5 transition"
                        >
                          + Add Circle Member
                        </button>
                      </form>

                      {/* Contacts List */}
                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                        {emergencyContacts.length === 0 ? (
                          <p className="text-xs text-[#C2C9C5] text-center py-6 italic font-editorial-serif">
                            No members added to your trusted circle yet.
                          </p>
                        ) : (
                          emergencyContacts.map((contact) => (
                            <div
                              key={contact._id}
                              className="bg-[#3B4E44] border border-[#5C7366] p-3 flex items-center justify-between"
                            >
                              <div>
                                <h3 className="text-lg font-editorial-serif font-light text-[#F9F8F3]">
                                  {contact.name}
                                </h3>
                                <p className="text-[10px] text-[#C2C9C5]">
                                  {contact.relation} · {contact.phone}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteContact(contact._id)}
                                className="text-[10px] font-semibold uppercase tracking-wider text-[#D4B683] hover:underline"
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

            {/* Footer */}
            <footer className="border-t border-[#E3E0D6] py-8 text-center font-sans-clean text-[10px] uppercase tracking-[0.25em] text-[#6A7570]">
              <p>SafeSphere · Personal Emergency Network Protocol</p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}