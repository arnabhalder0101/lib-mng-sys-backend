const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

const userRoute = express.Router();

userRoute.post("/api/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({ msg: "User Email already exists" });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(password, salt);

      let user = await new User({
        fullName,
        email,
        password: hashedPass,
      }).save();

      return res.status(200).json({
        user: user,
        msg: "User registered",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = userRoute;
