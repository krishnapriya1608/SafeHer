import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import MovingMarker from "./MovingMarker";
import "leaflet/dist/leaflet.css";

function AutoFollow({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, map.getZoom(), { duration: 1 });
  }, [position, map]);
  return null;
}

export default function LiveMap({ position, zoom = 16, height = "420px" }) {
  if (!position) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-sm text-slate-400"
      >
        Waiting for live location...
      </div>
    );
  }

  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-slate-800">
      <MapContainer center={position} zoom={zoom} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <MovingMarker position={position} />
        <AutoFollow position={position} />
      </MapContainer>
    </div>
  );
}