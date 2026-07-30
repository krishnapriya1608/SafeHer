import { createContext, useContext, useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import { useAuth } from "./AuthContext";

const EmergencyTrackingContext = createContext(null);
const STORAGE_KEY = "activeEmergencyId";

export function EmergencyTrackingProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [emergencyId, setEmergencyId] = useState(() => localStorage.getItem(STORAGE_KEY));
  const watchId = useRef(null);

  const stopTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (emergencyId) socket.emit("leave-emergency-room", emergencyId);
    localStorage.removeItem(STORAGE_KEY);
    setEmergencyId(null);
  };

  const startTracking = (id) => {
    localStorage.setItem(STORAGE_KEY, id);
    setEmergencyId(id);
  };

  useEffect(() => {
    if (!isAuthenticated || !emergencyId || !("geolocation" in navigator)) return;

    socket.emit("join-emergency-room", emergencyId);
    watchId.current = navigator.geolocation.watchPosition(
      ({ coords }) => socket.emit("send-location-update", {
        emergencyId, latitude: coords.latitude, longitude: coords.longitude,
      }),
      (error) => console.warn("Live tracking GPS error:", error.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    const onResolved = ({ emergency }) => {
      if (emergency?._id === emergencyId) stopTracking();
    };
    socket.on("emergency-resolved", onResolved);

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
      socket.emit("leave-emergency-room", emergencyId);
      socket.off("emergency-resolved", onResolved);
    };
  }, [emergencyId, isAuthenticated]);

  return (
    <EmergencyTrackingContext.Provider value={{ emergencyId, startTracking, stopTracking }}>
      {children}
    </EmergencyTrackingContext.Provider>
  );
}

export function useEmergencyTracking() {
  const context = useContext(EmergencyTrackingContext);
  if (!context) throw new Error("useEmergencyTracking must be used inside EmergencyTrackingProvider");
  return context;
}
