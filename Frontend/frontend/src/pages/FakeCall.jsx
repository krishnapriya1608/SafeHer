import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneCall,
  PhoneOff,
  Phone,
  Volume2,
  VolumeX,
  AlertCircle,
  RefreshCw,
  UserCheck,
  Shield,
  Clock,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";
import { fakeCallApi } from "../api/fakeCallApi";
import { Link } from "react-router-dom";

const CALLER_OPTIONS = [
  {
    id: "mom",
    label: "Mom",
    subtitle: "Calling...",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
    bgImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "friend",
    label: "Priya",
    subtitle: "Friend",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
    bgImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "boss",
    label: "Mr. Sharma",
    subtitle: "Manager",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    bgImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "delivery",
    label: "Delivery Executive",
    subtitle: "+91 98••• ••210",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    bgImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1200",
  },
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

const VOICE_PROFILES = {
  mom: { genderPref: "female", pitch: 1.15, rate: 0.95 },
  friend: { genderPref: "female", pitch: 1.05, rate: 1.05 },
  boss: { genderPref: "male", pitch: 0.9, rate: 0.98 },
  delivery: { genderPref: "male", pitch: 1.0, rate: 1.02 },
};

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
  const currentAudioRef = useRef(null);
  const callStoppedRef = useRef(false);

  const supportsSpeech = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanup = () => {
    callStoppedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
    speakTimeouts.current.forEach((t) => clearTimeout(t));
    speakTimeouts.current = [];
    if (supportsSpeech) window.speechSynthesis.cancel();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
  };

  const startCallFlow = async (option) => {
    setError("");
    setCallerOption(option);
    setLoading(true);

    try {
      const response = await fakeCallApi.generate(option.id);
      setScript(response.data.script);
      setStage(STAGE.RINGING);

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

    speakScript(activeScript, callerOption?.id);
  };

  const speakScript = (activeScript, callerType) => {
    if (!activeScript?.lines?.length) return;
    callStoppedRef.current = false;

    const profile = VOICE_PROFILES[callerType] || VOICE_PROFILES.mom;

    const runFrom = (idx) => {
      if (callStoppedRef.current) return;
      if (idx >= activeScript.lines.length) return;
      setCurrentLine(idx);

      const line = activeScript.lines[idx];

      const advance = () => {
        if (callStoppedRef.current) return;
        const t = setTimeout(() => runFrom(idx + 1), line.pauseAfterMs || 3000);
        speakTimeouts.current.push(t);
      };

      if (line.audioBase64) {
        const audio = new Audio(`data:audio/mpeg;base64,${line.audioBase64}`);
        currentAudioRef.current = audio;
        audio.onended = advance;
        audio.onerror = advance;
        audio.play().catch(advance);
      } else if (supportsSpeech) {
        const utterance = new SpeechSynthesisUtterance(line.text);
        const voice = pickVoiceForGender(profile.genderPref);
        if (voice) utterance.voice = voice;
        utterance.pitch = profile.pitch;
        utterance.rate = profile.rate;
        utterance.onend = advance;
        utterance.onerror = advance;
        window.speechSynthesis.speak(utterance);
      } else {
        advance();
      }
    };

    runFrom(0);
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

  function pickVoiceForGender(genderPref) {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const femaleHints = /female|zira|samantha|victoria|susan|karen|moira|tessa|fiona/i;
    const maleHints = /male|david|daniel|alex|fred|george|james|mark/i;

    const hints = genderPref === "female" ? femaleHints : maleHints;
    const match = voices.find((v) => hints.test(v.name) && v.lang.startsWith("en"));
    if (match) return match;

    const enVoices = voices.filter((v) => v.lang.startsWith("en"));
    if (!enVoices.length) return voices[0];
    return genderPref === "female" ? enVoices[0] : enVoices[enVoices.length - 1];
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 flex items-center justify-center selection:bg-red-500 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        <AnimatePresence mode="wait">
          {/* STAGE: PICK */}
          {stage === STAGE.PICK && (
            <motion.section
              key="pick"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-slate-950/50"
            >
              <Link
                to="/dashboard/user"
                className="group relative inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 shadow-sm transition-all hover:border-emerald-500/30 hover:bg-zinc-800/90 hover:text-white"
              >
                <LayoutDashboard size={14} className="text-emerald-400 transition-transform group-hover:scale-110" />
                <span>Dashboard</span>
              </Link>

              <div className="absolute -top-24 py-10 -right-24 h-48 w-48 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

              <div className="flex items-center gap-2 mt-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-400 border border-red-500/20">
                  <Shield size={12} className="text-red-400" />
                  Safety Tool
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white">
                Fake Call Generator
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Instantly simulate an incoming call with a natural, one-sided script so it looks and sounds like you're talking to someone.
              </p>

              {!supportsSpeech && (
                <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-300 backdrop-blur-sm">
                  <AlertCircle size={16} className="shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    Voice playback isn't supported in this browser. The call script will still display on screen.
                  </span>
                </div>
              )}

              {error && (
                <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300 backdrop-blur-sm">
                  <AlertCircle size={16} className="shrink-0 text-red-400 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3.5">
                {CALLER_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    disabled={loading}
                    onClick={() => startCallFlow(option)}
                    className="group relative flex flex-col items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-center transition-all duration-300 hover:border-red-500/40 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-red-500/5 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {option.avatar ? (
                      <img
                        src={option.avatar}
                        alt={option.label}
                        className="h-12 w-12 rounded-full object-cover border border-red-500/30 transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-sm font-bold text-red-400 transition-transform duration-300 group-hover:scale-110 group-hover:bg-red-500/20">
                        {initials(option.label)}
                      </span>
                    )}
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {option.label}
                    </span>
                    <span className="text-xs text-slate-500 truncate max-w-full">
                      {option.subtitle}
                    </span>
                  </button>
                ))}
              </div>

              {loading && (
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400 animate-pulse">
                  <Sparkles size={16} className="text-red-400" />
                  <span>Preparing your call...</span>
                </div>
              )}
            </motion.section>
          )}

          {/* STAGE: RINGING */}
          {stage === STAGE.RINGING && callerOption && (
            <motion.section
              key="ringing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative flex min-h-[75vh] flex-col items-center justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center backdrop-blur-2xl shadow-2xl"
            >
              {/* Background Caller Image with Overlay */}
              {callerOption.bgImage && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <img
                    src={callerOption.bgImage}
                    alt={callerOption.label}
                    className="h-full w-full object-cover scale-105 filter blur-sm brightness-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-slate-950/90" />
                </div>
              )}

              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-32 w-64 bg-red-500/10 blur-3xl pointer-events-none z-10" />

              <div className="mt-12 space-y-4 flex flex-col items-center z-10">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-300 border border-slate-700/60 backdrop-blur-md">
                  <PhoneCall size={12} className="animate-pulse text-emerald-400" />
                  Incoming call
                </span>

                <div className="relative my-4">
                  <motion.div
                    animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-red-500/30 blur-md"
                  />
                  <motion.span
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-red-600/30 to-red-500/10 border-2 border-red-500/50 text-3xl font-extrabold text-red-300 shadow-xl"
                  >
                    {callerOption.avatar ? (
                      <img
                        src={callerOption.avatar}
                        alt={callerOption.label}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials(callerOption.label)
                    )}
                  </motion.span>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">
                    {callerOption.label}
                  </h2>
                  <p className="mt-1 text-xs font-medium text-slate-300 uppercase tracking-widest drop-shadow">
                    Mobile
                  </p>
                </div>
              </div>

              <div className="mb-8 flex w-full items-center justify-around z-10 px-6">
                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={resetToPicker}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600/90 text-white shadow-lg shadow-red-600/30 backdrop-blur-sm transition-all hover:bg-red-600"
                    title="Decline"
                  >
                    <PhoneOff size={24} />
                  </motion.button>
                  <span className="text-xs text-slate-300 font-medium drop-shadow">Decline</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      clearTimeout(ringTimeoutRef.current);
                      answerCall(script);
                    }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 backdrop-blur-sm transition-all hover:bg-emerald-500"
                    title="Answer"
                  >
                    <Phone size={24} />
                  </motion.button>
                  <span className="text-xs text-slate-300 font-medium drop-shadow">Accept</span>
                </div>
              </div>
            </motion.section>
          )}

          {/* STAGE: IN_CALL */}
          {stage === STAGE.IN_CALL && callerOption && (
            <motion.section
              key="in-call"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative flex min-h-[75vh] flex-col items-center justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 text-center backdrop-blur-2xl shadow-2xl"
            >
              {/* Background Caller Image with Overlay */}
              {callerOption.bgImage && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <img
                    src={callerOption.bgImage}
                    alt={callerOption.label}
                    className="h-full w-full object-cover scale-105 filter blur-md brightness-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/85 to-slate-950/95" />
                </div>
              )}

              <div className="mt-4 space-y-3 flex flex-col items-center z-10">
                <div className="relative">
                  <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-800 border border-slate-700/60 text-xl font-bold text-slate-200 shadow-inner">
                    {callerOption.avatar ? (
                      <img
                        src={callerOption.avatar}
                        alt={callerOption.label}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials(callerOption.label)
                    )}
                  </span>
                  <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight drop-shadow-md">
                    {callerOption.label}
                  </h2>
                  <div className="mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400 drop-shadow">
                    <Clock size={12} className="animate-pulse" />
                    <span>{formatTime(seconds)}</span>
                  </div>
                </div>
              </div>

              {/* Live Script Teleprompter Card */}
              <div className="my-6 max-h-56 w-full overflow-y-auto rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 text-left shadow-inner backdrop-blur-md z-10 scrollbar-thin scrollbar-thumb-slate-800">
                {script?.lines?.map((line, idx) => (
                  <motion.p
                    key={idx}
                    initial={false}
                    animate={{
                      opacity: idx === currentLine ? 1 : idx < currentLine ? 0.4 : 0.25,
                      scale: idx === currentLine ? 1.01 : 1,
                    }}
                    className={`mb-2.5 text-sm leading-relaxed transition-all ${
                      idx === currentLine
                        ? "font-semibold text-white bg-slate-800/60 p-2 rounded-xl border border-slate-700/50"
                        : idx < currentLine
                        ? "text-slate-400 px-2"
                        : "text-slate-500 px-2"
                    }`}
                  >
                    {line.text}
                  </motion.p>
                ))}
              </div>

              {/* Call Control Dashboard */}
              <div className="mb-2 flex w-full items-center justify-center gap-6 z-10">
                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/50 backdrop-blur-md transition hover:bg-slate-700 hover:text-white">
                  <VolumeX size={18} />
                </button>

                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={endCall}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30 transition hover:bg-red-500"
                  title="End call"
                >
                  <PhoneOff size={26} />
                </motion.button>

                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/50 backdrop-blur-md transition hover:bg-slate-700 hover:text-white">
                  <Volume2 size={18} />
                </button>
              </div>
            </motion.section>
          )}

          {/* STAGE: ENDED */}
          {stage === STAGE.ENDED && (
            <motion.section
              key="ended"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center backdrop-blur-xl shadow-2xl"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/60 mb-4">
                <UserCheck size={28} className="text-slate-300" />
              </div>

              <h2 className="text-2xl font-bold text-white tracking-tight">
                Call Ended
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Call duration: <span className="font-semibold text-slate-200">{formatTime(seconds)}</span>
              </p>

              <button
                onClick={resetToPicker}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 hover:shadow-red-600/30 active:scale-95"
              >
                <RefreshCw size={16} />
                Start Another Call
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}