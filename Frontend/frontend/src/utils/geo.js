// Haversine distance between two [lat, lng] points, in meters.
export function distanceMeters([lat1, lon1], [lat2, lon2]) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Smallest distance from a point to any point in a list (used to check how
// close a service/POI is to a sampled route path).
export function minDistanceToPath(point, path) {
  let min = Infinity;
  for (const p of path) {
    const d = distanceMeters(point, p);
    if (d < min) min = d;
  }
  return min;
}

// Evenly samples `count` points along a [lat, lng][] path, so we don't have
// to run distance checks against every single coordinate in a dense route.
export function sampleRoute(path, count = 20) {
  if (path.length <= count) return path;
  const step = (path.length - 1) / (count - 1);
  const sampled = [];
  for (let i = 0; i < count; i++) {
    sampled.push(path[Math.round(i * step)]);
  }
  return sampled;
}

// Bounding box [south, west, north, east] around a set of [lat, lng] points,
// padded outward by `paddingDeg` (roughly 0.01deg ~= 1.1km).
export function boundingBox(points, paddingDeg = 0.01) {
  const lats = points.map((p) => p[0]);
  const lons = points.map((p) => p[1]);

  return {
    south: Math.min(...lats) - paddingDeg,
    west: Math.min(...lons) - paddingDeg,
    north: Math.max(...lats) + paddingDeg,
    east: Math.max(...lons) + paddingDeg,
  };
}

// Sorts services by distance from a reference [lat,lng]-shaped { lat, lng }
// point, nearest first. Purely a display concern, so it stays client-side.
export function sortByDistance(origin, services) {
  return services
    .map((s) => ({ ...s, distance: distanceMeters([origin.lat, origin.lng], [s.lat, s.lng]) }))
    .sort((a, b) => a.distance - b.distance);
}
