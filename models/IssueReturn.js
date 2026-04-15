const mongoose = require("mongoose");
 
const IssueReturnSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      default: null,
    },
    returnedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["issued", "returned"],
      default: "issued",
    },
 
    // ✅ ADD THIS (VERY IMPORTANT)
    smsSent: {
      type: Boolean,
      default: false,
    },
 
    // ✅ OPTIONAL (for retry logic / debugging)
    smsFailed: {
      type: Boolean,
      default: false,
    },
 
    // ✅ OPTIONAL (track when SMS sent)
    smsSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);
 
// ✅ INDEX (IMPORTANT for cron performance)
IssueReturnSchema.index({ issueDate: 1, smsSent: 1 });
 
module.exports = mongoose.model("IssueReturn", IssueReturnSchema);