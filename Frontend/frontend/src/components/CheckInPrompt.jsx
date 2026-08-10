import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { socket } from "../socket";
import { checkInApi } from "../api/checkIn";
import { useAuth } from "../context/AuthContext";

export default function CheckInPrompt() {
  const { isAuthenticated } = useAuth();
  const [prompt, setPrompt] = useState(null); // { checkInId, label, gracePeriodMinutes }
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const onTriggered = (data) => {
      setPrompt(data);
      setConfirmed(false);
    };

    socket.on("checkin-triggered", onTriggered);
    return () => socket.off("checkin-triggered", onTriggered);
  }, [isAuthenticated]);

  if (!prompt) return null;

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await checkInApi.confirm(prompt.checkInId);
      setConfirmed(true);
      setTimeout(() => setPrompt(null), 2000);
    } catch (err) {
      // If it already expired server-side, just dismiss — the escalation
      // already happened, nothing more this popup can do.
      setPrompt(null);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center">
        {confirmed ? (
          <>
            <ShieldCheck size={40} className="text-emerald-600 mx-auto mb-3" />
            <p className="font-semibold text-slate-900">Thanks — you're marked safe.</p>
          </>
        ) : (
          <>
            <p className="text-3xl mb-2">👋</p>
            <h2 className="text-lg font-bold text-slate-900 mb-1">{prompt.label}</h2>
            <p className="text-sm text-slate-500 mb-5">
              Just checking in. Confirm you're OK within {prompt.gracePeriodMinutes} minutes,
              or your trusted contacts will be notified.
            </p>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-full py-2.5 disabled:opacity-50"
            >
              {confirming ? "Confirming…" : "I'm OK"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
