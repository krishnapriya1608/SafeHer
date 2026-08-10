import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ThumbsUp,
  Clock,
  ShieldCheck,
  XCircle,
  CheckCircle2,
  Plus,
  X,
  Sparkles,
} from "lucide-react";
import ReportForm from "../components/ReportForm";
import StatusMessage from "../components/StatusMessage";
import { fetchReports, upvoteReport } from "../api/reportApi";

const CATEGORY_LABELS = {
  poor_lighting: "Poor Lighting",
  harassment: "Harassment",
  no_police_presence: "No Police Presence",
  suspicious_activity: "Suspicious Activity",
  stray_animals: "Stray Animals",
  unsafe_construction: "Unsafe Construction",
  isolated_area: "Isolated Area",
  other: "Other",
};

const STATUS_STYLES = {
  pending: { label: "Pending Review", icon: Clock, className: "bg-[#F3E8EE] text-[#9B7A8E]" },
  verified: { label: "Verified", icon: ShieldCheck, className: "bg-[#E6F0EA] text-[#4E7A5A]" },
  rejected: { label: "Rejected", icon: XCircle, className: "bg-[#F3F4F6] text-[#71717A]" },
  resolved: { label: "Resolved", icon: CheckCircle2, className: "bg-[#EBF3F9] text-[#3B6998]" },
};

export default function CommunityReports({ userId }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    setError("");
    try {
      const filters = {};
      if (categoryFilter) filters.category = categoryFilter;
      if (statusFilter) filters.status = statusFilter;
      const data = await fetchReports(filters);
      setReports(data);
    } catch {
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, statusFilter]);

  const handleUpvote = async (id) => {
    try {
      const updated = await upvoteReport(id);
      setReports((prev) => prev.map((r) => (r._id === id ? updated : r)));
    } catch {
      // silent fail
    }
  };

  const timeAgo = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <main className="min-h-screen bg-[#F9F6F7] text-[#4A3E47] font-sans selection:bg-[#E2D2DC] selection:text-[#9B7A8E]">
      {/* Script & Editorial Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,700;1,400&display=swap');
        .font-script { font-family: 'Alex Brush', cursive; }
        .font-serif-editorial { font-family: 'Playfair Display', serif; }
        .font-sans-clean { font-family: 'Montserrat', sans-serif; }
      `}</style>


      {/* Hero / Header Section */}
      <section className="relative px-6 py-12 md:py-16 max-w-5xl mx-auto text-center">
        <Link
          to="/dashboard/user"
          className="inline-flex items-center gap-1.5 text-xs font-sans-clean font-semibold uppercase tracking-widest text-[#9B7A8E] hover:text-[#7D5E71] transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Back to Safety Dashboard
        </Link>

        <div className="space-y-3">
          <span className="font-script text-4xl sm:text-5xl text-[#C9A27E] block">
            Welcome to
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif-editorial font-bold text-[#4A3E47] tracking-tight leading-tight">
            Community Safety Reports
          </h1>
          <p className="text-xs sm:text-sm font-sans-clean text-[#786371] max-w-xl mx-auto leading-relaxed">
            Discover flagged areas, support neighborhood updates, or contribute by reporting an unsafe location near you.
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-2 rounded-full bg-[#9B7A8E] hover:bg-[#856478] text-white px-8 py-3 text-xs font-sans-clean font-bold uppercase tracking-widest shadow-lg hover:shadow-xl transition-all"
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? "Close Form" : "Report Unsafe Area"}
          </button>
        </div>
      </section>

      {/* Mauve Featured Section Banner (Middle Section in Image) */}
      <section className="relative bg-[#9B7A8E] text-white py-12 px-6 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-3 max-w-lg">
            <span className="font-script text-3xl text-[#F3E8EE] block">
              Empower your neighborhood
            </span>
            <h2 className="text-xl sm:text-2xl font-serif-editorial font-semibold leading-snug">
              Keep Your Loved Ones &amp; Community Safe
            </h2>
            <p className="text-xs font-sans-clean font-light text-[#F3E8EE] leading-relaxed">
              Real-time awareness minimizes risk. Filter reports by category or status to review verified local incidents.
            </p>
          </div>

          <div className="shrink-0 bg-[#F9F6F7] text-[#4A3E47] p-6 rounded-3xl border-2 border-[#D4AF37] shadow-xl text-center max-w-xs">
            <Sparkles size={24} className="text-[#C9A27E] mx-auto mb-2" />
            <h3 className="font-serif-editorial font-bold text-base mb-1">Stay Informed</h3>
            <p className="text-[11px] font-sans-clean text-[#786371]">
              Verified community observations help shape safer public routes for everyone.
            </p>
          </div>
        </div>

        {/* Arrow Pointer Ornament */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-[#9B7A8E]" />
      </section>

      {/* Form & List Container */}
      <section className="max-w-3xl mx-auto px-4 py-12 font-sans-clean space-y-8">
        {showForm && (
          <div className="bg-white border-2 border-[#D4AF37] rounded-3xl p-6 sm:p-8 shadow-lg">
            <ReportForm
              userId={userId}
              onSubmitted={() => {
                setShowForm(false);
                loadReports();
              }}
            />
          </div>
        )}

        {error && <StatusMessage type="error">{error}</StatusMessage>}

        {/* Filter Selection Section */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-serif-editorial text-[#4A3E47]">
            I want to see reports for...
          </h2>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-full border border-[#D5C2CE] bg-white px-5 py-2.5 text-xs font-semibold text-[#4A3E47] shadow-sm outline-none focus:border-[#9B7A8E]"
            >
              <option value="">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border border-[#D5C2CE] bg-white px-5 py-2.5 text-xs font-semibold text-[#4A3E47] shadow-sm outline-none focus:border-[#9B7A8E]"
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_STYLES).map(([id, s]) => (
                <option key={id} value={id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reports Grid / Cards */}
        {loading ? (
          <p className="text-center text-xs font-semibold text-[#8C7483] py-8">
            Loading community reports…
          </p>
        ) : reports.length === 0 ? (
          <p className="text-center text-xs font-semibold text-[#8C7483] py-8 italic font-serif-editorial">
            No reports match these filters yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 pt-4">
            {reports.map((report) => {
              const statusInfo = STATUS_STYLES[report.status] || STATUS_STYLES.pending;
              const StatusIcon = statusInfo.icon;
              return (
                <div
                  key={report._id}
                  className="relative bg-[#9B7A8E] text-white rounded-2xl p-6 sm:p-8 shadow-md border-2 border-[#D4AF37] transition-all hover:shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#F3E8EE] block mb-1">
                        {CATEGORY_LABELS[report.category] || report.category}
                      </span>
                      <p className="font-serif-editorial text-lg sm:text-xl font-medium text-white leading-snug">
                        {report.description}
                      </p>
                    </div>

                    <span
                      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusInfo.className}`}
                    >
                      <StatusIcon size={12} />
                      {statusInfo.label}
                    </span>
                  </div>

                  {report.images?.length > 0 && (
                    <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                      {report.images.map((src, i) => (
                        <img
                          key={i}
                          src={`${import.meta.env.VITE_API_BASE_URL || ""}${src}`}
                          alt="Report evidence"
                          className="h-20 w-20 shrink-0 rounded-xl object-cover border-2 border-[#D4AF37]"
                        />
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between text-xs text-[#F3E8EE] pt-4 border-t border-white/20">
                    <span className="font-light">{timeAgo(report.createdAt)}</span>
                    <button
                      onClick={() => handleUpvote(report._id)}
                      className="flex items-center gap-1.5 rounded-full bg-white text-[#9B7A8E] hover:bg-[#F9F6F7] px-4 py-1.5 text-xs font-bold transition-all shadow-sm"
                    >
                      <ThumbsUp size={13} className="text-[#9B7A8E]" />
                      <span>{report.upvotes || 0} Upvotes</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2D2DC] py-8 text-center text-[10px] font-sans-clean font-semibold uppercase tracking-[0.25em] text-[#8C7483]">
        Pursuing Safe &amp; Conscious Living · SafeSphere Community
      </footer>
    </main>
  );
}