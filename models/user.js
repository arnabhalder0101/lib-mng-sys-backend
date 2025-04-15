const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: (value) => {
        const res =
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return res.test(value);
      },
      message: "Please Enter a Valid Email",
    },
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: (value) => {
        return value.length >= 8;
      },
      message: "Password muct be at least 8 char long",
    },
  },

  borrowedBookIds: {
    type: [String],
    default: [],
  },

  profilePic: {
    type: String,
    default: "",
  },
  state: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
