// models/Trip.js
import mongoose from "mongoose";
const TripSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  origin: { lat: Number, lng: Number },
  destination: { lat: Number, lng: Number },
  encodedPolyline: { type: String, required: true },
  status: { type: String, enum: ["open","closed","in_progress"], default: "open" },
  // optional metadata: seats, time, price
}, { timestamps: true });
export default mongoose.models.Trip || mongoose.model("Trip", TripSchema);
