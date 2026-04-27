require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cron = require("node-cron");

const connectDB = require("./config/db.js");
const auth = require("./routes/authRoutes.js");
const IssueReturn = require("./models/IssueReturn");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api", auth);

const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
    });

    console.log("✅ Email sent to", to);

  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
};



// ✅ ================== CRON JOB ==================


cron.schedule("* * * * *", async () => {
  console.log("⏰ Running EMAIL Cron...");

  try {
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);

    const issues = await IssueReturn.find({
      issueDate: { $lte: threeMinutesAgo },
      smsSent: false,
      status: "issued",
    }).populate("studentId");

    console.log("Found records:", issues.length);

    for (const item of issues) {
      try {
        const email = item?.studentId?.Email; // ✅ IMPORTANT (capital E)

        if (!email) {
          console.log(`❌ No email for user ${item.studentId}`);
          continue;
        }

        const formattedDate = new Date(item.issueDate).toLocaleString(
          "en-IN",
          { timeZone: "Asia/Kolkata" }
        );

        const message = `Dear ${item.studentId.name},

The book issued on ${formattedDate} is still not returned.

Please return it as soon as possible.

Thank you!`;

        await sendEmail(
          email,
          "📚 Book Return Reminder",
          message
        );

        item.smsSent = true; // reuse same field
        item.smsSentAt = new Date();
        await item.save();

        console.log(`✅ Email sent to ${email}`);

      } catch (err) {
        console.error(`❌ Failed for record ${item._id}`);
        item.smsFailed = true;
        await item.save();
      }
    }

  } catch (error) {
    console.error("❌ Cron Error:", error);
  }
});

// ✅ ================== START SERVER ==================
app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Server running on port", process.env.PORT || 3000);
});