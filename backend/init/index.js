const mongoose = require("mongoose");
const express = require("express");
const initSampleAuthData = require("./data");
const user = require("../models/User");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.error(err));

const initDB = async () => {
  await user.deleteMany({});
  await user.insertMany(initSampleAuthData.data);
  console.log("Inserted Sample Data");
};

initDB();
