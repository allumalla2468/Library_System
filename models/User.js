const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
   Department: {
    type: String,
    required: true
  },
  PhoneNumber: {
    type: String,
    required: true
  },
    Email: {
    type: String,
    
  },
  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student"
  }
},{ timestamps: true ,versionKey: false});

module.exports = mongoose.model("User", UserSchema);