require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.js");
const auth = require("./routes/authRoutes.js")
const axios = require("axios");
const app = express();
const cron = require("node-cron");
const IssueReturn = require("./models/IssueReturn");
const User = require("./models/User");
connectDB();

app.use(cors());
app.use(express.json());

 app.use("/api",auth);



app.post("/api/send-sms", async (req, res) => {
  try {
    console.log("API HIT ✅", req.body);

    const { number, message } = req.body;

    // ✅ Validation
    if (!number || !message) {
      return res.status(400).json({
        success: false,
        message: "Number and message are required",
      });
    }

    // ✅ Validate 10 digit number
    if (!/^\d{10}$/.test(number)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number",
      });
    }

    // ✅ FAST2SMS API CALL
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        message: ` Dear ${message}, The book is currently issued to you. Kindly return it at your earliest convenience.`,
        language: "english",
        flash: 0,
        numbers: number,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY, // 🔐 from .env
          "Content-Type": "application/json",
        },
      }
    );

    return res.json({
      success: true,
      data: response.data,
    });

  } catch (error) {
    console.error("ERROR ❌", error?.response?.data || error.message);
    console.error("ERROR ❌ FULL:", error);
console.error("ERROR DATA:", error?.response?.data);

    return res.status(500).json({
      success: false,
      message:
        error?.response?.data?.message ||
        "Failed to send SMS",
    });
  }
});

// ==============================
// ✅ OTP API (OPTIONAL)
// ==============================
app.post("/api/send-otp", async (req, res) => {
  try {
    const { number } = req.body;

    if (!number) {
      return res.status(400).json({
        success: false,
        message: "Mobile number required",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const message = `Your OTP is ${otp}`;

    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        message: message,
        language: "english",
        numbers: number,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
        },
      }
    );

    return res.json({
      success: true,
      otp, 
      data: response.data,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "OTP send failed",
    });
  }
});




cron.schedule("* * * * *", async () => {
  console.log("⏰ Checking overdue books...");

  const tenMinutesAgo = new Date();
  tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 4);

  try {
    const overdueBooks = await IssueReturn.find({
      status: "issued",
      issueDate: { $lte: tenMinutesAgo },
      smsSent: false
    });

    for (let record of overdueBooks) {

      const user = await User.findById(record.studentId);

      if (user && user.PhoneNumber) {

        await axios.post(
          "https://www.fast2sms.com/dev/bulkV2",
          {
            route: "q",
            message: `Dear ${user.name}, please return your issued book.`,
            language: "english",
            numbers: user.PhoneNumber,
          },
          {
            headers: {
              authorization: process.env.FAST2SMS_API_KEY,
            },
          }
        );

        console.log("✅ SMS sent to", user.PhoneNumber);

        record.smsSent = true;
        await record.save();
      }
    }

  } catch (err) {
    console.error("❌ CRON ERROR:", err);
  }
});


app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port", process.env.PORT);
});
