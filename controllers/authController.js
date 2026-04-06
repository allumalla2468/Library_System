const User = require("../models/User");
const Book = require("../models/Book");

const IssueReturn = require("../models/IssueReturn");

const currentTime = new Date().toLocaleString("en-IN", {
  timeZone: "Asia/Kolkata"
});
exports.Register = async (req, res) => {
  try {
    const { name, role, Department,password,PhoneNumber,Email } = req.body;

    if (!name || !Department || !password ||!PhoneNumber) {
      return res.status(400).json({ message: "name and Department and password and phonenumber are required" });
    }
    const existingUser = await User.findOne({PhoneNumber});
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

   
    const admin = await User.create({
      name,
      password,
      role,
      PhoneNumber,
      Email,
      Department
    });

    return res.status(201).json({ message: "registered successfully",
      status : true,
      name: admin.name,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


exports.Login = async (req, res) => {
  try {
    const { PhoneNumber, password } = req.body;

    const user = await User.findOne({ PhoneNumber });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Validate password
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.status(200).json({
      message: "Login successful",
       status : true,
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ status : false, message: "Server error", error });
  }
};




exports.addBook = async (req, res) => {
  try {
    const { title, author, status, image, stock } = req.body;

    if (!title || !author || !image || !stock) {
      return res.status(400).json({
        message: "Title, author, image and stock are required"
      });
    }

    
    const exist = await Book.findOne({ title });

    if (exist) {
      return res.status(400).json({
        message: "Book already exists"
      });
    }

    // create book
    const book = await Book.create({
      title,
      author,
      status,
      image,
      stock
    });

    res.status(201).json({
      message: "Book added successfully",
      book
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};


exports.getBooks = async (req, res) => {
  try {


    const search = req.query.search || ""
  let filter = {}
    if(search){
 filter.title = { $regex:search,$options:"i"}
}

const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 5;

  const skip = (page -1) * limit

    const books = await Book.find(filter).sort({createdAt:-1}).skip(skip).limit(limit)
    // const books = await Book.find(filter).select("-createdAt -updatedAt")
   const total = await Book.countDocuments(filter);
    res.status(200).json({
      count: books.length,
      books,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
     
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



// exports.addStudent = async (req, res) => {
//   try {
//     const { name, Department,password,PhoneNumber,Email } = req.body;

//       const ph = await Stundent.findOne({ PhoneNumber })
//       if (ph) {
//   return res.status(400).json({
//     success: false,
//     message: "PhoneNumber already exists"
//   });
// }
//     if (!name || !Department || !password ||!PhoneNumber) {
//       return res.status(400).json({ message: "Stundentname and Department and password and PhoneNumber  are required" });
//     }
 
//     const student = await Stundent.create({
//       name,
//       Department,
//       password,PhoneNumber,Email
//     });

//     res.status(201).json({
//       message: "Student added successfully",
//       student
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.getStudents = async (req, res) => { 
  try {
    const students = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.issueBook = async (req, res) => {
  try {
    const { bookId, studentId, issueDate } = req.body;

    if (!bookId || !studentId || !issueDate) {
      return res.status(400).json({
        message: "bookId, studentId, and issueDate are required"
      });
    }

    // convert DD-MM-YYYY to Date
    const parts = issueDate.split("-");
    const formattedDate = new Date(parts[2], parts[1] - 1, parts[0]);

    if (isNaN(formattedDate.getTime())) {
      return res.status(400).json({ message: "Invalid issueDate format" });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(400).json({ message: "Book not found" });
    }

    // prevent same book duplicate only
    const sameBookIssue = await IssueReturn.findOne({
      bookId,
      studentId,
      status: "issued"
    });

    if (sameBookIssue) {
      return res.status(400).json({
        message: "This book is already issued to the student"
      });
    }

    if (book.stock <= 0) {
      return res.status(400).json({
        message: "Book out of stock"
      });
    }

    // decrease stock
    book.stock -= 1;
    await book.save();

    const issueRecord = await IssueReturn.create({
      bookId,
      studentId,
      issueDate: formattedDate,
      status: "issued",
      issuedAt: new Date()
    });

    const issuedAtIST = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata"
    });

    res.status(201).json({
      message: "Book issued successfully",
      issueRecord,
      issuedAt: issuedAtIST,
      remainingStock: book.stock
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.returnBook = async (req, res) => {
  try {

    const { bookId, studentId, returnDate } = req.body;

    if (!bookId || !studentId || !returnDate) {
      return res.status(400).json({
        message: "bookId, studentId, and returnDate are required"
      });
    }

    const parts = returnDate.split("-");
    const formattedDate = new Date(parts[2], parts[1] - 1, parts[0]);

    if (isNaN(formattedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid returnDate format"
      });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(400).json({
        message: "Book not found"
      });
    }

    const issueRecord = await IssueReturn.findOneAndUpdate(
      {
        bookId,
        studentId,
        status: "issued"
      },
      {
        returnDate: formattedDate,
        returnedAt: new Date(),
        status: "returned"
      },
      { new: true }
    );

    if (!issueRecord) {
      return res.status(400).json({
        message: "No active issue record found"
      });
    }

    // increase stock
    book.stock += 1;
    await book.save();

    const returnedAtIST = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata"
    });

    res.status(200).json({
      message: "Book returned successfully",
      issueRecord,
      returnedAt: returnedAtIST,
      updatedStock: book.stock
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};




exports.getUserWithHistory = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-__v");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const userhistory = await IssueReturn.find({ studentId: userId })
      .populate("bookId", "title author image")
      .select("bookId issueDate returnDate returnedAt status createdAt")
      .sort({ createdAt: -1 });

    // ✅ Format Time to IST
    const formattedHistory = userhistory.map(record => ({
      ...record.toObject(),
      issueTime: record.createdAt
        ? record.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        : null,
      returnTime: record.returnedAt
        ? record.returnedAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        : null
    }));

    return res.status(200).json({
      user,
      history: formattedHistory
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};