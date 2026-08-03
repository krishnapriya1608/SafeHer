import { useEffect, useState } from "react";
import { ShieldCheck, XCircle, CheckCircle2, AlertTriangle, MapPin } from "lucide-react";
import { fetchReports, updateReportStatus } from "../api/reportApi";

// Mock reports so you can see the card design live when API returns empty
const MOCK_REPORTS = [
  {
    _id: "1",
    category: "Safety Hazard",
    description: "Fallen tree branch blocking the main pedestrian pathway near the park entrance.",
    location: { lat: 37.7749, lng: -122.4194 },
    aiSuggestion: {
      flaggedForReview: true,
      suggestedCategory: "Infrastructure",
      note: "High priority due to obstructed foot traffic.",
    },
  },
  {
    _id: "2",
    category: "Street Light Out",
    description: "Street light near the park bench has been flickering and is now completely out.",
    location: { lat: 37.7751, lng: -122.4183 },
    aiSuggestion: {
      flaggedForReview: false,
      suggestedCategory: "Maintenance",
      note: "Standard priority ticket.",
    },
  },
];

export default function AestheticAdminReportPanel({ adminUserId }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchReports({ status: "pending" });
      setReports(data && data.length > 0 ? data : MOCK_REPORTS);
    } catch {
      setReports(MOCK_REPORTS);
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
      // Handle error
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2] font-serif text-[#8E6C88]">
        Loading pending reports…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#5A3E54] font-serif pb-16">
      {/* Top Banner Notice */}
      <div className="bg-[#8E6C88] text-[#FAF7F2] text-[10px] tracking-widest uppercase text-center py-1.5 font-sans">
        Admin Verification Dashboard — Live Community Moderation
      </div>

      {/* Website Navigation Header */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[#E8DCE4]/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-serif italic text-lg bg-white shadow-sm">
            Safe
          </div>
          <span className="font-serif italic text-xl text-[#5A3E54] tracking-tight">
Safe Sphere          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 font-sans text-xs uppercase tracking-widest text-[#8E6C88]">
          <a href="#services" className="hover:text-[#5A3E54] transition-colors">Services</a>
          <a href="#about" className="hover:text-[#5A3E54] transition-colors">About</a>
          <a href="#blog" className="hover:text-[#5A3E54] transition-colors">Blog</a>
          <a href="#contact" className="hover:text-[#5A3E54] transition-colors">Contact</a>
        </div>

        <button className="rounded-full bg-[#8E6C88] hover:bg-[#785973] text-white px-5 py-2 font-sans text-xs font-semibold uppercase tracking-wider transition-all shadow-sm">
          Admin Portal
        </button>
      </nav>

      {/* Hero Section */}
      <header className="mx-auto max-w-4xl pt-12 pb-8 px-6 text-center">
        <span className="text-3xl md:text-4xl font-serif italic text-[#D4AF37] block mb-2">
          welcome!
        </span>
        <h1 className="text-3xl md:text-5xl font-normal text-[#5A3E54] tracking-tight leading-tight">
          Pending Community Reports
        </h1>
        <p className="mt-4 text-xs md:text-sm font-sans tracking-wide text-[#8E6C88] max-w-xl mx-auto leading-relaxed">
          Review innermost habits and responses to ensure a safe, conscious environment. Verify, resolve, or reclassify pending reports below.
        </p>
        <div className="mt-8 mx-auto w-24 h-[1px] bg-[#D4AF37]" />
      </header>

      {/* Content Area */}
      <main className="mx-auto max-w-4xl px-6 space-y-8">
        {reports.length === 0 ? (
          <div className="rounded-3xl bg-[#F9F3F6] p-12 text-center shadow-sm border border-[#E8DCE4]">
            <h2 className="font-serif text-3xl text-[#5A3E54]">All Clear</h2>
            <p className="mt-2 font-serif text-sm text-[#8E6C88]">
              There are currently no community reports awaiting review. 🎉
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {reports.map((report) => (
              <div
                key={report._id}
                className="relative overflow-hidden rounded-3xl bg-[#8E6C88] p-2 shadow-xl transition-transform hover:-translate-y-0.5"
              >
                {/* Inner Card with Signature Double Gold Frame */}
                <div className="relative rounded-[22px] border-2 border-[#D4AF37] bg-[#8E6C88] p-6 text-white md:p-8">
                  
                  {/* Category & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <span className="font-sans text-[11px] font-semibold uppercase tracking-widest text-[#EBD9CE]">
                      Category: {report.category}
                    </span>

                    {report.aiSuggestion?.flaggedForReview && (
                      <span className="flex items-center gap-1.5 rounded-full bg-[#FAF7F2] px-3 py-1 font-sans text-xs font-bold text-[#C85A5A] shadow-sm">
                        <AlertTriangle size={13} />
                        Flagged for Attention
                      </span>
                    )}
                  </div>

                  {/* Title / Description */}
                  <h3 className="text-xl md:text-2xl font-normal leading-relaxed text-[#FAF7F2]">
                    {report.description}
                  </h3>

                  {/* Location */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-[#E8DCE4] font-sans">
                    <MapPin size={14} className="text-[#D4AF37]" />
                    <span>
                      Location Coordinates: {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                    </span>
                  </div>

                  {/* AI Suggestion Box */}
                  {report.aiSuggestion?.suggestedCategory && (
                    <div className="mt-5 rounded-2xl bg-[#FAF7F2]/10 p-4 border border-[#FAF7F2]/20 font-sans text-xs text-[#EBD9CE]">
                      <p className="font-semibold text-white">
                        AI Recommendation: <span className="text-[#D4AF37] underline">{report.aiSuggestion.suggestedCategory}</span>
                      </p>
                      {report.aiSuggestion.note && (
                        <p className="mt-1 italic opacity-90">"{report.aiSuggestion.note}"</p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons styled like the CTA buttons from image */}
                  <div className="mt-8 flex flex-wrap items-center gap-3 font-sans pt-4 border-t border-[#FAF7F2]/20">
                    <button
                      disabled={updatingId === report._id}
                      onClick={() => handleAction(report._id, "verified")}
                      className="flex items-center gap-2 rounded-full bg-[#FAF7F2] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#5A3E54] shadow-md transition-all hover:bg-white hover:shadow-lg disabled:opacity-50"
                    >
                      <ShieldCheck size={15} className="text-[#5A3E54]" />
                      Verify
                    </button>

                    <button
                      disabled={updatingId === report._id}
                      onClick={() => handleAction(report._id, "resolved")}
                      className="flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#c29f2e] hover:shadow-lg disabled:opacity-50"
                    >
                      <CheckCircle2 size={15} />
                      Resolve
                    </button>

                    <button
                      disabled={updatingId === report._id}
                      onClick={() => handleAction(report._id, "rejected")}
                      className="flex items-center gap-2 rounded-full border border-[#FAF7F2]/40 bg-transparent px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#FAF7F2] transition-all hover:bg-[#FAF7F2]/10 disabled:opacity-50"
                    >
                      <XCircle size={15} />
                      Reject
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}