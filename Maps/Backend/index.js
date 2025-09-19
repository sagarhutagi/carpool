import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fetch from "node-fetch";
import polyline from "@mapbox/polyline";

import Trip from "./models/Trip.js";
import Booking from "./models/Booking.js";
import User from "./models/User.js";
import { findNearestPointOnPolyline } from "./utils/geo.js";

dotenv.config();

const app = express();
app.use(express.json());

// --- MongoDB ---
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// --- HTTP + Socket.IO ---
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- Health check route (for Postman sanity check) ---
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Carpool backend running 🚀" });
});

// --- User routes ---
// Create user
app.post("/api/users", async (req, res) => {
  try {
    const { name, email, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const user = await User.create({ name, email, role });
    res.status(201).json(user);
  } catch (err) {
    console.error("❌ Create user error:", err);
    res.status(500).json({ error: "create user failed" });
  }
});

// Get all users (for testing)
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error("❌ Get users error:", err);
    res.status(500).json({ error: "get users failed" });
  }
});

// --- Express routes ---
// Create trip
app.post("/api/trips", async (req, res) => {
  try {
    const { driverId, origin, destination } = req.body;
    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      return res.status(400).json({ error: "Invalid origin/destination" });
    }

    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=polyline`;
    console.log("👉 OSRM URL:", url);

    const r = await fetch(url);
    const data = await r.json();
    console.log("👉 OSRM Response:", data);

    if (!data.routes?.length) {
      return res.status(400).json({ error: "No route found", details: data });
    }

    const encodedPolyline = data.routes[0].geometry;

    const trip = await Trip.create({
      driverId,
      origin,
      destination,
      encodedPolyline,
      status: "open",
    });

    res.status(201).json(trip);
  } catch (err) {
    console.error("❌ Create trip error details:", err);
    res.status(500).json({ error: "create trip failed", details: err.message });
  }
});


// Rider search + booking
app.post("/api/search", async (req, res) => {
  try {
    const { riderId, originR, destinationR, thresholdMeters = 400 } = req.body;
    if (!originR?.lat || !originR?.lng) {
      return res.status(400).json({ error: "Invalid rider origin" });
    }

    const trips = await Trip.find({ status: "open" });

    for (const trip of trips) {
      const { nearestPoint, distanceMeters } = findNearestPointOnPolyline(
        trip.encodedPolyline,
        [originR.lat, originR.lng]
      );

      if (distanceMeters <= thresholdMeters) {
        const booking = await Booking.create({
          tripId: trip._id,
          riderId,
          pickupPoint: { lat: nearestPoint[0], lng: nearestPoint[1] },
          pickupDistMeters: distanceMeters,
          originR,
          destinationR,
          status: "pending",
        });
        return res.json({ match: true, booking, trip });
      }
    }

    res.json({ match: false, message: "No rides found nearby" });
  } catch (err) {
    console.error("❌ Rider search error:", err);
    res.status(500).json({ error: "search failed" });
  }
});

// Walking route
app.post("/api/walking-route", async (req, res) => {
  try {
    const { origin, destination } = req.body;
    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      return res.status(400).json({ error: "Invalid walking route request" });
    }

    // OSRM walking route
    const url = `https://router.project-osrm.org/route/v1/walking/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=polyline`;

    const r = await fetch(url);
    const data = await r.json();

    if (!data.routes?.length) {
      return res.status(400).json({ error: "No walking route found" });
    }

    res.json({
      status: "ok",
      walkingPolyline: data.routes[0].geometry,
      distance: data.routes[0].distance,
      duration: data.routes[0].duration,
    });
  } catch (err) {
    console.error("❌ Walking route error:", err);
    res.status(500).json({ error: "walking route failed" });
  }
});

// --- Socket.IO events ---
io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  socket.on("join-trip", ({ tripId, userId, role }) => {
    socket.join(`trip_${tripId}`);
    socket.data = { tripId, userId, role };
    console.log(`${userId} joined trip_${tripId} as ${role}`);
  });

  socket.on("driver-location", ({ tripId, lat, lng, heading, speed }) => {
    io.to(`trip_${tripId}`).emit("driver-location", {
      lat,
      lng,
      heading,
      speed,
      tripId,
      ts: Date.now(),
    });
  });

  socket.on("leave-trip", ({ tripId }) => {
    socket.leave(`trip_${tripId}`);
    console.log(`User left trip_${tripId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// --- Start server ---
const PORT = process.env.BACKEND_PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
