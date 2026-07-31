import { useEffect, useState } from "react";
import StatusMessage from "../../components/StatusMessage";
import { dashboardApi } from "../../api/dashboardApi";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../Logo";
import { motion, AnimatePresence } from "framer-motion";
import personal from '../../assets/personal.png';

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

    // Auto-dismiss the intro splash after 2.5 seconds
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
        <div className="relative min-h-screen bg-[#f7f4ee] text-[#2c2825] font-serif overflow-hidden selection:bg-[#d5cebf]">
            <AnimatePresence mode="wait">
                {showIntro ? (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#211e1c] cursor-pointer text-center p-6"
                        onClick={() => setShowIntro(false)}
                    >
                        <img
                            src={personal}
                            alt="Welcome Screen"
                            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
                        />
                        <div className="relative z-10 space-y-4 max-w-lg">
                            <h2 className="text-xs uppercase tracking-[0.3em] text-[#c2bba8] font-sans">
                                SafeCircle Network
                            </h2>
                            <h1 className="text-4xl md:text-6xl font-light text-[#f0eae1] tracking-wide">
                                Welcome, <span className="italic font-normal">{username || "User"}</span>
                            </h1>
                            <p className="text-xs font-sans tracking-widest text-[#a8a193] uppercase">
                                Initializing Protocol
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-6xl mx-auto px-4 py-8 md:px-12 md:py-12 flex flex-col gap-12"
                    >
                        {/* Header Navigation */}
                        <header className="flex flex-col md:flex-row items-center justify-between border-b border-[#ded7ca] pb-6 gap-6">
                            <div className="flex items-center gap-6">
                                <Logo />
                                <span className="text-2xl font-light italic text-[#3d3733]">
                                    {username || "Member"}
                                </span>
                            </div>

                            <nav className="flex items-center gap-8 text-xs font-sans uppercase tracking-[0.2em] text-[#6b635b]">
                                <span className="text-[#1c1917] font-semibold border-b border-[#1c1917] pb-1">
                                    Overview
                                </span>
                                <Link to="/sos" className="hover:text-[#1c1917] transition">
                                    SOS Signal
                                </Link>
                                <button onClick={handleLogout} className="hover:text-[#1c1917] transition">
                                    Logout
                                </button>
                            </nav>
                        </header>

                        {/* Status Messages */}
                        {(message || error) && (
                            <div className="space-y-2 font-sans text-xs tracking-wide">
                                {message && <StatusMessage type="success">{message}</StatusMessage>}
                                {error && <StatusMessage type="error">{error}</StatusMessage>}
                            </div>
                        )}

                        {/* Hero / Statement Section */}
                        <section className="text-center space-y-4 py-6 max-w-2xl mx-auto">
                            <h1 className="text-3xl md:text-5xl font-light tracking-wide uppercase text-[#211e1c]">
                                Safe Circle <span className="italic font-normal lowercase font-serif">&amp; Protection</span>
                            </h1>
                            <p className="text-sm font-sans tracking-wide text-[#6e665d] leading-relaxed">
                                Continuous vigilance interface and emergency broadcast response system. 
                                Keep your trusted circle updated seamlessly.
                            </p>
                            <div className="pt-2">
                                <Link
                                    to="/sos"
                                    className="inline-block border border-[#8c8273] text-[#2c2825] px-8 py-2.5 rounded-full text-xs font-sans uppercase tracking-[0.2em] hover:bg-[#e8e2d5] transition duration-300"
                                >
                                    Trigger Emergency SOS
                                </Link>
                            </div>
                        </section>

                        {/* Feature Banner Section - Styled like the middle banner image */}
                        <section className="grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-sm border border-[#e2dcd0] shadow-sm">
                            <div className="md:col-span-7 relative min-h-[260px] bg-[#d9d3c7]">
                                <img
                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800"
                                    alt="Circle"
                                    className="w-full h-full object-cover grayscale opacity-90 mix-blend-multiply"
                                />
                            </div>
                            <div className="md:col-span-5 bg-[#9e9687] text-[#f7f4ee] p-8 md:p-10 flex flex-col justify-between">
                                <div className="space-y-2">
                                    <span className="text-[10px] uppercase tracking-[0.3em] font-sans text-[#ded8cb]">
                                        Your Status
                                    </span>
                                    <h2 className="text-3xl font-light italic">
                                        No. 1 <span className="not-italic">{currentStatus}</span>
                                    </h2>
                                </div>

                                <div className="space-y-4 pt-8">
                                    <div className="border-t border-[#b8b0a1] pt-4 text-xs font-sans tracking-wider space-y-1">
                                        <p className="uppercase text-[#ded8cb]">Network Status</p>
                                        <p className="text-lg font-serif">{emergencyContacts.length} Contacts Linked</p>
                                    </div>
                                    <p className="text-xs font-sans text-[#ebe5d8] leading-relaxed">
                                        Live telemetry and automated alerts remain active for your registered devices.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Status Protocol Selection */}
                        <section className="space-y-6 pt-4">
                            <div className="text-center space-y-1">
                                <h2 className="text-2xl font-light uppercase tracking-wide">
                                    Broadcast <span className="italic font-serif lowercase">Protocol</span>
                                </h2>
                                <p className="text-xs font-sans text-[#7a7267] uppercase tracking-widest">
                                    Select your state to inform your network
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange("Safe")}
                                    disabled={loading}
                                    className={`p-6 border text-left transition duration-300 ${
                                        currentStatus === "Safe"
                                            ? "bg-[#211e1c] text-[#f7f4ee] border-[#211e1c]"
                                            : "bg-[#f2ece1] border-[#ded7ca] text-[#2c2825] hover:border-[#8c8273]"
                                    }`}
                                >
                                    <span className="text-[10px] tracking-[0.2em] uppercase text-[#a89f91] block mb-2">
                                        Protocol I
                                    </span>
                                    <h3 className="text-base font-serif italic mb-1">Safe &amp; Sound</h3>
                                    <p className="text-[11px] opacity-80 font-light">All clear, standard monitoring active.</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleStatusChange("Need Help")}
                                    disabled={loading}
                                    className={`p-6 border text-left transition duration-300 ${
                                        currentStatus === "Need Help"
                                            ? "bg-[#211e1c] text-[#f7f4ee] border-[#211e1c]"
                                            : "bg-[#f2ece1] border-[#ded7ca] text-[#2c2825] hover:border-[#8c8273]"
                                    }`}
                                >
                                    <span className="text-[10px] tracking-[0.2em] uppercase text-[#a89f91] block mb-2">
                                        Protocol II
                                    </span>
                                    <h3 className="text-base font-serif italic mb-1">Request Check-in</h3>
                                    <p className="text-[11px] opacity-80 font-light">Notifies circle for a soft response check.</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleStatusChange("Emergency")}
                                    disabled={loading}
                                    className={`p-6 border text-left transition duration-300 ${
                                        currentStatus === "Emergency"
                                            ? "bg-[#211e1c] text-[#f7f4ee] border-[#211e1c]"
                                            : "bg-[#f2ece1] border-[#ded7ca] text-[#2c2825] hover:border-[#8c8273]"
                                    }`}
                                >
                                    <span className="text-[10px] tracking-[0.2em] uppercase text-[#a89f91] block mb-2">
                                        Protocol III
                                    </span>
                                    <h3 className="text-base font-serif italic mb-1">Critical Distress</h3>
                                    <p className="text-[11px] opacity-80 font-light">Immediate distress alert dispatched.</p>
                                </button>
                            </div>
                        </section>

                        {/* Dynamic Profiles & Gallery Style Cards */}
                        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 border-t border-[#ded7ca] pt-12">
                            {/* Emergency Profile Form */}
                            <div className="lg:col-span-6 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-light uppercase tracking-wide">
                                        Dossier <span className="italic font-serif lowercase">Details</span>
                                    </h2>
                                    <p className="text-xs font-sans text-[#7a7267] tracking-wider uppercase mt-1">
                                        Information dispatched during emergency dispatch
                                    </p>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-4 font-sans text-xs">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="uppercase tracking-widest text-[10px] text-[#6b635b]">Full Name</label>
                                            <input
                                                className="w-full bg-[#f0eae1] border border-[#d3ccbe] px-4 py-3 outline-none focus:border-[#211e1c] transition"
                                                name="fullName"
                                                placeholder="Jane Doe"
                                                value={profile.fullName}
                                                onChange={updateProfileForm}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="uppercase tracking-widest text-[10px] text-[#6b635b]">Phone Number</label>
                                            <input
                                                className="w-full bg-[#f0eae1] border border-[#d3ccbe] px-4 py-3 outline-none focus:border-[#211e1c] transition"
                                                name="phone"
                                                placeholder="+1 (555) 000-0000"
                                                value={profile.phone}
                                                onChange={updateProfileForm}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="uppercase tracking-widest text-[10px] text-[#6b635b]">Primary Location</label>
                                        <input
                                            className="w-full bg-[#f0eae1] border border-[#d3ccbe] px-4 py-3 outline-none focus:border-[#211e1c] transition"
                                            name="location"
                                            placeholder="City, District or Region"
                                            value={profile.location}
                                            onChange={updateProfileForm}
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="uppercase tracking-widest text-[10px] text-[#6b635b]">Medical &amp; Personal Notes</label>
                                        <textarea
                                            className="w-full bg-[#f0eae1] border border-[#d3ccbe] px-4 py-3 outline-none focus:border-[#211e1c] transition min-h-[90px] resize-none"
                                            name="medicalNotes"
                                            placeholder="Blood group, allergies, vital conditions..."
                                            value={profile.medicalNotes}
                                            onChange={updateProfileForm}
                                            disabled={loading}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full border border-[#211e1c] bg-[#211e1c] text-[#f7f4ee] py-3 text-xs uppercase tracking-[0.2em] hover:bg-transparent hover:text-[#211e1c] transition duration-300"
                                    >
                                        {loading ? "Updating..." : "Save Safety Profile"}
                                    </button>
                                </form>
                            </div>

                            {/* Trusted Circle / Contacts */}
                            <div className="lg:col-span-6 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-light uppercase tracking-wide">
                                        Trusted <span className="italic font-serif lowercase">Circle</span>
                                    </h2>
                                    <p className="text-xs font-sans text-[#7a7267] tracking-wider uppercase mt-1">
                                        Contacts notified during emergency protocols
                                    </p>
                                </div>

                                <form onSubmit={handleAddContact} className="space-y-3 font-sans text-xs bg-[#f0eae1] p-5 border border-[#d3ccbe]">
                                    <input
                                        className="w-full bg-[#f7f4ee] border border-[#d3ccbe] px-3 py-2.5 outline-none focus:border-[#211e1c]"
                                        name="name"
                                        placeholder="Contact Name"
                                        value={newContact.name}
                                        onChange={updateContactForm}
                                        required
                                        disabled={loading}
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            className="w-full bg-[#f7f4ee] border border-[#d3ccbe] px-3 py-2.5 outline-none focus:border-[#211e1c]"
                                            name="relation"
                                            placeholder="Relation"
                                            value={newContact.relation}
                                            onChange={updateContactForm}
                                            required
                                            disabled={loading}
                                        />
                                        <input
                                            className="w-full bg-[#f7f4ee] border border-[#d3ccbe] px-3 py-2.5 outline-none focus:border-[#211e1c]"
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
                                        className="w-full border border-[#8c8273] text-[#2c2825] py-2.5 text-xs uppercase tracking-[0.15em] hover:bg-[#8c8273] hover:text-[#f7f4ee] transition duration-300"
                                    >
                                        + Add Circle Member
                                    </button>
                                </form>

                                {/* List styled as framed gallery elements */}
                                <div className="space-y-3 pt-2">
                                    {emergencyContacts.length === 0 ? (
                                        <p className="text-xs font-sans text-[#8c8273] text-center py-8 italic font-serif">
                                            No members added to your trusted circle yet.
                                        </p>
                                    ) : (
                                        emergencyContacts.map((contact) => (
                                            <div
                                                key={contact._id}
                                                className="bg-[#f0eae1] border border-[#d3ccbe] p-4 flex items-center justify-between"
                                            >
                                                <div>
                                                    <h3 className="text-base font-serif italic text-[#211e1c]">
                                                        {contact.name}
                                                    </h3>
                                                    <p className="text-[11px] font-sans text-[#6b635b] tracking-wide">
                                                        {contact.relation} &bull; {contact.phone}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteContact(contact._id)}
                                                    className="text-[10px] font-sans text-[#a8524e] hover:text-[#782825] uppercase tracking-widest border-b border-[#a8524e] pb-0.5"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Minimal Editorial Footer */}
                        <footer className="border-t border-[#ded7ca] pt-8 pb-4 text-center space-y-2 font-sans text-[11px] text-[#8c8273] tracking-widest uppercase">
                            <p>SafeCircle &bull; Personal Emergency Network</p>
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}