import React, { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import polyline from "@mapbox/polyline";

// NOTE: This is a single-file React app meant as a blueprint you can drop into
// a create-react-app / Vite project. It uses Tailwind classes for quick responsive styling.
// It uses Leaflet (react-leaflet) for map display (OpenStreetMap tiles) so you don't need
// Google billing. Make sure to install these deps:
// npm i socket.io-client @mapbox/polyline react-leaflet leaflet

// Environment / runtime config
const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:8080";
const SOCKET_URL = BACKEND;

// Utility: decode OSRM/Google polylines to LatLng array
function decodePolyline(encoded) {
  try {
    return polyline.decode(encoded).map(([lat, lng]) => ({ lat, lng }));
  } catch (e) {
    console.warn("polyline decode failed", e);
    return [];
  }
}

// Throttle helper (send at most once per interval)
function useThrottledCallback(fn, delay = 2500) {
  const last = useRef(0);
  return useCallback((...args) => {
    const now = Date.now();
    if (now - last.current > delay) {
      last.current = now;
      fn(...args);
    }
  }, [fn, delay]);
}

// Map components use react-leaflet. To keep this file focused we don't import map components
// inline (they will be used in the example JSX). Ensure CSS for leaflet is included in your app.

export default function CarpoolApp() {
  const [user, setUser] = useState(null); // { _id, name, role }
  const [isDriver, setIsDriver] = useState(false);
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [socket, setSocket] = useState(null);

  // Live locations
  const [myLocation, setMyLocation] = useState(null); // {lat,lng}
  const [driverLive, setDriverLive] = useState(null);

  // For rider: search results
  const [searchMatches, setSearchMatches] = useState([]);
  const [searchNonMatches, setSearchNonMatches] = useState([]);

  // Polylines
  const [tripPolyline, setTripPolyline] = useState([]);
  const [walkingPolyline, setWalkingPolyline] = useState([]);

  // Booking state
  const [booking, setBooking] = useState(null);

  // Init socket on user sign-in
  useEffect(() => {
    if (!user) return;
    const s = io(SOCKET_URL, { transports: ["websocket"] });
    setSocket(s);
    return () => s.disconnect();
  }, [user]);

  // When a trip is active (driver or rider joined), join trip room
  useEffect(() => {
    if (!socket || !activeTrip || !user) return;
    socket.emit("join-trip", { tripId: activeTrip._id, userId: user._id, role: user.role });

    socket.on("driver-location", (data) => {
      // update driver live marker
      setDriverLive({ lat: data.lat, lng: data.lng, heading: data.heading, ts: data.ts });
    });

    return () => {
      socket.off("driver-location");
      socket.emit("leave-trip", { tripId: activeTrip._id });
    };
  }, [socket, activeTrip, user]);

  // Watch own geolocation (throttled send to backend / socket)
  useEffect(() => {
    if (!user) return;
    if (!("geolocation" in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMyLocation(loc);
      },
      (err) => console.error("geolocation error", err),
      { enableHighAccuracy: true, maximumAge: 1000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [user]);

  // Driver sends live location via socket (throttled)
  const sendDriverLocation = useThrottledCallback((loc) => {
    if (!socket || !activeTrip || !user || user.role !== "driver") return;
    socket.emit("driver-location", { tripId: activeTrip._id, lat: loc.lat, lng: loc.lng });
  }, 2000);

  useEffect(() => {
    if (user?.role === "driver" && myLocation) sendDriverLocation(myLocation);
  }, [myLocation, user, sendDriverLocation]);

  // ----------------- API helpers ---------------------------------
  async function createUser(name, role) {
    const res = await fetch(`${BACKEND}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, role }),
    });
    return res.json();
  }

  async function createTrip(driverId, origin, destination) {
    const res = await fetch(`${BACKEND}/api/trips`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driverId, origin, destination }),
    });
    return res.json();
  }

  async function searchTrips(riderId, originR, destinationR) {
    const res = await fetch(`${BACKEND}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ riderId, originR, destinationR }),
    });
    return res.json();
  }

  async function getWalkingRoute(origin, destination) {
    const res = await fetch(`${BACKEND}/api/walking-route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin, destination }),
    });
    return res.json();
  }

  // ----------------- UI actions ----------------------------------
  // Quick sign in / create user
  const handleCreateUser = async (name, role) => {
    const u = await createUser(name, role);
    setUser(u);
  };

  // Driver starts a trip
  const handleStartTrip = async (origin, destination) => {
    if (!user) return alert("Sign in first");
    const trip = await createTrip(user._id, origin, destination);
    setActiveTrip(trip);
    setTripPolyline(decodePolyline(trip.encodedPolyline || trip.encodedPolyline || ""));
    // driver will join trip via socket useEffect
  };

  // Rider searches
  const handleSearch = async (originR, destinationR) => {
    if (!user) return alert("Sign in first");
    const data = await searchTrips(user._id, originR, destinationR);
    if (data.match) {
      setSearchMatches(data.matches || []);
      setSearchNonMatches(data.nonMatches || []);
      // pick first match for demo
      const first = data.matches[0];
      setBooking(first.booking);
      setActiveTrip(first.trip);
      setTripPolyline(decodePolyline(first.trip.encodedPolyline));

      // also request walking path from rider origin -> pickupPoint
      const walk = await getWalkingRoute(originR, { lat: first.booking.pickupPoint.lat, lng: first.booking.pickupPoint.lng });
      if (walk?.walkingPolyline) {
        setWalkingPolyline(decodePolyline(walk.walkingPolyline));
      }
    } else {
      setSearchMatches([]);
      setSearchNonMatches(data.nonMatches || []);
      alert("No rides found nearby");
    }
  };

  // Rider accepts booking -> we'll notify backend later; for now keep both in same route
  const handleAcceptBooking = async () => {
    if (!booking) return;
    // optional: call backend to confirm booking status
    // For frontend: set both parties activeTrip and ensure they render same polyline
    setActiveTrip(booking.trip || activeTrip);
    alert("Booking accepted — both parties will see same route and live location");
  };

  const handleRejectBooking = async () => {
    setBooking(null);
    setActiveTrip(null);
    setTripPolyline([]);
    setWalkingPolyline([]);
  };

  // ----------------- Small demo UI -------------------------------
  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Carpool — Demo Frontend</h1>
          <div>
            {user ? (
              <div className="text-sm text-slate-700">Signed in as <strong>{user.name}</strong> ({user.role})</div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => handleCreateUser("Ravi Driver", "driver")} className="btn">Create Driver</button>
                <button onClick={() => handleCreateUser("Arjun Rider", "rider")} className="btn">Create Rider</button>
              </div>
            )}
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <section className="md:col-span-1 p-4 bg-white rounded shadow">
            <h2 className="font-medium mb-2">Actions</h2>

            {user?.role === "driver" && (
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Driver controls</p>
                <button className="w-full btn" onClick={async () => {
                  // example start trip: MG Road -> Koramangala
                  await handleStartTrip({ lat: 12.9716, lng: 77.5946 }, { lat: 12.9352, lng: 77.6245 });
                }}>Start Trip (example)</button>
                <div className="mt-2 text-xs text-slate-600">Driver live loc: {myLocation ? `${myLocation.lat.toFixed(4)}, ${myLocation.lng.toFixed(4)}` : '—'}</div>
              </div>
            )}

            {user?.role === "rider" && (
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Rider controls</p>
                <button className="w-full btn" onClick={async () => {
                  // example search: rider near MG Road
                  await handleSearch({ lat: 12.9720, lng: 77.5952 }, { lat: 12.9352, lng: 77.6245 });
                }}>Search Nearby Trips (example)</button>
                <div className="mt-2 text-xs text-slate-600">Your live loc: {myLocation ? `${myLocation.lat.toFixed(4)}, ${myLocation.lng.toFixed(4)}` : '—'}</div>
              </div>
            )}

            <div className="mt-4">
              <h3 className="text-sm font-medium">Active Trip</h3>
              {activeTrip ? (
                <div className="text-xs text-slate-600 mt-1">
                  Trip: <strong>{activeTrip._id}</strong><br />Driver: <strong>{activeTrip.driverId}</strong>
                </div>
              ) : (
                <div className="text-xs text-slate-500">No active trip</div>
              )}
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium">Live Driver</h3>
              <div className="text-sm">Driver marker: {driverLive ? `${driverLive.lat.toFixed(4)}, ${driverLive.lng.toFixed(4)}` : '—'}</div>
            </div>
          </section>

          <section className="md:col-span-2 p-4 bg-white rounded shadow">
            <h2 className="font-medium mb-2">Map & Booking</h2>

            <div className="h-96 border rounded overflow-hidden">
              {/*
                Map placeholder: replace with react-leaflet MapContainer, TileLayer, Polyline, Marker
                Example (not included here for brevity):
                <MapContainer center={[12.9716,77.5946]} zoom={13} style={{height: '100%'}}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Polyline positions={tripPolyline.map(p=>[p.lat,p.lng])} />
                  <Polyline positions={walkingPolyline.map(p=>[p.lat,p.lng])} pathOptions={{dashArray:'4'}} />
                  <Marker position={[driverLive.lat, driverLive.lng]} />
                </MapContainer>
              */}

              <div className="w-full h-full flex items-center justify-center text-slate-400">Map preview — integrate react-leaflet here to render polylines & markers.</div>
            </div>

            <div className="mt-4">
              <h3 className="font-medium">Booking</h3>
              {booking ? (
                <div className="p-3 border rounded">
                  <div className="text-sm">Pickup point: {booking.pickupPoint.lat.toFixed(4)}, {booking.pickupPoint.lng.toFixed(4)}</div>
                  <div className="text-sm mt-1">Distance to pickup: {booking.pickupDistMeters} m</div>
                  <div className="mt-2 flex gap-2">
                    <button className="btn" onClick={handleAcceptBooking}>Accept</button>
                    <button className="btn-outline" onClick={handleRejectBooking}>Reject</button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500">No booking</div>
              )}
            </div>

            <div className="mt-4">
              <h3 className="font-medium">Matches / Nearby</h3>
              <div className="text-xs text-slate-600">
                Matches: {searchMatches.length} — NonMatches: {searchNonMatches.length}
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-6 text-xs text-slate-500">Notes: This UI is a blueprint — plug react-leaflet for the map, and style buttons as you like.</footer>
      </div>
    </div>
  );
}
