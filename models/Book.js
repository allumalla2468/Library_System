
const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
    title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  },
  status:{type:String, default:"available"}
}, { timestamps: true , versionKey: false});

module.exports = mongoose.model("Book", BookSchema);
