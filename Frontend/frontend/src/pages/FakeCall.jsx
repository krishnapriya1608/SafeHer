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
    label: "Delivery Exec",
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
    <main className="min-h-screen bg-[#FDF8F5] px-4 py-10 text-[#3D2E2B] font-serif flex items-center justify-center selection:bg-[#D4A373]/30">
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
              className="relative overflow-hidden rounded-t-[5rem] rounded-b-3xl border border-[#EADBD3] bg-white p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div className="flex justify-between items-center border-b border-[#F5ECE8] pb-4">
                <Link
                  to="/dashboard/user"
                  className="group inline-flex items-center gap-2 rounded-none border-b border-[#8C4A32] pb-0.5 text-xs tracking-widest uppercase text-[#8C4A32] font-sans transition-all hover:text-[#582A1B]"
                >
                  <LayoutDashboard size={14} className="transition-transform group-hover:scale-110" />
                  <span>Dashboard</span>
                </Link>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4A373]/20 px-3 py-1 text-[10px] font-sans font-semibold tracking-widest uppercase text-[#8C4A32] border border-[#D4A373]/40">
                  <Shield size={12} />
                  Safety Tool
                </span>
              </div>

              <div className="text-center space-y-2 pt-2">
                <span className="text-xs tracking-[0.25em] uppercase text-[#B58369] font-sans font-semibold">
                  Discrete Assistance
                </span>
                <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#3D2E2B] uppercase">
                  Fake Call Generator
                </h1>
                <div className="w-10 h-px bg-[#B58369] mx-auto my-1" />
                <p className="text-xs font-sans italic text-[#6B524B] leading-relaxed">
                  Instantly simulate an incoming call with a natural, one-sided audio script to gracefully exit uncomfortable situations.
                </p>
              </div>

              {!supportsSpeech && (
                <div className="flex items-start gap-2.5 rounded-xl border border-[#EADBD3] bg-[#FDF8F5] p-3 text-xs font-sans text-[#B58369]">
                  <AlertCircle size={16} className="shrink-0 text-[#8C4A32] mt-0.5" />
                  <span>
                    Voice playback isn't supported in this browser. The call script will still display on screen.
                  </span>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-sans text-rose-700">
                  <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2 font-sans">
                {CALLER_OPTIONS.map((option, idx) => (
                  <button
                    key={option.id}
                    disabled={loading}
                    onClick={() => startCallFlow(option)}
                    className="group relative flex flex-col items-center gap-3 rounded-t-full rounded-b-2xl border border-[#EADBD3] bg-white p-5 text-center transition-all duration-300 hover:border-[#8C4A32] hover:bg-[#FDF8F5] shadow-sm disabled:opacity-50"
                  >
                    <span className="text-[10px] font-serif text-[#B58369]">0{idx + 1}</span>
                    {option.avatar ? (
                      <img
                        src={option.avatar}
                        alt={option.label}
                        className="h-14 w-14 rounded-full object-cover border border-[#EADBD3] transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FDF8F5] border border-[#EADBD3] text-xs font-bold text-[#8C4A32]">
                        {initials(option.label)}
                      </span>
                    )}
                    <div className="space-y-0.5">
                      <span className="block text-xs font-bold font-serif text-[#3D2E2B] group-hover:text-[#8C4A32] transition-colors">
                        {option.label}
                      </span>
                      <span className="block text-[10px] text-[#B58369] truncate max-w-full uppercase tracking-wider">
                        {option.subtitle}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {loading && (
                <div className="flex items-center justify-center gap-2 text-xs font-sans text-[#8C4A32] italic animate-pulse">
                  <Sparkles size={14} />
                  <span>Preparing your safe call...</span>
                </div>
              )}

              <div className="text-center pt-2">
                <p className="text-[11px] italic text-[#B58369]">A journey of a thousand miles begins with a single step.</p>
              </div>
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
              className="relative flex min-h-[70vh] flex-col items-center justify-between overflow-hidden rounded-t-[5rem] rounded-b-3xl border border-[#EADBD3] bg-white p-8 text-center shadow-sm"
            >
              <div className="mt-6 space-y-4 flex flex-col items-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#FDF8F5] px-3.5 py-1 text-xs font-sans text-[#8C4A32] border border-[#EADBD3]">
                  <PhoneCall size={12} className="animate-pulse text-[#8C4A32]" />
                  Incoming call
                </span>

                <div className="relative my-4">
                  <motion.div
                    animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-[#D4A373]/30"
                  />
                  <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-[#8C4A32] bg-[#FDF8F5]">
                    {callerOption.avatar ? (
                      <img
                        src={callerOption.avatar}
                        alt={callerOption.label}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-serif text-[#8C4A32] font-bold">
                        {initials(callerOption.label)}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-serif font-bold text-[#3D2E2B] uppercase tracking-wide">
                    {callerOption.label}
                  </h2>
                  <p className="mt-1 text-[11px] font-sans font-semibold text-[#B58369] uppercase tracking-widest">
                    Mobile
                  </p>
                </div>
              </div>

              <div className="mb-6 flex w-full items-center justify-around font-sans px-4">
                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetToPicker}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#A64B2A] text-white shadow-sm transition-all"
                    title="Decline"
                  >
                    <PhoneOff size={20} />
                  </motion.button>
                  <span className="text-xs text-[#6B524B] font-medium uppercase tracking-wider">Decline</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      clearTimeout(ringTimeoutRef.current);
                      answerCall(script);
                    }}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#6B8E23] text-white shadow-sm transition-all"
                    title="Answer"
                  >
                    <Phone size={20} />
                  </motion.button>
                  <span className="text-xs text-[#6B524B] font-medium uppercase tracking-wider">Accept</span>
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
              className="relative flex min-h-[70vh] flex-col items-center justify-between overflow-hidden rounded-t-[5rem] rounded-b-3xl border border-[#EADBD3] bg-white p-6 sm:p-8 text-center shadow-sm"
            >
              <div className="mt-4 space-y-3 flex flex-col items-center">
                <div className="relative">
                  <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#FDF8F5] border border-[#EADBD3]">
                    {callerOption.avatar ? (
                      <img
                        src={callerOption.avatar}
                        alt={callerOption.label}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold font-serif text-[#8C4A32]">
                        {initials(callerOption.label)}
                      </span>
                    )}
                  </span>
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-[#6B8E23] border-2 border-white" />
                </div>

                <div>
                  <h2 className="text-xl font-serif font-bold text-[#3D2E2B]">
                    {callerOption.label}
                  </h2>
                  <div className="mt-1 flex items-center justify-center gap-1.5 text-xs font-sans font-medium text-[#8C4A32]">
                    <Clock size={12} className="animate-pulse" />
                    <span>{formatTime(seconds)}</span>
                  </div>
                </div>
              </div>

              {/* Live Script Teleprompter Card */}
              <div className="my-4 max-h-52 w-full overflow-y-auto rounded-2xl border border-[#EADBD3] bg-[#FDF8F5] p-4 text-left font-sans shadow-inner scrollbar-thin">
                {script?.lines?.map((line, idx) => (
                  <motion.p
                    key={idx}
                    initial={false}
                    animate={{
                      opacity: idx === currentLine ? 1 : idx < currentLine ? 0.4 : 0.25,
                      scale: idx === currentLine ? 1.01 : 1,
                    }}
                    className={`mb-2 text-xs leading-relaxed transition-all ${
                      idx === currentLine
                        ? "font-semibold text-[#3D2E2B] bg-white p-2.5 rounded-xl border border-[#EADBD3]"
                        : "text-[#6B524B] px-2"
                    }`}
                  >
                    {line.text}
                  </motion.p>
                ))}
              </div>

              {/* Call Control Dashboard */}
              <div className="mb-2 flex w-full items-center justify-center gap-6 font-sans">
                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FDF8F5] text-[#6B524B] border border-[#EADBD3] transition hover:text-[#3D2E2B]">
                  <VolumeX size={18} />
                </button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={endCall}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-[#A64B2A] text-white shadow-sm transition"
                  title="End call"
                >
                  <PhoneOff size={24} />
                </motion.button>

                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FDF8F5] text-[#6B524B] border border-[#EADBD3] transition hover:text-[#3D2E2B]">
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
              className="relative overflow-hidden rounded-t-[5rem] rounded-b-3xl border border-[#EADBD3] bg-white p-8 text-center shadow-sm space-y-4"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FDF8F5] text-[#8C4A32] border border-[#EADBD3]">
                <UserCheck size={26} />
              </div>

              <h2 className="text-2xl font-serif font-bold text-[#3D2E2B] uppercase tracking-wide">
                Call Ended
              </h2>
              <p className="text-xs font-sans text-[#6B524B]">
                Call duration: <span className="font-semibold text-[#8C4A32]">{formatTime(seconds)}</span>
              </p>

              <button
                onClick={resetToPicker}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#8C4A32] hover:bg-[#582A1B] px-6 py-3 text-xs font-sans tracking-widest uppercase text-white shadow-sm transition-all active:scale-95"
              >
                <RefreshCw size={14} />
                Start Another Call
              </button>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}