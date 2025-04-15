const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
  // just like a email --> B@001 / B@002 ...
  bookId: {
    type: String,
    required: true,
    unique: true,
  },
  bookName: {
    type: String,
    required: true,
  },
  bookAuthor: {
    type: String,
    default: "",
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;
