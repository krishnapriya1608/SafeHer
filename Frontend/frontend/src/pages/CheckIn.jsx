import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Trash2, Power, Plus, Lock ,ArrowLeft} from "lucide-react";
import { checkInApi } from "../api/checkIn";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CheckIns() {
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [proRequired, setProRequired] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("Night commute check-in");
  const [time, setTime] = useState("23:00");
  const [days, setDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await checkInApi.list();
      setCheckIns(res.data.data || []);
    } catch (err) {
      setError("Failed to load check-ins.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleDay = (d) => {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setProRequired(false);
    try {
      await checkInApi.create({ label, time, daysOfWeek: days });
      setShowForm(false);
      load();
    } catch (err) {
      if (err.response?.data?.code === "PRO_REQUIRED") {
        setProRequired(true);
      } else {
        setError(err.response?.data?.error || "Failed to create check-in.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    await checkInApi.toggle(id);
    load();
  };

  const handleDelete = async (id) => {
    await checkInApi.remove(id);
    load();
  };

  const statusBadge = (status) => {
    const styles = {
      idle: "bg-[#EFE6DF] text-[#8C6D58]",
      pending: "bg-[#F7EBE1] text-[#B87A4B]",
      confirmed: "bg-[#E2EBE4] text-[#4A7255]",
      missed: "bg-[#FADBD8] text-[#900C3F]",
    };
    return (
      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${styles[status] || styles.idle}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0]   font-serif text-[#4A3B32]">
      {/* Script Font Imports */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&display=swap');
        .font-script { font-family: 'Caveat', cursive; }
      `}</style>

      <div className="max-w-9xl mx-auto">
        {/* Header Section */}
        <div className="bg-[#A47158] text-[#FAF6F0] p-8  shadow-lg mb-8 relative overflow-hidden">
          <Link
            to="/dashboard/user"
            className="inline-flex items-center gap-1.5 text-xs font-sans-clean font-semibold uppercase tracking-widest text-[#060104] hover:text-[#7D5E71] transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            Back to Safety Dashboard
          </Link>
          <span className="font-script text-2xl text-[#E8D3C5] block mb-1">Stay safe & connected</span>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase">
                Scheduled Check-ins
              </h1>
              <p className="text-xs sm:text-sm text-[#F0E4DC] mt-2 leading-relaxed font-sans font-light max-w-md">
                Get pinged at set times — if you don't confirm you're OK within the grace period,
                your trusted contacts are notified automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-1.5 bg-[#FAF6F0] hover:bg-[#E8D3C5] text-[#8A563F] text-xs uppercase tracking-wider font-bold rounded-full px-5 py-2.5 transition-colors shrink-0 shadow-sm font-sans"
            >
              <Plus size={16} />
              New
            </button>
          </div>
        </div>

        {/* Pro Required Alert */}
        {proRequired && (
          <div className="mb-6 border border-[#CBB3A2] bg-[#F2E8DF] rounded-2xl p-4 text-sm text-[#5C4535] flex items-start gap-3 shadow-sm font-sans">
            <Lock size={18} className="mt-0.5 shrink-0 text-[#8A563F]" />
            <div>
              <p className="font-semibold">Scheduled check-ins are a Pro feature</p>
              <p className="mt-1 text-xs">
                <Link to="/subscription" className="underline font-semibold hover:text-[#8A563F]">
                  Upgrade to Pro
                </Link>{" "}
                to set up automated safety check-ins.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && <p className="text-sm text-[#900C3F] mb-4 font-sans px-2">{error}</p>}

        {/* Form Container */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-8 border border-[#E0D0C1] rounded-[2rem] p-6 space-y-5 bg-[#FAF6F0] shadow-md font-sans"
          >
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#8A563F] block mb-1.5">
                Label
              </label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full border border-[#D5C2B1] bg-white rounded-xl px-4 py-2.5 text-sm text-[#4A3B32] focus:outline-none focus:ring-2 focus:ring-[#A47158]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#8A563F] block mb-1.5">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border border-[#D5C2B1] bg-white rounded-xl px-4 py-2.5 text-sm text-[#4A3B32] focus:outline-none focus:ring-2 focus:ring-[#A47158]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#8A563F] block mb-1.5">
                Days
              </label>
              <div className="flex gap-2 flex-wrap">
                {DAY_LABELS.map((d, i) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => toggleDay(i)}
                    className={`text-xs px-3.5 py-1.5 rounded-full border transition-all ${days.includes(i)
                        ? "bg-[#8A563F] border-[#8A563F] text-[#FAF6F0] font-semibold"
                        : "bg-white border-[#D5C2B1] text-[#7A6759] hover:bg-[#F2E8DF]"
                      }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-[#8A563F] hover:bg-[#734430] text-[#FAF6F0] text-xs uppercase tracking-wider font-bold rounded-full px-6 py-2.5 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : "Create Check-in"}
            </button>
          </form>
        )}

        {/* List Content */}
        {loading ? (
          <p className="text-sm text-[#9E8B7D] font-sans px-2">Loading…</p>
        ) : checkIns.length === 0 ? (
          <p className="text-sm text-[#9E8B7D] font-sans px-2">No check-ins set up yet.</p>
        ) : (
          <div className="space-y-4 font-sans">
            {checkIns.map((c) => (
              <div
                key={c._id}
                className="border border-[#EBDCD0] rounded-2xl p-5 flex items-center justify-between bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-serif font-bold text-[#4A3B32] truncate">
                      {c.label}
                    </span>
                    {statusBadge(c.lastStatus)}
                  </div>
                  <p className="text-xs text-[#8C7667] mt-1.5 flex items-center gap-1.5">
                    <Clock size={13} className="text-[#A47158]" />
                    <span>{c.time}</span>
                    <span>·</span>
                    <span>{c.daysOfWeek.map((d) => DAY_LABELS[d]).join(", ")}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(c._id)}
                    className={`p-2.5 rounded-xl transition-colors ${c.active
                        ? "bg-[#F2E8DF] text-[#8A563F] hover:bg-[#E8D3C5]"
                        : "bg-[#FAF6F0] text-[#B0A093] hover:bg-[#F2E8DF]"
                      }`}
                    title={c.active ? "Active — click to pause" : "Paused — click to activate"}
                  >
                    <Power size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="p-2.5 rounded-xl bg-[#FADBD8] text-[#900C3F] hover:bg-[#F5B7B1] transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}