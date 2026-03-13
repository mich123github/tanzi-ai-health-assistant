import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import facilitiesData from "../data/facilities.json";
import { MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/solid";
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function LocationMarker({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 13);
  }, [map, position]);
  return null;
}
export default function FacilityLocator() {
  const [userPos, setUserPos] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [useAI, setUseAI] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => setError("Could not get your location. Please allow location access."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);
  function interpretQuery(q) {
    const s = q.toLowerCase();
    const wants = { type: null, text: q, openNow: false };
    if (s.includes("hospital")) wants.type = "Hospital";
    if (s.includes("clinic")) wants.type = "Clinic";
    if (s.includes("pharmacy")) wants.type = "Pharmacy";
    if (s.includes("open now") || s.includes("open")) wants.openNow = true;
    return wants;
  }
  const facilities = useMemo(() => facilitiesData, []);
  const enriched = useMemo(() => {
    return facilities.map((f) => {
      const dist =
        userPos != null
          ? haversineDistance(userPos[0], userPos[1], f.lat, f.lng)
          : Number.POSITIVE_INFINITY;
      return { ...f, distanceKm: dist, distanceText: isFinite(dist) ? `${dist.toFixed(2)} km` : "?" };
    });
  }, [facilities, userPos]);
  const filtered = useMemo(() => {
    let list = enriched.slice();
    let ai = null;
    if (useAI && query.trim()) {
      ai = interpretQuery(query);
      if (ai.type) list = list.filter((f) => f.type === ai.type);
      if (ai.openNow) {
        list = list.filter((f) => f.hours && (f.hours.includes("24") || f.hours.toLowerCase().includes("open")));
      }
      if (ai.text) {
        const ql = ai.text.toLowerCase();
        list = list.filter(
          (f) =>
            f.name.toLowerCase().includes(ql) ||
            f.address?.toLowerCase().includes(ql) ||
            f.type.toLowerCase().includes(ql)
        );
      }
    } else {
      if (query.trim()) {
        const ql = query.toLowerCase();
        list = list.filter(
          (f) =>
            f.name.toLowerCase().includes(ql) ||
            f.address?.toLowerCase().includes(ql) ||
            f.type.toLowerCase().includes(ql)
        );
      }
      if (filterType !== "all") {
        list = list.filter((f) => f.type.toLowerCase() === filterType.toLowerCase());
      }
    }
    list.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
    return list;
  }, [enriched, query, filterType, useAI]);
  function openDirections(f) {
    if (!userPos) return alert("Please allow location access to get directions.");
    const origin = `${userPos[0]},${userPos[1]}`;
    const dest = `${f.lat},${f.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(dest)}&travelmode=driving`;
    window.open(url, "_blank");
  }
  return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
    {/* SEARCH BAR */}
    <div className="sticky top-16 z-20 w-full md:w-3/4 mx-auto px-2">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-2 md:p-3 shadow-lg flex flex-wrap md:flex-nowrap gap-2 items-center">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search (e.g. 'pharmacy near me')"
          className="flex-1 bg-transparent outline-none text-xs sm:text-sm"
        />
        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs sm:text-sm bg-transparent outline-none"
          >
            <option value="all">All</option>
            <option value="Hospital">Hospital</option>
            <option value="Clinic">Clinic</option>
            <option value="Pharmacy">Pharmacy</option>
          </select>
          <label className="flex items-center gap-1 text-xs sm:text-sm">
            <input
              type="checkbox"
              checked={useAI}
              onChange={() => setUseAI((s) => !s)}
            />
            AI
          </label>
        </div>
      </div>
    </div>

    {/* MAP */}
    <div className="relative h-[40vh] sm:h-[50vh] md:h-[70vh] mt-20 z-0">
      <MapContainer
        center={userPos || [-13.9626, 33.7905]}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userPos && <LocationMarker position={userPos} />}
        {userPos && (
          <CircleMarker
            center={userPos}
            radius={8}
            pathOptions={{ color: "#06b6d4", fillColor: "#06b6d4" }}
          >
            <Popup>You are here</Popup>
          </CircleMarker>
        )}
        {filtered.map((f) => (
          <CircleMarker
            key={f.id}
            center={[f.lat, f.lng]}
            radius={7}
            pathOptions={{
              color:
                f.type === "Hospital"
                  ? "#ef4444"
                  : f.type === "Pharmacy"
                  ? "#f59e0b"
                  : "#10b981",
              fillColor:
                f.type === "Hospital"
                  ? "#ef4444"
                  : f.type === "Pharmacy"
                  ? "#f59e0b"
                  : "#10b981",
            }}
            eventHandlers={{
              click: () => setSelectedId(f.id),
            }}
          >
            <Popup>
              <div className="min-w-[150px]">
                <strong>{f.name}</strong>
                <div className="text-xs">{f.type} • {f.distanceText}</div>
                <div className="mt-1 text-xs">{f.address}</div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => openDirections(f)}
                    className="px-2 py-1 text-xs sm:text-sm bg-teal-600 text-white rounded"
                  >
                    Directions
                  </button>
                  <a
                    href={`tel:${f.phone}`}
                    className="px-2 py-1 text-xs sm:text-sm border rounded"
                  >
                    Call
                  </a>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>

    {/* RESULTS LIST */}
    <div className="max-w-4xl mx-auto px-2 sm:px-4 mt-6">
      <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-lg border dark:border-gray-700 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-semibold">Nearby facilities</h3>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {userPos
                ? `${filtered.length} results — sorted by distance`
                : "Allow location to sort by distance"}
            </div>
          </div>
          <button
            onClick={() =>
              userPos && window.scrollTo({ top: 0, behavior: "smooth" })
            }
            className="px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded"
          >
            Recenter
          </button>
        </div>
        <div className="space-y-3 max-h-[40vh] sm:max-h-[48vh] overflow-auto pr-2">
          {filtered.map((f) => (
            <article
              key={f.id}
              className={`p-2 sm:p-3 rounded-lg border ${
                selectedId === f.id
                  ? "border-teal-600 bg-teal-50 dark:bg-teal-900/20"
                  : "border-gray-200 dark:border-gray-700"
              } flex flex-col sm:flex-row justify-between items-start gap-3`}
            >
              <div className="flex gap-3 items-start">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white"
                  style={{
                    background:
                      f.type === "Hospital"
                        ? "#ef4444"
                        : f.type === "Pharmacy"
                        ? "#f59e0b"
                        : "#10b981",
                  }}
                >
                  <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm sm:text-base">{f.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-300">
                    {f.type} • {f.address}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                    Distance: {f.distanceText}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Hours: {f.hours || "N/A"}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-xs">{f.phone}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openDirections(f)}
                    className="px-2 py-1 text-xs sm:text-sm rounded bg-teal-600 text-white"
                  >
                    Directions
                  </button>
                  <a
                    href={`tel:${f.phone}`}
                    className="px-2 py-1 text-xs sm:text-sm border rounded"
                  >
                    Call
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>

    {error && (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-3 sm:px-4 py-2 rounded shadow text-xs sm:text-sm">
        {error}
      </div>
    )}
  </div>
);
}