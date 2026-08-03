import { useEffect, useState } from "react";
import { ShieldCheck, XCircle, UserRound, Mail, BadgeCheck } from "lucide-react";
import { authApi } from "../api/authApi";
const ROLE_LABELS = {
  volunteer: "Volunteer",
  police: "Police",
};

export default function AdminApprovalPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

const load = async () => {
  setLoading(true);
  setError("");
  try {
    const response = await authApi.fetchPendingApprovals();
    setUsers(response.data.users || []);
  } catch (err) {
    setError(err.response?.data?.message || "Failed to load pending approvals.");
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  load();
}, []);
const handleAction = async (id, status) => {
  setUpdatingId(id);
  setError("");
  try {
    await authApi.updateApprovalStatus(id, status);
    setUsers((prev) => prev.filter((u) => u._id !== id));
  } catch (err) {
    setError(err.response?.data?.message || "Failed to update approval status.");
  } finally {
    setUpdatingId(null);
  }
};
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2] font-serif text-[#8E6C88]">
        Loading pending approvals…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#5A3E54] font-serif pb-16">
      {/* Top Banner Notice */}
      <div className="bg-[#8E6C88] text-[#FAF7F2] text-[10px] tracking-widest uppercase text-center py-1.5 font-sans">
        Admin Verification Dashboard — Volunteer &amp; Police Approvals
      </div>

      {/* Website Navigation Header */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[#E8DCE4]/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-serif italic text-lg bg-white shadow-sm">
            Safe
          </div>
          <span className="font-serif italic text-xl text-[#5A3E54] tracking-tight">
            Safe Sphere
          </span>
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
          Pending Account Approvals
        </h1>
        <p className="mt-4 text-xs md:text-sm font-sans tracking-wide text-[#8E6C88] max-w-xl mx-auto leading-relaxed">
          Volunteers and police accounts require verification before they can log in. Approve or reject each application below.
        </p>
        <div className="mt-8 mx-auto w-24 h-[1px] bg-[#D4AF37]" />
      </header>

      {/* Content Area */}
      <main className="mx-auto max-w-4xl px-6 space-y-8">
        {error && (
          <div className="rounded-2xl bg-[#C85A5A]/10 border border-[#C85A5A]/30 p-4 text-sm font-sans text-[#C85A5A]">
            {error}
          </div>
        )}

        {users.length === 0 ? (
          <div className="rounded-3xl bg-[#F9F3F6] p-12 text-center shadow-sm border border-[#E8DCE4]">
            <h2 className="font-serif text-3xl text-[#5A3E54]">All Clear</h2>
            <p className="mt-2 font-serif text-sm text-[#8E6C88]">
              There are currently no pending volunteer or police applications. 🎉
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            {users.map((user) => (
              <div
                key={user._id}
                className="relative overflow-hidden rounded-3xl bg-[#8E6C88] p-2 shadow-xl transition-transform hover:-translate-y-0.5"
              >
                {/* Inner Card with Signature Double Gold Frame */}
                <div className="relative rounded-[22px] border-2 border-[#D4AF37] bg-[#8E6C88] p-6 text-white md:p-8">

                  {/* Role & Verified Email Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <span className="font-sans text-[11px] font-semibold uppercase tracking-widest text-[#EBD9CE]">
                      Applying as: {ROLE_LABELS[user.role] || user.role}
                    </span>

                    {user.isVerified && (
                      <span className="flex items-center gap-1.5 rounded-full bg-[#FAF7F2] px-3 py-1 font-sans text-xs font-bold text-[#5A3E54] shadow-sm">
                        <BadgeCheck size={13} />
                        Email Verified
                      </span>
                    )}
                  </div>

                  {/* Username */}
                  <h3 className="flex items-center gap-2 text-xl md:text-2xl font-normal leading-relaxed text-[#FAF7F2]">
                    <UserRound size={20} className="text-[#D4AF37]" />
                    {user.username}
                  </h3>

                  {/* Email */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-[#E8DCE4] font-sans">
                    <Mail size={14} className="text-[#D4AF37]" />
                    <span>{user.email}</span>
                  </div>

                  {/* Applied On */}
                  <div className="mt-5 rounded-2xl bg-[#FAF7F2]/10 p-4 border border-[#FAF7F2]/20 font-sans text-xs text-[#EBD9CE]">
                    <p className="font-semibold text-white">
                      Applied:{" "}
                      <span className="text-[#D4AF37]">
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 flex flex-wrap items-center gap-3 font-sans pt-4 border-t border-[#FAF7F2]/20">
                    <button
                      disabled={updatingId === user._id}
                      onClick={() => handleAction(user._id, "approved")}
                      className="flex items-center gap-2 rounded-full bg-[#FAF7F2] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#5A3E54] shadow-md transition-all hover:bg-white hover:shadow-lg disabled:opacity-50"
                    >
                      <ShieldCheck size={15} className="text-[#5A3E54]" />
                      Approve
                    </button>

                    <button
                      disabled={updatingId === user._id}
                      onClick={() => handleAction(user._id, "rejected")}
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
