import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
  name: String,
  role: { type: String, enum: ["driver","rider"], required: true },
  // add auth fields as needed (email, password, OAuth id)
}, { timestamps: true });
export default mongoose.models.User || mongoose.model("User", UserSchema);
