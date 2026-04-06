require("dotenv").config();   // ✅ line 1 (correct)
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js");
const auth = require("./routes/authRoutes.js")

const app = express();
connectDB();   // ✅ DB connected

app.use(cors());
app.use(express.json());

app.use("/api", auth);

const PORT = process.env.PORT || 5000;   // ✅ correct

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});