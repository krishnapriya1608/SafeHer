import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { socket } from "../socket";
import LiveMap from "../components/LiveMap";

export default function LiveTracking() {
  const { emergencyId } = useParams();
  const [position, setPosition] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (!emergencyId) return;

    socket.emit("join-tracking-room", emergencyId);

    const handleLocation = (data) => {
      if (data.emergencyId !== emergencyId) return;
      setPosition([data.latitude, data.longitude]);
      setLastUpdate(new Date(data.timestamp));
    };

    socket.on("receive-location", handleLocation);

    return () => {
      socket.off("receive-location", handleLocation);
      socket.emit("leave-tracking-room", emergencyId);
    };
  }, [emergencyId]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-red-400">Phase 5</p>
            <h1 className="mt-1 text-2xl font-bold">Live Location Tracking</h1>
          </div>
          <Link to=".." relative="path" className="text-sm text-slate-400 hover:text-white">
            &larr; Back
          </Link>
        </div>

        <LiveMap position={position} />

        {lastUpdate && (
          <p className="text-sm text-slate-400">
            Last update: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </div>
    </main>
  );
}