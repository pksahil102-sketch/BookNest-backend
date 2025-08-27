const express = require("express");
const connect = require("./db/connect");
require("dotenv").config();
const cors = require("cors");
const multer = require("multer");
const Book = require("./models/Book");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({msg: "Welcome to BOOKNEST API 📚"});
});

// Get Req - get all books
app.get("/api/v1/books", async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({storage});

app.use("/uploads", express.static("uploads"));

// Post request- create new book
app.post("/api/v1/books", upload.single("image"), async (req, res) => {
  try {
    const {title, author, genre, status, imageUrl} = req.body;
    const newBook = new Book({
      title: title,
      author: author,
      genre: genre,
      status: status,
      image: req.file
        ? `/uploads/${req.file.filename}`
        : imageUrl || "/uploads/placeholder.png",
    });

    await newBook.save();
    res.json(newBook);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// Get a single
app.get("/api/v1/books/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({message: "Book not found"});
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
});

// Allowed status values (same as schema enum)
const allowedStatus = ["To Read", "Reading", "Completed"];

// Update a book
app.put("/api/v1/books/:id", upload.single("image"), async (req, res) => {
  try {
    const {id} = req.params;
    const {title, author, genre, status, imageUrl} = req.body;

    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({error: "Invalid status value"});
    }

    let updateData = {title, author, genre};
    if (status) updateData.status = status;

    // If file uploaded → keep format consistent with POST
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    // Else if URL provided → use URL
    else if (imageUrl) {
      updateData.image = imageUrl;
    }

    const updatedBook = await Book.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedBook) {
      return res.status(404).json({message: "Book not found"});
    }

    res.json(updatedBook);
  } catch (error) {
    res.status(400).json({message: error.message});
  }
});

// Delete a book
app.delete("/api/v1/books/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const deleted = await Book.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({message: "Book not found"});
    }

    res.json({message: "Book deleted successfully"});
  } catch (error) {
    res.status(500).json({message: error.message});
  }
});

// To update only the status
app.patch("/api/v1/books/:id/status", async (req, res) => {
  try {
    const {status} = req.body;

   //to validate status
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({error: "Invalid status value"});
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {status},
      {new: true}
    );

    if (!updatedBook) {
      return res.status(404).json({message: "Book not found"});
    }

    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

const PORT = process.env.PORT;
const start = async function () {
  await connect();
  console.log(`Connected to Database`);
  app.listen(PORT, function () {
    console.log(`Server is listening on PORT ${PORT}`);
  });
};

start();
