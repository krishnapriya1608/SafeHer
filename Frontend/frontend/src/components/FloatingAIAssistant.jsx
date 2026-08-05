import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send } from "lucide-react";
import { sendChatMessage, fetchEmergencyContacts } from "../api/aiSafetyApi";

const CATEGORIES = [
  { id: "safety-guidance", label: "Safety" },
  { id: "emergency-info", label: "Emergency" },
  { id: "legal-rights", label: "Legal" },
];

export default function FloatingAIAssistant({ userId }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("safety-guidance");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emergencyNumber, setEmergencyNumber] = useState("112");
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchEmergencyContacts("IN")
      .then((data) => setEmergencyNumber(data?.numbers?.["All-in-one emergency"] || "112"))
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const data = await sendChatMessage(text, category, userId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.response, urgent: data.urgent },
      ]);
    } catch (err) {
      setError("Couldn't reach the assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {open && (
        <div className="mb-3 w-[340px] sm:w-[380px] h-[520px] max-h-[75vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-teal-700 text-white px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">SafeSphere Assistant</p>
              <p className="text-[11px] text-teal-100">
                Emergency? Call <span className="font-semibold">{emergencyNumber}</span> now
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-full hover:bg-teal-600 transition"
              aria-label="Close assistant"
            >
              <X size={18} />
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-1.5 px-3 pt-2.5 pb-1">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                  category === c.id
                    ? "bg-teal-50 border-teal-700 text-teal-800 font-semibold"
                    : "bg-white border-slate-300 text-slate-500"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5">
            {messages.length === 0 && (
              <p className="text-xs text-slate-400 mt-2">
                Ask about safety, emergencies, or your legal rights.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                  m.role === "user" ? "ml-auto bg-teal-600 text-white" : "bg-slate-100 text-slate-800"
                }`}
              >
                {m.role === "assistant" && m.urgent && (
                  <div className="mb-1.5 text-[10px] font-semibold bg-red-50 border border-red-300 text-red-700 rounded px-2 py-1">
                    This sounds urgent — contact local emergency services now.
                  </div>
                )}
                <p>{m.text}</p>
              </div>
            ))}
            {loading && (
              <div className="max-w-[85%] px-3 py-2 rounded-xl text-xs bg-slate-100 text-slate-500">
                Thinking…
              </div>
            )}
            {error && <p className="text-[11px] text-red-600">{error}</p>}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-slate-200 p-2.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              aria-label="Message"
              className="flex-1 text-xs border border-slate-300 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-full bg-teal-700 text-white disabled:opacity-40"
              aria-label="Send"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      {/* Bubble launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-teal-700 text-white shadow-xl flex items-center justify-center hover:bg-teal-800 transition ml-auto"
        aria-label={open ? "Close AI Safety Assistant" : "Open AI Safety Assistant"}
      >
        {open ? <X size={22} /> : <Bot size={24} />}
      </button>
    </div>
  );
}
