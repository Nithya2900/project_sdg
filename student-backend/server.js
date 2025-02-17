require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("MongoDB connected");
}).catch((error) => {
  console.error("MongoDB connection error:", error);
});

// Define the student schema
const studentSchema = new mongoose.Schema({
  name: String,
  registerNumber: String,
  email: String,
  department: String,
  marks: Number,
});

// Create the Student model
const Student = mongoose.model("Student", studentSchema, "student_db");

// ✅ GET: Fetch all students sorted by marks (highest to lowest)
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ marks: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ POST: Add a new student
app.post("/students", async (req, res) => {
  try {
    const { name, registerNumber, email, department, marks } = req.body;
    if (!name || !registerNumber || !email || !department || marks === undefined) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const existingStudent = await Student.findOne({ registerNumber });
    if (existingStudent) {
      return res.status(400).json({ error: "Student with this register number already exists" });
    }
    const newStudent = new Student({ name, registerNumber, email, department, marks });
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ PUT: Update student details
app.put("/students/:registerNumber", async (req, res) => {
  try {
    const { name, email, department, marks } = req.body;
    const updatedStudent = await Student.findOneAndUpdate(
      { registerNumber: req.params.registerNumber },
      { $set: { name, email, department, marks } },
      { new: true }
    );
    if (!updatedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ DELETE: Remove a student
app.delete("/students/:registerNumber", async (req, res) => {
  try {
    const deletedStudent = await Student.findOneAndDelete({ registerNumber: req.params.registerNumber });
    if (!deletedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json({ message: "Student deleted successfully", deletedStudent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set the port and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
