const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {type: String, required: true},
  author: {type: String, required: true},
  genre: String,
  status: {
    type: String,
    enum: ["To Read", "Reading", "Completed"],
    default: "To Read",
  },
  image: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Book", bookSchema);
