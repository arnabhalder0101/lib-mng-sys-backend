const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userRoute = express.Router();

userRoute.post("/api/signup", async (req, res) => {
  try {
    const { fullName, email, password, gender, profilePic, state, city } =
      req.body;
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
        gender,
        profilePic,
        state,
        city,
      }).save();

      return res.status(200).json({
        msg: "User registered",
        user: user,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// sign in user --
userRoute.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ msg: "email, password -> this fields are needed" });
    }
    const userFound = await User.findOne({ email });

    if (!userFound) {
      return res.status(400).json({ msg: `User with this Email: ${email} not exists.` });
    } else {
      const isMatched = await bcrypt.compare(password, userFound.password);
      if (!isMatched) {
        return res.status(400).json({ msg: "Incorrect Password" });
      } else {
        const token = jwt.sign({ id: userFound._id }, "passwordKey");
        const { password, ...userWithoutPassword } = userFound._doc;

        return res
          .status(200)
          .json({ msg: "User validated", token, user: userWithoutPassword });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = userRoute;
