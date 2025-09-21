// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  prn: { type: String, required: true, unique: true },
  srn: { type: String, required: true, unique: true },
  program: String,
  branch: String,
  semester: String,
  section: String,
  email: { type: String, required: true, unique: true },
  phone: String,
  campus: String,
});

module.exports = mongoose.model("User", userSchema);
