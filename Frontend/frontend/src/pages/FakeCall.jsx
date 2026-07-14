import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fakeCallApi } from "../api/fakeCallApi";

const CALLER_OPTIONS = [
  { id: "mom", label: "Mom", subtitle: "Calling..." },
  { id: "friend", label: "Priya", subtitle: "Friend" },
  { id: "boss", label: "Mr. Sharma", subtitle: "Manager" },
  { id: "delivery", label: "Delivery Executive", subtitle: "+91 98••• ••210" },
];

const STAGE = {
  PICK: "pick",
  RINGING: "ringing",
  IN_CALL: "in_call",
  ENDED: "ended",
};

function initials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function FakeCallPage() {
  const [stage, setStage] = useState(STAGE.PICK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [callerOption, setCallerOption] = useState(null);
  const [script, setScript] = useState(null);
  const [currentLine, setCurrentLine] = useState(-1);
  const [seconds, setSeconds] = useState(0);

  const timerRef = useRef(null);
  const speakTimeouts = useRef([]);
  const ringTimeoutRef = useRef(null);

  const supportsSpeech = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
    speakTimeouts.current.forEach((t) => clearTimeout(t));
    speakTimeouts.current = [];
    if (supportsSpeech) window.speechSynthesis.cancel();
  };

  const startCallFlow = async (option) => {
    setError("");
    setCallerOption(option);
    setLoading(true);

    try {
      const response = await fakeCallApi.generate(option.id);
      setScript(response.data.script);
      setStage(STAGE.RINGING);

      // Simulate a ring for a couple seconds before auto-answering,
      // like a real incoming call screen.
      ringTimeoutRef.current = setTimeout(() => {
        answerCall(response.data.script);
      }, 2200);
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not start fake call. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const answerCall = (activeScript) => {
    setStage(STAGE.IN_CALL);
    setSeconds(0);

    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    speakScript(activeScript);
  };

  const speakScript = (activeScript) => {
    if (!activeScript?.lines?.length) return;

    let elapsed = 400;

    activeScript.lines.forEach((line, idx) => {
      const t = setTimeout(() => {
        setCurrentLine(idx);
        speak(line.text);
      }, elapsed);

      speakTimeouts.current.push(t);
      elapsed += line.pauseAfterMs || 3000;
    });
  };

  const speak = (text) => {
    if (!supportsSpeech) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const endCall = () => {
    cleanup();
    setStage(STAGE.ENDED);
  };

  const resetToPicker = () => {
    cleanup();
    setStage(STAGE.PICK);
    setScript(null);
    setCallerOption(null);
    setCurrentLine(-1);
    setSeconds(0);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-md space-y-6">
        <AnimatePresence mode="wait">
          {stage === STAGE.PICK && (
            <motion.section
              key="pick"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-3xl border border-red-500/20 bg-slate-900 p-6 shadow-xl"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-red-400">
                Safety Tool
              </p>
              <h1 className="mt-2 text-2xl font-bold">Fake Call Generator</h1>
              <p className="mt-2 text-sm text-slate-400">
                Instantly simulate an incoming call with a natural, one-sided
                script so it looks and sounds like you're talking to someone.
              </p>

              {!supportsSpeech && (
                <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
                  Voice playback isn't supported in this browser. The call
                  script will still display on screen.
                </p>
              )}

              {error && (
                <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                  {error}
                </p>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3">
                {CALLER_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    disabled={loading}
                    onClick={() => startCallFlow(option)}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950 px-3 py-5 text-center transition hover:border-red-500/40 hover:bg-slate-900 disabled:opacity-50"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/20 text-sm font-bold text-red-300">
                      {initials(option.label)}
                    </span>
                    <span className="text-sm font-semibold">{option.label}</span>
                    <span className="text-xs text-slate-500">{option.subtitle}</span>
                  </button>
                ))}
              </div>

              {loading && (
                <p className="mt-4 text-center text-sm text-slate-400">
                  Preparing your call...
                </p>
              )}
            </motion.section>
          )}

          {stage === STAGE.RINGING && callerOption && (
            <motion.section
              key="ringing"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex min-h-[70vh] flex-col items-center justify-between rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl"
            >
              <div className="mt-10 space-y-3">
                <p className="text-sm text-slate-400">Incoming call</p>
                <motion.span
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-red-600/20 text-3xl font-bold text-red-300"
                >
                  {initials(callerOption.label)}
                </motion.span>
                <h2 className="text-2xl font-bold">{callerOption.label}</h2>
                <p className="text-sm text-slate-400">mobile</p>
              </div>

              <div className="mb-6 flex w-full items-center justify-center gap-10">
                <button
                  onClick={resetToPicker}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-2xl hover:bg-slate-700"
                  title="Decline"
                >
                  ✕
                </button>
                <button
                  onClick={() => {
                    clearTimeout(ringTimeoutRef.current);
                    answerCall(script);
                  }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-2xl hover:bg-emerald-700"
                  title="Answer"
                >
                  ✓
                </button>
              </div>
            </motion.section>
          )}

          {stage === STAGE.IN_CALL && callerOption && (
            <motion.section
              key="in-call"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[70vh] flex-col items-center justify-between rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl"
            >
              <div className="mt-6 space-y-2">
                <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-600/20 text-2xl font-bold text-red-300">
                  {initials(callerOption.label)}
                </span>
                <h2 className="text-xl font-bold">{callerOption.label}</h2>
                <p className="text-sm text-emerald-400">{formatTime(seconds)}</p>
              </div>

              <div className="mt-6 max-h-56 w-full overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 text-left">
                {script?.lines?.map((line, idx) => (
                  <p
                    key={idx}
                    className={`mb-2 text-sm transition ${
                      idx === currentLine
                        ? "font-semibold text-white"
                        : idx < currentLine
                        ? "text-slate-500"
                        : "text-slate-700"
                    }`}
                  >
                    {line.text}
                  </p>
                ))}
              </div>

              <div className="mb-4 mt-6 flex w-full items-center justify-center gap-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-lg">
                  🔇
                </div>
                <button
                  onClick={endCall}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-2xl hover:bg-red-700"
                  title="End call"
                >
                  ✕
                </button>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-lg">
                  🔊
                </div>
              </div>
            </motion.section>
          )}

          {stage === STAGE.ENDED && (
            <motion.section
              key="ended"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl"
            >
              <h2 className="text-xl font-bold">Call Ended</h2>
              <p className="mt-2 text-sm text-slate-400">
                Call lasted {formatTime(seconds)}
              </p>
              <button
                onClick={resetToPicker}
                className="mt-6 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold hover:bg-red-700"
              >
                Start Another Call
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
