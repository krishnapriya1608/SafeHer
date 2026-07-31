const RouteSearch = require("../Model/routeSearchModel");
const { boundingBox, minDistanceToPath, sampleRoute } = require("../utils/geo");


const OSRM_BASE = "https://router.project-osrm.org/route/v1";
const OVERPASS_BASE = "https://overpass-api.de/api/interpreter";
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
// GET /api/saferoute/search?q=<query>
// Address / place-name autocomplete, proxied from Nominatim.
const searchPlaces = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 3) {
      return res.json({ results: [] });
    }

    const url = `${NOMINATIM_BASE}/search?format=json&limit=5&q=${encodeURIComponent(q)}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "SafeHer-App/1.0" },
    });

  if (!response.ok) {
  const body = await response.text().catch(() => "");
  console.log("Overpass failed:", response.status, response.statusText, body.slice(0, 300));
  throw new Error("Emergency service lookup failed upstream");
}

    const data = await response.json();
    const results = data.map((item) => ({
      label: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));

    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: "Address search failed", error: err.message });
    console.log(err)
  }
};

// Fetch route alternatives from OSRM. Returns [{ path, distanceMeters, durationSeconds }]
async function fetchRoutesFromOSRM(origin, destination, profile) {
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = `${OSRM_BASE}/${profile}/${coords}?overview=full&geometries=geojson&alternatives=true&steps=false`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Route lookup failed upstream");

  const data = await response.json();
  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error("No route found between those points");
  }

  return data.routes.map((route) => ({
    // GeoJSON coordinates are [lng, lat] — flip to [lat, lng] for Leaflet.
    path: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  }));
}

// Fetch police stations + hospitals inside a bounding box via Overpass.
async function fetchServicesFromOverpass(points) {
  const { south, west, north, east } = boundingBox(points);
  const bbox = `${south},${west},${north},${east}`;
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="police"](${bbox});
      way["amenity"="police"](${bbox});
      node["amenity"="hospital"](${bbox});
      way["amenity"="hospital"](${bbox});
    );
    out center tags;
  `;
  let lastErr;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "User-Agent": "SafeHer-App/1.0 (contact: rishnak10@gmail.com)",
        },
        body: query,
      });
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        console.log(`Overpass (${endpoint}) failed:`, response.status, body.slice(0, 300));
        throw new Error(`Overpass returned ${response.status}`);
      }
      const data = await response.json();
      return data.elements
        .map((el) => {
          const lat = el.lat ?? el.center?.lat;
          const lng = el.lon ?? el.center?.lon;
          if (lat == null || lng == null) return null;
          return {
            id: `${el.type}-${el.id}`,
            type: el.tags?.amenity === "police" ? "police" : "hospital",
            name: el.tags?.name || (el.tags?.amenity === "police" ? "Police Station" : "Hospital"),
            lat,
            lng,
          };
        })
        .filter(Boolean);
    } catch (err) {
      lastErr = err;
      console.log(`Overpass endpoint ${endpoint} failed, trying next...`);
    }
  }
  throw new Error("Emergency service lookup failed upstream: " + lastErr?.message);
}

// Ranks each route by how many distinct police/hospitals sit within
// `bufferMeters` of it (sampled points, not every coordinate).
function scoreRoutes(routes, services, bufferMeters = 400) {
  return routes.map((route) => {
    const sampled = sampleRoute(route.path, 25);
    const nearby = services.filter(
      (s) => minDistanceToPath([s.lat, s.lng], sampled) <= bufferMeters
    );
    return { ...route, safetyScore: nearby.length, nearbyServices: nearby };
  });
}

// POST /api/saferoute/route
// body: { userId?, origin: {lat,lng}, destination: {lat,lng,label?}, profile? }
const getSafeRoute = async (req, res) => {
  try {
    const { userId, origin, destination, profile = "driving" } = req.body;

    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      return res.status(400).json({ message: "origin and destination coordinates are required" });
    }

    const rawRoutes = await fetchRoutesFromOSRM(origin, destination, profile);

    const allPoints = rawRoutes.flatMap((r) => r.path);
    const services = await fetchServicesFromOverpass(allPoints);

    const scored = scoreRoutes(rawRoutes, services);
    // Safest first (most police/hospitals along the way), then shortest duration.
    scored.sort((a, b) => b.safetyScore - a.safetyScore || a.durationSeconds - b.durationSeconds);

    const best = scored[0];

    // Best-effort logging — a failure here shouldn't break the response.
    try {
      await RouteSearch.create({
        userId: userId || undefined,
        profile,
        origin,
        destination,
        distanceMeters: best.distanceMeters,
        durationSeconds: best.durationSeconds,
        safetyScore: best.safetyScore,
      });
    } catch (logErr) {
      console.log("RouteSearch logging failed:", logErr.message);
    }

    res.json({ routes: scored, services });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to compute safe route" });
    console.log(err)
  }
};

// GET /api/saferoute/history/:userId
const getHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await RouteSearch.find({ userId }).sort({ createdAt: -1 }).limit(20);
    res.json({ history });
  } catch (err) {
    res.status(500).json({ message: "Failed to load route history", error: err.message });
    console.log(err)
  }
};

module.exports = { searchPlaces, getSafeRoute, getHistory };
