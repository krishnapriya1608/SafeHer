import { useState } from "react";
import { ShieldAlert, Camera, MapPin, Loader2 } from "lucide-react";
import { submitReport } from "../api/reportApi";

const CATEGORY_OPTIONS = [
  { id: "poor_lighting", label: "Poor Lighting" },
  { id: "harassment", label: "Harassment" },
  { id: "no_police_presence", label: "No Police Presence" },
  { id: "suspicious_activity", label: "Suspicious Activity" },
  { id: "stray_animals", label: "Stray Animals" },
  { id: "unsafe_construction", label: "Unsafe Construction" },
  { id: "isolated_area", label: "Isolated Area" },
  { id: "other", label: "Other" },
];

export default function ReportForm({ userId, onSubmitted }) {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const useCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("Location access isn't available in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError("Couldn't get your location. Please allow location access and try again.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!location) {
      setError("Please share your location so we know where this is.");
      return;
    }
    if (!category) {
      setError("Please choose a category.");
      return;
    }
    if (description.trim().length < 5) {
      setError("Please add a short description (5+ characters).");
      return;
    }

    setSubmitting(true);
    try {
      await submitReport(
        {
          userId,
          lat: location.lat,
          lng: location.lng,
          category,
          description,
        },
        images
      );
      setSuccess(true);
      setCategory("");
      setDescription("");
      setImages([]);
      onSubmitted?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
        <ShieldAlert className="mx-auto text-emerald-400" size={28} />
        <h3 className="mt-3 text-lg font-bold text-white">Report submitted</h3>
        <p className="mt-1 text-sm text-emerald-300/80">
          Thanks for helping keep the community informed. It'll show as pending until an admin reviews it.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
        >
          Report another area
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-white tracking-tight">Report an Unsafe Area</h2>
        <p className="mt-1 text-xs text-zinc-500">
          Help others by flagging areas with poor lighting, harassment, or other safety concerns.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          {error}
        </p>
      )}

      {/* Location */}
      <div>
        <label className="text-xs font-semibold text-zinc-400">Location</label>
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/70 py-3 text-xs font-semibold text-zinc-300 hover:border-red-500/40 disabled:opacity-50"
        >
          {locating ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
          {location
            ? `Location set (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`
            : locating
            ? "Getting your location…"
            : "Use my current location"}
        </button>
      </div>

      {/* Category */}
      <div>
        <label className="text-xs font-semibold text-zinc-400">Category</label>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setCategory(opt.id)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                category === opt.id
                  ? "border-red-500/50 bg-red-500/15 text-red-300"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-semibold text-zinc-400">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="What's happening here? e.g. Streetlight has been out for weeks near the park entrance."
          className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
      </div>

      {/* Images */}
      <div>
        <label className="text-xs font-semibold text-zinc-400">Photos (optional, up to 5)</label>
        <label className="mt-1.5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-950/40 py-4 text-xs font-semibold text-zinc-400 hover:border-zinc-600">
          <Camera size={15} />
          {images.length > 0 ? `${images.length} photo(s) selected` : "Add photos"}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit Report"}
      </button>
    </form>
  );
}
