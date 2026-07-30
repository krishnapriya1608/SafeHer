import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet's default marker icons, which break under bundlers like Vite
// because the image URLs are resolved relative to the built JS file.
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const pulsingIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:22px;height:22px;">
      <div style="position:absolute;inset:0;border-radius:9999px;background:rgba(239,68,68,0.35);animation:sh-pulse 1.6s ease-out infinite;"></div>
      <div style="position:absolute;left:5px;top:5px;width:12px;height:12px;border-radius:9999px;background:#ef4444;border:2px solid white;box-shadow:0 0 6px rgba(239,68,68,0.8);"></div>
    </div>
    <style>
      @keyframes sh-pulse {
        0% { transform: scale(0.6); opacity: 0.9; }
        100% { transform: scale(2.4); opacity: 0; }
      }
    </style>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// Smoothly animates a Leaflet marker between successive [lat, lng]
// positions instead of snapping, so the dot glides along the route.
function AnimatedMarker({ position, label }) {
  const map = useMap();
  const markerRef = useRef(null);
  const currentPos = useRef(position);
  const animFrame = useRef(null);

  useEffect(() => {
    if (!markerRef.current) return;

    const marker = markerRef.current;
    const start = currentPos.current;
    const end = position;
    const duration = 900; // ms
    const startTime = performance.now();

    if (animFrame.current) cancelAnimationFrame(animFrame.current);

    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const lat = start[0] + (end[0] - start[0]) * t;
      const lng = start[1] + (end[1] - start[1]) * t;
      marker.setLatLng([lat, lng]);

      if (t < 1) {
        animFrame.current = requestAnimationFrame(step);
      } else {
        currentPos.current = end;
      }
    }

    animFrame.current = requestAnimationFrame(step);

    // Keep the marker centered as it moves.
    map.panTo(end, { animate: true, duration: 0.9 });

    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  return (
    <Marker ref={markerRef} position={currentPos.current} icon={pulsingIcon}>
      <Popup>{label || "Live location"}</Popup>
    </Marker>
  );
}

export default function LiveTrackingMap({
  latitude,
  longitude,
  label = "Live location",
  trail = [],
  height = 420,
}) {
  const position = useMemo(() => [latitude, longitude], [latitude, longitude]);

  if (latitude == null || longitude == null) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/60 text-sm text-slate-500"
      >
        Waiting for live GPS signal…
      </div>
    );
  }

  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-slate-800">
      <MapContainer center={position} zoom={16} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AnimatedMarker position={position} label={label} />
      </MapContainer>
    </div>
  );
}
