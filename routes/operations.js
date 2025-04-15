const express = require("express");
const User = require("../models/user");
const Book = require("../models/book");
const e = require("express");

const operationRoute = express.Router();

// add book to a user by their email
operationRoute.post("/api/books/take", async (req, res) => {
  const { email, bookId } = req.body;

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

      res.status(201).json({ msg: `book ${bookName} is successfully added` });
    }
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
});

//

// admin Feature-->
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
    res.status(500).json({ msg: error.message });
  }
});

// admin -->
// find all users who took a book by --> book id
operationRoute.get("/api/books", async (req, res) => {
  const { bookId } = req.body;
  try {
    let result = await User.find({ borrowedBookIds: bookId });
    if (result) {
      res
        .status(200)
        .json({ msg: `users with bookId: ${bookId} found`, user: result });
    } else {
      res.status(400).json({ msg: "book not found", user: result });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
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