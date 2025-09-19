// models/Booking.js
import mongoose from "mongoose";
const BookingSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pickupPoint: { lat: Number, lng: Number },    // nearest point on trip route
  pickupDistMeters: Number,                     // distance from rider origin to pickupPoint
  originR: { lat: Number, lng: Number },        // rider origin
  destinationR: { lat: Number, lng: Number },   // rider destination
  status: { type: String, enum: ["pending","confirmed","cancelled"], default: "pending" }
}, { timestamps: true });
export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);