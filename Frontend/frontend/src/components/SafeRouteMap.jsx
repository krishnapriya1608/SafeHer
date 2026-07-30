import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function pinIcon(bg, glyph) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:26px;height:26px;border-radius:50% 50% 50% 0;
        background:${bg};transform:rotate(-45deg);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 2px 6px rgba(0,0,0,0.4);border:2px solid white;
      ">
        <span style="transform:rotate(45deg);font-size:12px;line-height:1;">${glyph}</span>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -26],
  });
}

const policeIcon = pinIcon("#2563eb", "🛡️");
const hospitalIcon = pinIcon("#dc2626", "➕");
const startIcon = pinIcon("#16a34a", "A");
const endIcon = pinIcon("#7c3aed", "B");

// Fits the map view to whatever route is currently selected.
function FitToRoute({ path }) {
  const map = useMap();
  useMemo(() => {
    if (path?.length) {
      map.fitBounds(path, { padding: [40, 40] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);
  return null;
}

export default function SafeRouteMap({
  origin,
  destination,
  routes = [],
  selectedIndex = 0,
  services = [],
  height = 480,
}) {
  const center = origin ? [origin.lat, origin.lng] : [20.5937, 78.9629];

  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-zinc-800">
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routes.map((route, i) => (
          <Polyline
            key={i}
            positions={route.path}
            pathOptions={
              i === selectedIndex
                ? { color: "#22c55e", weight: 6, opacity: 0.9 }
                : { color: "#64748b", weight: 4, opacity: 0.5, dashArray: "6 8" }
            }
          />
        ))}

        {origin && (
          <Marker position={[origin.lat, origin.lng]} icon={startIcon}>
            <Popup>Start</Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={endIcon}>
            <Popup>{destination.label || "Destination"}</Popup>
          </Marker>
        )}

        {services.map((s) => (
          <Marker
            key={s.id}
            position={[s.lat, s.lng]}
            icon={s.type === "police" ? policeIcon : hospitalIcon}
          >
            <Popup>
              <strong>{s.name}</strong>
              <br />
              {s.type === "police" ? "Police Station" : "Hospital"}
            </Popup>
          </Marker>
        ))}

        {routes[selectedIndex] && <FitToRoute path={routes[selectedIndex].path} />}
      </MapContainer>
    </div>
  );
}
