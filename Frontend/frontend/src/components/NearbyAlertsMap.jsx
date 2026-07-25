import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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

const alertIcon = pinIcon("#dc2626", "🚨");
const selfIcon = pinIcon("#2563eb", "📍");

function FitToMarkers({ points }) {
  const map = useMap();
  useMemo(() => {
    if (points.length) map.fitBounds(points, { padding: [40, 40] });
  }, [points]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function NearbyAlertsMap({ self, alerts = [], height = 380 }) {
  const points = [
    ...(self ? [[self.lat, self.lng]] : []),
    ...alerts.map((a) => [a.latitude, a.longitude]),
  ];

  const center = self ? [self.lat, self.lng] : points[0] || [20.5937, 78.9629];

  return (
    <div style={{ height }} className="overflow-hidden rounded-xl">
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {self && (
          <Marker position={[self.lat, self.lng]} icon={selfIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {alerts.map((a) => (
          <Marker key={a._id} position={[a.latitude, a.longitude]} icon={alertIcon}>
            <Popup>
              <strong>{a.username}</strong>
              <br />
              {a.message}
            </Popup>
          </Marker>
        ))}

        {points.length > 0 && <FitToMarkers points={points} />}
      </MapContainer>
    </div>
  );
}
