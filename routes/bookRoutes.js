
const express = require("express");
const router = express.Router();
const Book = require("../models/Book");

router.get("/books", async(req,res)=>{
 const books = await Book.find();
 res.json(books);
});

module.exports = router;
