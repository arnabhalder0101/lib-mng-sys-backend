const express = require("express");
const User = require("../models/user");
const e = require("express");

const operationRoute = express.Router();


// add book to a user by their email
operationRoute.post("/api/add/book", async (req, res) => {
  
  const { email, bookId } = req.body;

  try {
    let result = await User.updateOne(
      { email: email },
      { $addToSet: { borrowedBookIds: bookId } }
    );
    if (result.modifiedCount > 0) {
      res.status(201).json({ msg: `book added with id: ${bookId}`, result });
    } else {
      res
        .status(400)
        .json({ msg: `book id: ${bookId} already present`, result });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// find a user with user id
operationRoute.get("/api/users", async (req, res) => {
  const { id } = req.body;
  try {
    let result = await User.findOne({ _id: id });
    if (result) {
      res.status(200).json({ msg: "user found", user: result });
    } else {
      res.status(400).json({ msg: "user not found", user: result });
    }
  } catch (error) {
    res.status(500).json({msg: error.message});
  }
});

// find all users who took a book by --> book id
operationRoute.get("/api/books", async (req, res) => {
  const { bookId } = req.body;
  try {
    let result = await User.find({ borrowedBookIds: bookId });
    if (result) {
      res.status(200).json({ msg: `users with bookId: ${bookId} found`, user: result });
    } else {
      res.status(400).json({ msg: "book not found", user: result });
    }
  } catch (error) {
    res.status(500).json({msg: error.message});
  }
});

module.exports = operationRoute;
