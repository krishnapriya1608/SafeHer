import { useEffect, useState } from "react";
import { ShieldCheck, XCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { fetchReports, updateReportStatus } from "../api/reportApi";

// A minimal admin verification panel. Mount this behind whatever
// admin-only route/guard your app already uses — it doesn't do its own
// admin check, it trusts the parent route to have gated access.
export default function AdminReportPanel({ adminUserId }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchReports({ status: "pending" });
      setReports(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (id, status) => {
    setUpdatingId(id);
    try {
      await updateReportStatus(id, status, "", adminUserId);
      setReports((prev) => prev.filter((r) => r._id !== id));
    } catch {
      // could surface a toast here
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <p className="text-sm text-zinc-500">Loading pending reports…</p>;

  if (reports.length === 0) {
    return (
      <p className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
        No reports awaiting review. 🎉
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <div key={report._id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                {report.category}
              </span>
              <p className="mt-1 text-sm text-zinc-200">{report.description}</p>
              <p className="mt-1 text-[11px] text-zinc-500">
                {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
              </p>
            </div>
            {report.aiSuggestion?.flaggedForReview && (
              <span className="flex items-center gap-1 rounded-lg bg-red-500/10 px-2 py-1 text-[10px] font-bold text-red-400">
                <AlertTriangle size={11} />
                Flagged
              </span>
            )}
          </div>

          {report.aiSuggestion?.suggestedCategory && (
            <p className="mt-2 text-[11px] text-zinc-500">
              AI suggests: <span className="text-zinc-400">{report.aiSuggestion.suggestedCategory}</span>
              {report.aiSuggestion.note ? ` — ${report.aiSuggestion.note}` : ""}
            </p>
          )}

          <div className="mt-3 flex gap-2">
            <button
              disabled={updatingId === report._id}
              onClick={() => handleAction(report._id, "verified")}
              className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              <ShieldCheck size={13} /> Verify
            </button>
            <button
              disabled={updatingId === report._id}
              onClick={() => handleAction(report._id, "rejected")}
              className="flex items-center gap-1 rounded-xl bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
            >
              <XCircle size={13} /> Reject
            </button>
            <button
              disabled={updatingId === report._id}
              onClick={() => handleAction(report._id, "resolved")}
              className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              <CheckCircle2 size={13} /> Mark Resolved
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
