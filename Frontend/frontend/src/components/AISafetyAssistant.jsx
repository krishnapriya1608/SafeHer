import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage, fetchEmergencyContacts } from "../api/aiSafetyApi";

const CATEGORIES = [
  {
    id: "safety-guidance",
    label: "Safety Guidance",
    description: "Practical steps to stay safe day to day",
  },
  {
    id: "emergency-info",
    label: "Emergency Information",
    description: "What to do right now in an emergency",
  },
  {
    id: "legal-rights",
    label: "Legal Rights",
    description: "Understand your rights and protections",
  },
];

export default function AISafetyAssistant({ userId }) {
  const [category, setCategory] = useState("safety-guidance");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contacts, setContacts] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchEmergencyContacts("IN")
      .then(setContacts)
      .catch(() => setContacts(null));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userEntry = { role: "user", text, category };
    setMessages((prev) => [...prev, userEntry]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const data = await sendChatMessage(text, category, userId);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.response,
          category: data.category,
          urgent: data.urgent,
        },
      ]);
    } catch (err) {
      setError("Something went wrong reaching the assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-10 font-sans text-slate-800">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-teal-950 mb-2">
          SafeSphere AI Safety Assistant
        </h1>
        <p className="text-sm leading-relaxed bg-amber-50 border border-amber-300 text-amber-900 rounded-lg px-3.5 py-2.5">
          If you are in immediate danger, call{" "}
          <strong className="font-semibold">
            {contacts?.numbers?.["All-in-one emergency"] || "112"}
          </strong>{" "}
          now. This assistant provides general information only.
        </p>
      </header>

      <nav
        aria-label="Assistant category"
        className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5"
      >
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={`flex flex-col items-start gap-1 text-left px-3 py-3 rounded-xl border transition-colors ${
              category === c.id
                ? "bg-teal-50 border-teal-700"
                : "bg-slate-50 border-slate-300 hover:border-teal-700"
            }`}
          >
            <span className="font-semibold text-sm text-teal-950">{c.label}</span>
            <span className="text-xs text-slate-500">{c.description}</span>
          </button>
        ))}
      </nav>

      {category === "emergency-info" && contacts && (
        <div className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 mb-5">
          <h2 className="text-sm font-semibold mb-2">
            Quick reference: {contacts.country}
          </h2>
          <ul className="divide-y divide-slate-200">
            {Object.entries(contacts.numbers).map(([label, number]) => (
              <li
                key={label}
                className="flex justify-between items-center py-1.5 text-sm"
              >
                <span>{label}</span>
                <a href={`tel:${number}`} className="font-semibold text-teal-700">
                  {number}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="min-h-[260px] max-h-[420px] overflow-y-auto border border-slate-300 rounded-xl p-3.5 bg-white mb-3">
        {messages.length === 0 && (
          <p className="text-sm text-slate-400">
            Ask a question about{" "}
            {CATEGORIES.find((c) => c.id === category).label.toLowerCase()}.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[90%] mb-3 px-3 py-2.5 rounded-lg text-sm leading-relaxed ${
              m.role === "user"
                ? "ml-auto bg-teal-50"
                : "bg-slate-100"
            }`}
          >
            {m.role === "assistant" && m.urgent && (
              <div className="mb-2 text-xs font-semibold bg-red-50 border border-red-300 text-red-800 rounded-md px-2.5 py-1.5">
                This sounds urgent. If you are in danger, contact local emergency
                services immediately.
              </div>
            )}
            <p>{m.text}</p>
          </div>
        ))}
        {loading && (
          <div className="max-w-[90%] mb-3 px-3 py-2.5 rounded-lg text-sm bg-slate-100">
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <div className="text-sm text-red-700 mb-2">{error}</div>}

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question…"
          aria-label="Message"
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-700"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4.5 py-2.5 rounded-lg font-semibold text-white bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}
