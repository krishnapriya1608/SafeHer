import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const liveIcon = L.divIcon({
  className: "",
  html: `<span class="live-marker-pulse"></span><span class="live-marker-dot"></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// Smoothly tweens a Leaflet marker from its last position to the new one,
// instead of teleporting on every GPS update.
export default function MovingMarker({ position, duration = 1000 }) {
  const map = useMap();
  const markerRef = useRef(null);
  const currentPos = useRef(position);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!markerRef.current) {
      markerRef.current = L.marker(position, { icon: liveIcon }).addTo(map);
      currentPos.current = position;
      return;
    }

    const marker = markerRef.current;
    const start = currentPos.current;
    const end = position;
    const startTime = performance.now();

    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const lat = start[0] + (end[0] - start[0]) * t;
      const lng = start[1] + (end[1] - start[1]) * t;
      marker.setLatLng([lat, lng]);

      if (t < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        currentPos.current = end;
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => frameRef.current && cancelAnimationFrame(frameRef.current);
  }, [position, duration, map]);

  useEffect(() => {
    return () => markerRef.current && map.removeLayer(markerRef.current);
  }, [map]);

  return null;
}