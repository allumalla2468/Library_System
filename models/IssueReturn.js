const mongoose = require("mongoose");

const IssueReturnSchema = new mongoose.Schema({


  smsSent: {
    type: Boolean,
    default: false
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date,
    default: null
  },

  returnedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ["issued", "returned"],
    default: "issued"
  }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("IssueReturn", IssueReturnSchema);
