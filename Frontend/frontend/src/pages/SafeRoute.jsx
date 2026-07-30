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
} from "lucide-react";

import SafeRouteMap from "../components/SafeRouteMap";
import StatusMessage from "../components/StatusMessage";
import {
    searchPlaces,
    fetchSafeRoute,
    sortByDistance,
} from "../api/safeRouteApi";

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
                setError("Couldn't get your current location. Search a starting point isn't supported yet — allow location access and retry.");
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

    const nearestServices = origin ? sortByDistance(origin, services).slice(0, 8) : [];

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-8 md:py-12">
            <div className="mx-auto max-w-5xl space-y-6">
                <Link
                    to="/sos"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-white transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back
                </Link>

                <div className="border-b border-zinc-800 pb-6">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md">
                        <RouteIcon size={12} />
                        Phase 6 · Safe Route Finder
                    </span>
                    <h1 className="mt-2.5 text-3xl font-extrabold tracking-tight text-white">
                        Find a Safer Route
                    </h1>
                    <p className="mt-1.5 text-sm text-zinc-400">
                        Routes are ranked by how many police stations and hospitals sit along the way,
                        not just by speed.
                    </p>
                </div>

                {error && <StatusMessage type="error">{error}</StatusMessage>}
                {locating && <StatusMessage type="info">Getting your current location…</StatusMessage>}

                {/* Search + controls */}
                <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
                    <div className="relative">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setDestination(null);
                            }}
                            placeholder="Search destination address…"
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 pl-10 pr-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                        />
                        {searching && (
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">
                                searching…
                            </span>
                        )}

                        {suggestions.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden">
                                {suggestions.map((place, i) => (
                                    <button
                                        key={i}
                                        onClick={() => pickDestination(place)}
                                        className="block w-full text-left px-4 py-2.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
                                    >
                                        {place.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex rounded-xl border border-zinc-800 overflow-hidden">
                            <button
                                onClick={() => setProfile("driving")}
                                className={`px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 transition-all ${profile === "driving" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"
                                    }`}
                            >
                                <Car size={13} /> Driving
                            </button>
                            <button
                                onClick={() => setProfile("foot")}
                                className={`px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 transition-all border-l border-zinc-800 ${profile === "foot" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"
                                    }`}
                            >
                                <Footprints size={13} /> Walking
                            </button>
                        </div>

                        <button
                            onClick={findSafeRoute}
                            disabled={loadingRoute || !destination}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 px-4 py-2 text-xs font-bold text-white transition-all"
                        >
                            <Navigation size={13} />
                            {loadingRoute ? "Finding safest route…" : "Find Safe Route"}
                        </button>
                    </div>
                </section>

                {/* Map */}
                <SafeRouteMap
                    origin={origin}
                    destination={destination}
                    routes={routes}
                    selectedIndex={selectedIndex}
                    services={services}
                />

                {/* Route options */}
                {routes.length > 0 && (
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                        <h2 className="text-sm font-bold text-white tracking-tight">Route Options</h2>
                        <div className="mt-3 space-y-2">
                            {routes.map((route, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedIndex(i)}
                                    className={`w-full text-left rounded-xl border p-4 transition-all ${i === selectedIndex
                                            ? "border-emerald-500/40 bg-emerald-500/[0.06]"
                                            : "border-zinc-800 hover:border-zinc-700"
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            {i === 0 && (
                                                <span className="text-[9px] font-extrabold uppercase tracking-widest bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded">
                                                    Safest
                                                </span>
                                            )}
                                            <span className="text-sm font-semibold text-zinc-200">
                                                Route {i + 1}
                                            </span>
                                        </div>
                                        <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                                            <ShieldCheck size={12} className="text-blue-400" />
                                            {route.safetyScore} nearby
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
                                        <span className="flex items-center gap-1">
                                            <Clock size={11} /> {formatDuration(route.durationSeconds)}
                                        </span>
                                        <span>{formatDistance(route.distanceMeters)}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Nearby emergency services */}
                {nearestServices.length > 0 && (
                    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                        <h2 className="text-sm font-bold text-white tracking-tight">
                            Nearby Emergency Services
                        </h2>
                        <div className="mt-3 space-y-2">
                            {nearestServices.map((s) => (
                                <div
                                    key={s.id}
                                    className="flex items-center justify-between rounded-xl border border-zinc-800 p-3.5"
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`grid h-8 w-8 place-items-center rounded-lg ${s.type === "police" ? "bg-blue-500/10 text-blue-400" : "bg-rose-500/10 text-rose-400"
                                                }`}
                                        >
                                            {s.type === "police" ? <ShieldCheck size={15} /> : <Hospital size={15} />}
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-zinc-200">{s.name}</p>
                                            <p className="text-[11px] text-zinc-500 capitalize">{s.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-zinc-300">
                                            {formatDistance(s.distance)}
                                        </p>
                                        <a
                                            href={`https://www.google.com/maps?q=${s.lat},${s.lng}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300"
                                        >
                                            Directions
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
