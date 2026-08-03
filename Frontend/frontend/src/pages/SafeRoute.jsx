import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Navigation,
  ShieldCheck,
  Hospital,
  Search,
  Footprints,
  Car,
  Clock,
  Route as RouteIcon,
  LayoutDashboard,
  MapPin,
  Sparkles,
  ExternalLink,
} from "lucide-react";

import SafeRouteMap from "../components/SafeRouteMap";
import StatusMessage from "../components/StatusMessage";
import { searchPlaces, fetchSafeRoute } from "../api/safeRouteApi";
import { sortByDistance } from "../utils/geo";

export default function SafeRoute() {
  const [origin, setOrigin] = useState(null);
  const [locating, setLocating] = useState(true);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [destination, setDestination] = useState(null);

  const [profile, setProfile] = useState("driving"); // "driving" | "foot"
  const [routes, setRoutes] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [services, setServices] = useState([]);

  const [loadingRoute, setLoadingRoute] = useState(false);
  const [error, setError] = useState("");

  // Grab current location on mount as the default route origin.
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocating(false);
      setError("Geolocation isn't available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError(
          "Couldn't get your current location. Search a starting point isn't supported yet — allow location access and retry."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Debounced address search.
  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchPlaces(query);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const pickDestination = (place) => {
    setDestination(place);
    setQuery(place.label);
    setSuggestions([]);
  };

  const findSafeRoute = async () => {
    if (!origin) {
      setError("Your current location isn't available yet.");
      return;
    }
    if (!destination) {
      setError("Pick a destination from the search suggestions first.");
      return;
    }

    setLoadingRoute(true);
    setError("");
    setRoutes([]);
    setServices([]);

    try {
      const { routes, services } = await fetchSafeRoute(
        origin,
        destination,
        profile
      );

      setRoutes(routes);
      setServices(services);
      setSelectedIndex(0);
    } catch (err) {
      setError(err.message || "Failed to find a route");
    } finally {
      setLoadingRoute(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const formatDistance = (meters) =>
    meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;

const nearestServices = origin
  ? [
      ...sortByDistance(origin, services.filter((s) => s.type === "police")).slice(0, 4),
      ...sortByDistance(origin, services.filter((s) => s.type === "hospital")).slice(0, 4),
    ]
  : [];
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500/30">
      {/* Sticky Glass Top Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/sos"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition-all"
              title="Back to SOS"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <RouteIcon size={14} />
              </span>
              <span className="text-sm font-semibold tracking-tight text-white hidden sm:inline-block">
                Safe Route Finder
              </span>
            </div>
          </div>

          {/* Quick Nav: Dashboard Link */}
          <Link
            to="/dashboard/user"
            className="group relative inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 shadow-sm transition-all hover:border-emerald-500/30 hover:bg-zinc-800/90 hover:text-white"
          >
            <LayoutDashboard size={14} className="text-emerald-400 transition-transform group-hover:scale-110" />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 space-y-8">
        {/* Page Hero Header */}
        <div className="flex flex-col gap-2 border-b border-zinc-800/80 pb-6">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-0.5 text-[11px] font-medium text-emerald-400">
            <Sparkles size={11} />
            <span>Phase 6 · Safety-Aware Navigation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Find a Safer Route
          </h1>
          <p className="max-w-2xl text-sm text-zinc-400 leading-relaxed">
            Routes are ranked by how many police stations and hospitals sit along the way, not just by speed.
          </p>
        </div>

        {/* System Feedback Messages */}
        {error && <StatusMessage type="error">{error}</StatusMessage>}
        {locating && <StatusMessage type="info">Getting your current location…</StatusMessage>}

        {/* 2-Column Responsive Layout: Map + Sidebar Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Controls & Search Column */}
          <div className="lg:col-span-5 space-y-6">
            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl shadow-xl space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Destination Address
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setDestination(null);
                    }}
                    placeholder="Search destination address…"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 pl-10 pr-16 py-3 text-sm text-zinc-100 placeholder-zinc-600 shadow-inner focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  {searching && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-emerald-400 animate-pulse">
                      searching…
                    </span>
                  )}

                  {/* Address Search Suggestions Dropdown */}
                  {suggestions.length > 0 && (
                    <div className="absolute z-20 mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900/95 shadow-2xl overflow-hidden backdrop-blur-md">
                      {suggestions.map((place, i) => (
                        <button
                          key={i}
                          onClick={() => pickDestination(place)}
                          className="flex items-center gap-2.5 w-full text-left px-4 py-3 text-xs text-zinc-300 hover:bg-zinc-800/80 hover:text-white transition-colors border-b border-zinc-800/50 last:border-0"
                        >
                          <MapPin size={14} className="text-zinc-500 shrink-0" />
                          <span className="truncate">{place.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Mode Toggle & Safe Route Action Button */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="inline-flex rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-1">
                  <button
                    onClick={() => setProfile("driving")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      profile === "driving"
                        ? "bg-zinc-800 text-emerald-400 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Car size={14} /> Driving
                  </button>
                  <button
                    onClick={() => setProfile("foot")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      profile === "foot"
                        ? "bg-zinc-800 text-emerald-400 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Footprints size={14} /> Walking
                  </button>
                </div>

                <button
                  onClick={findSafeRoute}
                  disabled={loadingRoute || !destination}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-900/20 transition-all hover:shadow-emerald-900/40 active:scale-95"
                >
                  <Navigation size={14} />
                  {loadingRoute ? "Finding safest route…" : "Find Safe Route"}
                </button>
              </div>
            </section>

            {/* Route Options List */}
            {routes.length > 0 && (
              <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl shadow-xl space-y-3">
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Route Options
                </h2>
                <div className="space-y-2.5">
                  {routes.map((route, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedIndex(i)}
                      className={`w-full text-left rounded-xl border p-4 transition-all ${
                        i === selectedIndex
                          ? "border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-950/30"
                          : "border-zinc-800/80 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-800/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-zinc-100">
                            Route {i + 1}
                          </span>
                          {i === 0 && (
                            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                              Safest
                            </span>
                          )}
                        </div>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                          <ShieldCheck size={13} />
                          {route.safetyScore} nearby
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs font-medium text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} className="text-zinc-500" /> {formatDuration(route.durationSeconds)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-zinc-500" /> {formatDistance(route.distanceMeters)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Interactive Map Column */}
          <div className="lg:col-span-7 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-2 backdrop-blur-xl shadow-xl overflow-hidden min-h-[450px]">
            <SafeRouteMap
              origin={origin}
              destination={destination}
              routes={routes}
              selectedIndex={selectedIndex}
              services={services}
            />
          </div>
        </div>

        {/* Nearby Emergency Services */}
        {nearestServices.length > 0 && (
          <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Nearby Emergency Services
                </h2>
                <p className="text-xs text-zinc-400">
                  Verified emergency response locations nearest to your origin and route.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {nearestServices.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4 hover:border-zinc-700/80 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${
                        s.type === "police"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {s.type === "police" ? <ShieldCheck size={18} /> : <Hospital size={18} />}
                    </span>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-bold text-zinc-200 truncate">{s.name}</p>
                      <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                        {s.type}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-zinc-800/50 pt-3">
                    <span className="text-xs font-semibold text-zinc-400">
                      {formatDistance(s.distance)}
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${s.lat},${s.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <span>Directions</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}