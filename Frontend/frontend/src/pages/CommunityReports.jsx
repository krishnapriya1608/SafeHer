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
  pending: { label: "Pending Review", icon: Clock, className: "bg-amber-500/10 text-amber-400" },
  verified: { label: "Verified", icon: ShieldCheck, className: "bg-emerald-500/10 text-emerald-400" },
  rejected: { label: "Rejected", icon: XCircle, className: "bg-zinc-700/40 text-zinc-500" },
  resolved: { label: "Resolved", icon: CheckCircle2, className: "bg-blue-500/10 text-blue-400" },
};

// Pass the logged-in user's id if you have auth wired up; reports work
// anonymously too (userId is optional server-side).
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
      // silent fail — non-critical action
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
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 md:py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          to="/sos"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase bg-red-500/10 text-red-400 px-2.5 py-1 rounded-md">
              Phase 7 · Community Reporting
            </span>
            <h1 className="mt-2.5 text-3xl font-extrabold tracking-tight text-white">
              Unsafe Area Reports
            </h1>
            <p className="mt-1.5 text-sm text-zinc-400">
              See what the community has flagged, or report a new area yourself.
            </p>
          </div>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-500"
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? "Close" : "Report"}
          </button>
        </div>

        {showForm && (
          <ReportForm
            userId={userId}
            onSubmitted={() => {
              setShowForm(false);
              loadReports();
            }}
          />
        )}

        {error && <StatusMessage type="error">{error}</StatusMessage>}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300"
          >
            <option value="">All categories</option>
            {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300"
          >
            <option value="">All statuses</option>
            {Object.entries(STATUS_STYLES).map(([id, s]) => (
              <option key={id} value={id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* List */}
        {loading ? (
          <p className="text-center text-sm text-zinc-500">Loading reports…</p>
        ) : reports.length === 0 ? (
          <p className="text-center text-sm text-zinc-500">
            No reports match these filters yet.
          </p>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => {
              const statusInfo = STATUS_STYLES[report.status] || STATUS_STYLES.pending;
              const StatusIcon = statusInfo.icon;
              return (
                <div
                  key={report._id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        {CATEGORY_LABELS[report.category] || report.category}
                      </span>
                      <p className="mt-1 text-sm text-zinc-200">{report.description}</p>
                    </div>
                    <span
                      className={`flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold ${statusInfo.className}`}
                    >
                      <StatusIcon size={11} />
                      {statusInfo.label}
                    </span>
                  </div>

                  {report.images?.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {report.images.map((src, i) => (
                        <img
                          key={i}
                          src={`${import.meta.env.VITE_API_BASE_URL || ""}${src}`} alt="Report evidence"
                          className="h-20 w-20 shrink-0 rounded-lg object-cover border border-zinc-800"
                        />
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>{timeAgo(report.createdAt)}</span>
                    <button
                      onClick={() => handleUpvote(report._id)}
                      className="flex items-center gap-1 rounded-lg border border-zinc-800 px-2 py-1 font-semibold text-zinc-400 hover:border-zinc-700 hover:text-white"
                    >
                      <ThumbsUp size={11} />
                      {report.upvotes || 0}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
