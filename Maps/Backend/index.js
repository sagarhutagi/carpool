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
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => console.log("✅ MongoDB connected"));
mongoose.connection.on("error", (err) => console.error("MongoDB error:", err));

// --- HTTP + Socket.IO ---
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- Express routes ---
// Create trip
app.post("/api/trips", async (req, res) => {
  try {
    const { driverId, origin, destination } = req.body;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${apiKey}`;
    const r = await fetch(url);
    const data = await r.json();
    if (!data.routes?.length) return res.status(400).json({ error: "No route" });

    const encodedPolyline = data.routes[0].overview_polyline.points;

    const trip = await Trip.create({
      driverId,
      origin,
      destination,
      encodedPolyline,
    });

    res.json(trip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "create trip failed" });
  }
});

// Rider search + booking
app.post("/api/search", async (req, res) => {
  try {
    const { riderId, originR, destinationR, thresholdMeters = 400 } = req.body;
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

    res.json({ match: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "search failed" });
  }
});

// Walking route
app.post("/api/walking-route", async (req, res) => {
  try {
    const { origin, destination } = req.body;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=walking&key=${apiKey}`;
    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error(err);
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
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// --- Start server ---
const PORT = process.env.BACKEND_PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
