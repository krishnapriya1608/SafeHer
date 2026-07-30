import { boundingBox, distanceMeters, minDistanceToPath, sampleRoute } from "../utils/geo";


const OSRM_BASE = "https://router.project-osrm.org/route/v1";
const OVERPASS_BASE = "https://overpass-api.de/api/interpreter";
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

// Search an address/place name -> candidate [{ label, lat, lng }]
export async function searchPlaces(query) {
  if (!query || query.trim().length < 3) return [];

  const url = `${NOMINATIM_BASE}/search?format=json&limit=5&q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Address search failed");

  const data = await res.json();
  return data.map((item) => ({
    label: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));
}

// Fetch route alternatives between two points. profile: "driving" | "foot" | "bike"
// Returns [{ path: [lat,lng][], distanceMeters, durationSeconds }]
export async function fetchRoutes(from, to, profile = "driving") {
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url = `${OSRM_BASE}/${profile}/${coords}?overview=full&geometries=geojson&alternatives=true&steps=false`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Route lookup failed");

  const data = await res.json();
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

// Fetch police stations + hospitals inside a bounding box built from the
// given [lat,lng] points (e.g. every route's coordinates combined).
export async function fetchEmergencyServices(points) {
  const { south, west, north, east } = boundingBox(points, 0.015);
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

  const res = await fetch(OVERPASS_BASE, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: query,
  });
  if (!res.ok) throw new Error("Emergency service lookup failed");

  const data = await res.json();

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
}

// Score each route by how many distinct emergency services sit within
// `bufferMeters` of the path (sampled, not every coordinate — routes can
// have thousands of points). Higher score = more police/hospitals nearby
// along the way, which we treat as the "safer" route.
export function scoreRoutes(routes, services, bufferMeters = 400) {
  return routes.map((route) => {
    const sampled = sampleRoute(route.path, 25);
    const nearby = services.filter(
      (s) => minDistanceToPath([s.lat, s.lng], sampled) <= bufferMeters
    );
    return { ...route, safetyScore: nearby.length, nearbyServices: nearby };
  });
}

// Sorts services by distance from a reference point, nearest first.
export function sortByDistance(origin, services) {
  return services
    .map((s) => ({ ...s, distance: distanceMeters(origin, [s.lat, s.lng]) }))
    .sort((a, b) => a.distance - b.distance);
}
