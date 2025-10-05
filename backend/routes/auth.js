const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

const PESU_AUTH_API_URL = "https://pesu-auth.onrender.com/authenticate";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// ... (keep the top of the file and the /login route as is)

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({
      $or: [{ prn: username }, { srn: username }],
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists. Please login." });
    }

    const response = await axios.post(PESU_AUTH_API_URL, {
      username,
      password,
      profile: true,
    });

    if (response.data.status === true && response.data.profile) {
      const profileData = response.data.profile;

      // 1. Create the user with all available fields
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

      // 2. Send a success message AND the newly created user object back
      return res.status(201).json({
        message: "Registration successful! Please log in.",
        user: newUser,
      });
    } else {
      throw new Error(response.data.message || "Invalid credentials.");
    }
  } catch (error) {
    const message = error.response
      ? error.response.data.message
      : error.message;
    return res.status(400).json({ message });
  }
});

// ... (keep the rest of the file as is)

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    await axios.post(PESU_AUTH_API_URL, { username, password });
    const user = await User.findOne({
      $or: [{ prn: username }, { srn: username }],
    });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not registered in our system." });
    }
    const token = createToken(user._id);
    res.status(200).json({ token, name: user.name });
  } catch (error) {
    const message = error.response
      ? error.response.data.message
      : "Invalid username or password.";
    return res.status(401).json({ message });
  }
});

module.exports = router;
