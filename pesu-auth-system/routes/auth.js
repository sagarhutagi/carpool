// routes/auth.js
const express = require("express");
const axios = require("axios");
const User = require("../models/User");
const router = express.Router();

const PESU_AUTH_API_URL = "https://pesu-auth.onrender.com/authenticate";

// --- Page Rendering ---
router.get("/", (req, res) => res.redirect("/login"));
router.get("/register", (req, res) =>
  res.render("register", { error: null, success: null })
);
router.get("/login", (req, res) => res.render("login", { error: null }));

// --- Registration Logic ---
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({
      $or: [{ prn: username }, { srn: username }],
    });
    if (existingUser) {
      return res.render("register", {
        error: "User already exists. Please login.",
        success: null,
      });
    }

    const response = await axios.post(PESU_AUTH_API_URL, {
      username,
      password,
      profile: true,
    });

    if (response.data.status === true && response.data.profile) {
      const profileData = response.data.profile;
      const newUser = new User({
        name: profileData.name,
        prn: profileData.prn,
        srn: profileData.srn,
        program: profileData.program,
        branch: profileData.branch,
        semester: profileData.semester,
        section: profileData.section,
        email: profileData.email,
        phone: profileData.phone,
        campus: profileData.campus,
      });
      await newUser.save();
      return res.render("login", {
        error: "Registration successful! Please log in.",
      });
    } else {
      throw new Error(
        response.data.message || "Invalid credentials or API error."
      );
    }
  } catch (error) {
    const errorMessage = error.response
      ? error.response.data.message
      : error.message;
    return res.render("register", { error: errorMessage, success: null });
  }
});

// --- Login Logic ---
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    await axios.post(PESU_AUTH_API_URL, { username, password, profile: true });

    const user = await User.findOne({
      $or: [{ prn: username }, { srn: username }],
    });
    if (!user) {
      return res.render("login", {
        error: "User not registered. Please register first.",
      });
    }

    req.session.userId = user._id;
    res.redirect("/home");
  } catch (error) {
    const errorMessage = error.response
      ? error.response.data.message
      : "Invalid username or password.";
    return res.render("login", { error: errorMessage });
  }
});

// --- Protected Home Page ---
router.get("/home", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  try {
    const user = await User.findById(req.session.userId);
    res.render("home", { user });
  } catch (error) {
    return res.redirect("/login");
  }
});

// --- Logout ---
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;