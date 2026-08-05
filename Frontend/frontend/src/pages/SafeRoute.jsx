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
    <main className="min-h-screen bg-white text-[#2C1D18] font-sans selection:bg-[#A67C65]/30">
      {/* Earthy Hero Section with Blurred Background Image */}
      <section className="relative text-white pt-6 pb-24 px-4 sm:px-8 overflow-hidden rounded-b-[3.5rem] shadow-xl">
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105 filter blur-md"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=2000')`, // Desert sand aesthetic image matching reference
          }}
        />

        {/* Color Overlay Layer for Tone Matching & Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#4A3026]/70 via-[#8C5E48]/80 to-[#A67C65]/90" />

        {/* Header inside Hero */}
        <header className="relative z-10 mx-auto max-w-6xl flex items-center justify-between pb-10 border-b border-white/20">
          <div className="flex items-center gap-4">
            <Link
              to="/sos"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white hover:bg-white hover:text-[#8C5E48] transition-all backdrop-blur-md"
              title="Back to SOS"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="h-5 w-px bg-white/20" />
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md">
                <RouteIcon size={16} />
              </span>
              <span className="text-sm font-semibold tracking-wider uppercase text-white hidden sm:inline-block">
                Safe Route Finder
              </span>
            </div>
          </div>

          <Link
            to="/dashboard/user"
            className="group inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold tracking-widest uppercase text-white backdrop-blur-md transition-all hover:bg-white hover:text-[#8C5E48]"
          >
            <LayoutDashboard size={14} className="transition-transform group-hover:scale-110" />
            <span>Dashboard</span>
          </Link>
        </header>

        {/* Hero Banner Text Content */}
        <div className="relative z-10 mx-auto max-w-4xl text-center mt-12 space-y-4">
          <p className="font-serif italic text-2xl text-[#F4ECE8] drop-shadow-sm">
            Navigation with Peace of Mind
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase text-white leading-tight drop-shadow-md">
            FIND A SAFER ROUTE
          </h1>
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#F4ECE8]/90 leading-relaxed drop-shadow-sm">
            Routes are evaluated and prioritized based on nearby emergency services, police presence, and medical centers along your destination path.
          </p>

          {/* Color palette indicator accents */}
          <div className="flex justify-center gap-2 pt-4">
            <span className="w-3 h-3 rounded-full bg-[#EADBD3]" />
            <span className="w-3 h-3 rounded-full bg-[#C8A28D]" />
            <span className="w-3 h-3 rounded-full bg-[#A67C65]" />
            <span className="w-3 h-3 rounded-full bg-[#8C5E48]" />
            <span className="w-3 h-3 rounded-full bg-[#4A3026]" />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-6xl px-4 sm:px-8 -mt-10 relative z-20 space-y-12 pb-16">
        
        {/* System Feedback Messages */}
        {error && <StatusMessage type="error">{error}</StatusMessage>}
        {locating && <StatusMessage type="info">Getting your current location…</StatusMessage>}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls & Search Column */}
          <div className="lg:col-span-5 space-y-6">
            <section className="rounded-t-[4rem] rounded-b-2xl border border-[#EADBD3] bg-white p-8 shadow-xl space-y-6">
              <div className="space-y-2">
                <p className="font-serif italic text-center text-[#8C5E48] text-sm">Where are you heading?</p>
                <h2 className="text-xs tracking-widest uppercase text-[#4A3026] font-extrabold text-center">
                  Destination Address
                </h2>
                <div className="relative pt-2">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C5E48]" />
                  <input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setDestination(null);
                    }}
                    placeholder="Search destination address…"
                    className="w-full rounded-full border border-[#EADBD3] bg-[#FDF8F5] pl-11 pr-16 py-3.5 text-xs text-[#2C1D18] placeholder-[#A67C65]/70 focus:border-[#8C5E48] focus:outline-none transition-all shadow-inner font-medium"
                  />
                  {searching && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#8C5E48]">
                      searching…
                    </span>
                  )}

                  {/* Address Search Suggestions Dropdown */}
                  {suggestions.length > 0 && (
                    <div className="absolute z-30 mt-2 w-full rounded-2xl border border-[#EADBD3] bg-white shadow-2xl overflow-hidden">
                      {suggestions.map((place, i) => (
                        <button
                          key={i}
                          onClick={() => pickDestination(place)}
                          className="flex items-center gap-2.5 w-full text-left px-4 py-3.5 text-xs text-[#2C1D18] hover:bg-[#FDF8F5] hover:text-[#8C5E48] transition-colors border-b border-[#F5ECE8] last:border-0 font-medium"
                        >
                          <MapPin size={14} className="text-[#8C5E48] shrink-0" />
                          <span className="truncate">{place.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Mode Toggle & Safe Route Action Button */}
              <div className="flex flex-col gap-3 pt-2">
                <div className="inline-flex rounded-full border border-[#EADBD3] bg-[#FDF8F5] p-1.5 justify-center">
                  <button
                    onClick={() => setProfile("driving")}
                    className={`flex-1 py-2 px-4 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      profile === "driving"
                        ? "bg-[#8C5E48] text-white shadow-md"
                        : "text-[#8C5E48] hover:text-[#4A3026]"
                    }`}
                  >
                    <Car size={14} /> Driving
                  </button>
                  <button
                    onClick={() => setProfile("foot")}
                    className={`flex-1 py-2 px-4 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      profile === "foot"
                        ? "bg-[#8C5E48] text-white shadow-md"
                        : "text-[#8C5E48] hover:text-[#4A3026]"
                    }`}
                  >
                    <Footprints size={14} /> Walking
                  </button>
                </div>

                <button
                  onClick={findSafeRoute}
                  disabled={loadingRoute || !destination}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#4A3026] hover:bg-[#2C1D18] disabled:opacity-40 disabled:cursor-not-allowed px-6 py-4 text-xs font-extrabold tracking-widest uppercase text-white shadow-lg transition-all active:scale-[0.98]"
                >
                  <Navigation size={14} />
                  {loadingRoute ? "Finding safest route…" : "Find Safe Route"}
                </button>
              </div>
            </section>

            {/* Route Options List */}
            {routes.length > 0 && (
              <section className="rounded-2xl border border-[#EADBD3] bg-white p-6 shadow-md space-y-4">
                <h2 className="text-xs font-extrabold tracking-widest uppercase text-[#8C5E48] text-center border-b border-[#F5ECE8] pb-3">
                  Available Safe Routes
                </h2>
                <div className="space-y-3">
                  {routes.map((route, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedIndex(i)}
                      className={`w-full text-left rounded-xl border p-4 transition-all ${
                        i === selectedIndex
                          ? "border-[#8C5E48] bg-[#FDF8F5] shadow-sm"
                          : "border-[#EADBD3] bg-white hover:border-[#8C5E48]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold uppercase tracking-wider text-[#4A3026]">
                            Route {i + 1}
                          </span>
                          {i === 0 && (
                            <span className="text-[10px] font-extrabold tracking-widest uppercase bg-[#8C5E48] text-white px-2.5 py-0.5 rounded-full">
                              Safest
                            </span>
                          )}
                        </div>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-[#8C4A32] bg-[#F5ECE8] px-3 py-1 rounded-full border border-[#EADBD3]">
                          <ShieldCheck size={13} />
                          {route.safetyScore} nearby
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-[#8C5E48]">
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} /> {formatDuration(route.durationSeconds)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={13} /> {formatDistance(route.distanceMeters)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Arch-Shaped Interactive Map Container */}
          <div className="lg:col-span-7 rounded-t-[8rem] rounded-b-3xl border-2 border-[#EADBD3] bg-white p-3 shadow-xl overflow-hidden min-h-[500px]">
            <div className="w-full h-full rounded-t-[7.5rem] rounded-b-2xl overflow-hidden border border-[#F5ECE8]">
              <SafeRouteMap
                origin={origin}
                destination={destination}
                routes={routes}
                selectedIndex={selectedIndex}
                services={services}
              />
            </div>
          </div>
        </div>

        {/* Nearby Emergency Services */}
        {nearestServices.length > 0 && (
          <section className="bg-[#4A3026] text-white rounded-[3rem] p-8 sm:p-12 shadow-xl space-y-8 relative overflow-hidden">
            <div className="text-center space-y-2 relative z-10">
              <p className="font-serif italic text-[#C8A28D] text-base">Always within reach</p>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
                Nearby Emergency Services
              </h2>
              <div className="w-12 h-0.5 bg-[#A67C65] mx-auto my-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
              {nearestServices.map((s, idx) => (
                <div
                  key={s.id}
                  className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  <div className="text-center pt-2 pb-2 border-b border-white/10 mb-3">
                    <span className="text-xs font-serif text-[#C8A28D] block mb-2">0{idx + 1}</span>
                    <span
                      className={`mx-auto grid h-10 w-10 place-items-center rounded-full border mb-3 ${
                        s.type === "police"
                          ? "bg-white/10 text-white border-white/20"
                          : "bg-white/10 text-[#C8A28D] border-white/20"
                      }`}
                    >
                      {s.type === "police" ? <ShieldCheck size={18} /> : <Hospital size={18} />}
                    </span>
                    <p className="text-xs font-bold text-white truncate">{s.name}</p>
                    <p className="text-[10px] tracking-widest uppercase text-[#C8A28D] mt-0.5 font-bold">
                      {s.type}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-[#EADBD3]">
                      {formatDistance(s.distance)}
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${s.lat},${s.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#C8A28D] hover:text-white transition-colors"
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

        {/* Footer Accent Quote */}
        <footer className="text-center pt-8 pb-4">
          <p className="font-serif italic text-sm text-[#8C5E48]">
            "It's time to make your journey safe and secure. Are you ready to move with confidence?"
          </p>
        </footer>
      </div>
    </main>
  );
}