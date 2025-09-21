// server.js
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = 3000;
// This connection string works for a locally installed MongoDB.
const MONGO_URI = "mongodb://localhost:27017/pesuAuthDB";

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "your-very-secret-key-change-it", // Change this to a random string
    resave: false,
    saveUninitialized: true,
  })
);

// Database Connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Successfully connected to local MongoDB"))
  .catch((err) => console.error("❌ Database connection error:", err));

// Routes
app.use("/", authRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
