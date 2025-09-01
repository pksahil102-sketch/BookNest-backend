const express = require("express");
const router = express.Router();
const Note = require("../models/Note");

router.post("/:bookId", async (req, res) => {
  try {
    const {bookId} = req.params;
    const {content} = req.body;
    const newNote = new Note({
      bookId: bookId,
      content: content,
    });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

router.get("/:bookId", async (req, res) => {
  try {
    const notes = await Note.find({bookId: req.params.bookId}).sort({
      createdAt: -1,
    });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  const {id} = req.params;
  try {
    await Note.findByIdAndDelete(id);
    res.status(200).json({message: "Note Deleted"});
  } catch (error) {
    res.status(500).json(error.message);
  }
});

module.exports = router;
