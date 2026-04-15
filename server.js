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


// ✅ ================== SMS FUNCTION ==================


// const sendSMS = async (number, message) => {
//   try {
//     const response = await axios.post(
//       "https://www.fast2sms.com/dev/bulkV2",
//       {
//         route: "q",
//         message,
//         language: "english",
//         numbers: number,
//       },
//       {
//         headers: {
//           authorization: process.env.FAST2SMS_API_KEY,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     return response.data;
//   } catch (error) {
//     console.error("❌ SMS ERROR:", error?.response?.data || error.message);
//     throw error;
//   }
// };





// ✅ ================== CRON JOB ==================


// cron.schedule("* * * * *", async () => {
//   console.log("⏰ Running SMS Cron...");

//   try {
//     // ⏳ 3 minutes ago time
//     const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);

//     // 🔥 Fetch only valid records
//     const issues = await IssueReturn.find({
//       issueDate: { $lte: threeMinutesAgo },
//       smsSent: false,
//       status: "issued", // ✅ don't send if returned
//     }).populate("studentId");

//     for (const item of issues) {
//       try {
//         const phone = item?.studentId?.PhoneNumber;

//         if (!phone) {
//           console.log(`❌ No phone for user ${item.studentId}`);
//           continue;
//         }

//         // 📩 Message with formatted time
//         const formattedDate = new Date(item.issueDate).toLocaleString(
//           "en-IN",
//           { timeZone: "Asia/Kolkata" }
//         );

//         const message = `Reminder: Book issued on ${formattedDate}. Please return it.`;

//         await sendSMS(phone, message);

//         // ✅ Update flags
//         item.smsSent = true;
//         item.smsSentAt = new Date();
//         await item.save();

//         console.log(`✅ SMS sent to ${phone}`);
//       } catch (err) {
//         console.error(`❌ Failed for record ${item._id}`);

//         item.smsFailed = true;
//         await item.save();
//       }
//     }
//   } catch (error) {
//     console.error("❌ Cron Error:", error);
//   }
// });


// ✅ ================== START SERVER ==================
app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Server running on port", process.env.PORT || 3000);
});