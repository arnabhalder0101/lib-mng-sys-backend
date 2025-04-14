const express = require("express");
const User = require("../models/user");

const userRoute = express.Router();

userRoute.post("/api/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({ msg: "User Email already exists" });
    } else {
      let user = await new User({ fullName, email, password }).save();

      return res.status(200).json({
        user: user,
        msg: "User registered",
      });
    }
  } catch (error) {
    res.status(500).json({error: error.message})
  }
});

module.exports = userRoute;