const express = require("express");
const User = require("../models/user");
const Book = require("../models/book");
const e = require("express");
const userRoute = require("./auth");

const operationRoute = express.Router();

// add book to a user by their email
operationRoute.post("/api/books/take", async (req, res) => {
  const { email, bookId } = req.body;

  if (!email || !bookId) {
    return res
      .status(400)
      .json({ msg: "email, bookId -> this fields are needed" });
  }
  try {
    let book = await Book.findOne({ bookId: bookId });
    let user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    // max 3 book logic
    if (user.borrowedBookIds.length >= 3) {
      return res.status(400).json({
        msg: "You already got 3 books, return 1 to get another 1",
      });
    }

    if (!book) {
      return res.status(404).json({ msg: "Book not found" });
    }
    // no books left in shelf logic
    if (book.quantity <= 0) {
      return res.status(400).json({ msg: "No copies left to borrow" });
    }

    let result = await User.updateOne(
      { email: email },
      { $addToSet: { borrowedBookIds: bookId } }
    );

    // if user took book then only update logic
    if (result.modifiedCount > 0) {
      await Book.updateOne({ bookId: bookId }, { $inc: { quantity: -1 } });

      book = await Book.findOne({
        bookId: bookId,
      });

      return res.status(201).json({
        msg: `book added to user with id: ${bookId}`,
        result,
        book,
      });
    } else {
      res
        .status(400)
        .json({ msg: `book id: ${bookId} already present`, result });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// add book --
operationRoute.post("/api/books/add", async (req, res) => {
  const { bookName, bookAuthor, quantity } = req.body;

  if (!bookName || !bookAuthor || quantity === undefined) {
    return res
      .status(400)
      .json({ msg: "bookName, bookAuthor, quantity -> fields are required" });
  }

  let name = bookName.toUpperCase();
  let author = bookAuthor.toUpperCase();

  try {
    const existingBook = await Book.findOne({
      bookName: name,
      bookAuthor: author,
    });

    if (existingBook) {
      res.status(400).json({
        msg: `${bookName}, written by ${bookAuthor} already exists`,
        book: existingBook,
      });
    } else {
      const bookId = await generateNextBookId();

      const newBook = new Book({
        bookId,
        bookName: name,
        bookAuthor: author,
        quantity,
      });

      await newBook.save();

      res
        .status(201)
        .json({ msg: `book ${bookName} is successfully added`, book: newBook });
    }
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
});

// show all books
operationRoute.get("/api/books/all", async (req, res) => {
  try {
    let books = await Book.find(); // returns a []
    let count = books.length;
    if (count > 0) {
      return res.status(200).json({ msg: `books found`, count, books });
    } else {
      return res.status(400).json({ msg: "Not Found", books });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

//show book by book id--
operationRoute.get("/api/books/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    let book = await Book.findOne({ bookId }); // return a obj..or null
    if (!book) {
      return res.status(400).json({ msg: `book ${bookId} not found` });
    } else {
      return res.status(200).json({ msg: `book found`, book });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

// return book
operationRoute.post("/api/return", async (req, res) => {
  try {
    const { email, bookId } = req.body;

    if (!email || !bookId) {
      return res
        .status(400)
        .json({ msg: "email, bookId -> this fields are needed" });
    }
    // removing from user --
    let result = await User.updateOne(
      { email: email },
      { $pull: { borrowedBookIds: bookId } }
    );
    if (result.modifiedCount > 0) {
      // returning/ adding +1 to shelf
      await Book.updateOne({ bookId: bookId }, { $inc: { quantity: 1 } });

      return res
        .status(200)
        .json({ msg: `Book ${bookId} returned to shelf` }, result);
    } else {
      return res
        .status(400)
        .json({ msg: `Book with id ${bookId} not found`, result });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

// admin Feature-->
// find a user with email id(that is library user id)
operationRoute.get("/api/users", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ msg: "email -> this field is needed" });
  }
  try {
    let result = await User.findOne({ email });
    if (result) {
      res.status(200).json({ msg: "User found", user: result });
    } else {
      res.status(400).json({ msg: "User not found", user: result });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// admin -->
// find all users who took a book by --> book id
operationRoute.get("/api/books", async (req, res) => {
  const { bookId } = req.query;

  if (!bookId) {
    return res.status(400).json({ msg: "bookId -> this field is needed" });
  }
  try {
    let result = await User.find({ borrowedBookIds: bookId });
    let count = result.length;
    if (count > 0) {
      res.status(200).json({
        msg: `Users with bookId:${bookId} found`,
        count,
        user: result,
      });
    } else {
      res
        .status(400)
        .json({ msg: `No User Took this Book ${bookId}`, count, user: result });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

//admin-->
// show all users
operationRoute.get("/api/users/all", async (req, res) => {
  try {
    let result = await User.find();
    let count = result.length;
    if (count > 0) {
      res.status(200).json({ msg: `Users found`, count, users: result });
    } else {
      res.status(400).json({ msg: "Users not found", user: result });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

//edit full name
userRoute.post("/api/update-name", async (req, res) => {
  const { email, newName } = req.body;

  if (!email || !newName) {
    return res
      .status(400)
      .json({ msg: "email, newName -> this fields are needed" });
  }
  try {
    // const user = await User.findOne({ email });

    // if (!user) {
    //   return res.status(400).json({ msg: "Not found user" });
    // } else {
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { $set: { fullName: newName } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({ msg: "No user found" });
    }

    const { password, ...userWithoutPassword } = updatedUser._doc;

    return res
      .status(200)
      .json({ msg: "name successfully updated", user: userWithoutPassword });
    // }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Login Api --
// Allowed admin emails
const allowedAdminEmails = [
  "admin1@lib.com",
  "admin2@lib.com",
  "admin3@lib.com",
];

// Default admin password
const defaultAdminPassword = "admin123";

// POST /admin login
userRoute.post("/api/admin/signin", (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password fields are required." });
    }

    // Check if the email is in the allowed list and password matches
    if (
      allowedAdminEmails.includes(email) &&
      password === defaultAdminPassword
    ) {
      return res.status(200).json({ message: "Admin login successful." });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid admin email or password." });
    }
  } catch (error) {
    return res.status(500).json(`Error: ${error.message}`);
  }
});

// method book id increment
const generateNextBookId = async () => {
  // Get the last added book sorted by `bookId` in descending order
  const lastBook = await Book.findOne().sort({ bookId: -1 });

  if (!lastBook) {
    return "B@001"; // First book
  }

  const lastId = lastBook.bookId; // e.g., B@009

  // Extract the number part and increment it
  const number = parseInt(lastId.split("@")[1]); // 9
  const nextNumber = number + 1;

  // Format with leading zeros
  const padded = String(nextNumber).padStart(3, "0"); // 010

  return `B@${padded}`; // B@010
};

module.exports = operationRoute;
