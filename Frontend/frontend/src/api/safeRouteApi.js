import api from "./axios";
import { distanceMeters } from "../utils/geo";

export async function searchPlaces(query) {
  if (!query || query.trim().length < 3) return [];

  const { data } = await api.get("/api/saferoute/search", {
    params: { q: query },
  });

  return data.results || [];
}

export async function fetchSafeRoute(origin, destination, profile = "driving") {
  const { data } = await api.post("/api/saferoute/route", {
    origin,
    destination,
    profile,
  });

  return data;
}

export function sortByDistance(origin, services) {
  return services
    .map((service) => ({
      ...service,
      distance: distanceMeters([origin.lat, origin.lng], [service.lat, service.lng]),
    }))
    .sort((a, b) => a.distance - b.distance);
}