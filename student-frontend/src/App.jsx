import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    registerNumber: "",
    email: "",
    department: "",
    marks: 0,
  });
  const [editStudent, setEditStudent] = useState({
    name: "",
    registerNumber: "",
    email: "",
    department: "",
    marks: 0,
  });

  const studentsPerPage = 10;

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/students");
      const updatedStudents = response.data.map((student) => ({
        ...student,
        status: student.marks >= 40 ? "Pass" : "Fail",
      }));
      setStudents(updatedStudents.sort((a, b) => b.marks - a.marks));
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleDelete = async (registerNumber) => {
    try {
      await axios.delete(`http://localhost:5000/students/${registerNumber}`);
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const handleEdit = (student) => {
    setEditStudent(student);
    setShowEditForm(true);
  };

  const handleUpdateStudent = async () => {
    try {
      await axios.put(`http://localhost:5000/students/${editStudent.registerNumber}`, editStudent);
      fetchStudents();
      setShowEditForm(false);
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const handleAddStudent = async () => {
    try {
      await axios.post("http://localhost:5000/students", newStudent);
      fetchStudents();
      setNewStudent({ name: "", registerNumber: "", email: "", department: "", marks: 0 });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding student:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDepartmentClick = (dept) => {
    setSelectedDepartment(dept);
  };

  const departments = ["All", "CS", "DA", "EC", "EE", "BM", "ME", "CE"];

  const filteredStudents = students.filter(
    (student) =>
      (selectedDepartment === "All" || student.department === selectedDepartment) &&
      student.registerNumber.includes(searchTerm)
  );

  const totalStudents = filteredStudents.length;
  const passedStudents = filteredStudents.filter((student) => student.status === "Pass").length;
  const successRate = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(2) : 0;

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  return (
    <div className="container">
      <div className="header">
        <h1>Student Ranking Analysis</h1>
        <button
          className="add-student-btn"
          onClick={() => setShowAddForm(true)}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            backgroundColor: "#6A0DAD",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          Add Student
        </button>
      </div>
      <input type="text" placeholder="Search by Register Number" value={searchTerm} onChange={handleSearchChange} className="search-box" />

      <div className="department-buttons">
        {departments.map((dept) => (
          <button
            key={dept}
            onClick={() => handleDepartmentClick(dept)}
            className={selectedDepartment === dept ? "active" : ""}
          >
            {dept}
          </button>
        ))}
      </div>

      {showAddForm && (
        <div className="form-container">
          <h3>Add Student</h3>
          <input
            type="text"
            placeholder="Name"
            value={newStudent.name}
            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Register Number"
            value={newStudent.registerNumber}
            onChange={(e) => setNewStudent({ ...newStudent, registerNumber: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={newStudent.email}
            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Department"
            value={newStudent.department}
            onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
          />
          <input
            type="number"
            placeholder="Marks"
            value={newStudent.marks}
            onChange={(e) => setNewStudent({ ...newStudent, marks: Number(e.target.value) })}
          />
          <button onClick={handleAddStudent}>Submit</button>
          <button onClick={() => setShowAddForm(false)}>Cancel</button>
        </div>
      )}

      {showEditForm && (
        <div className="form-container">
          <h3>Edit Student</h3>
          <input
            type="text"
            placeholder="Name"
            value={editStudent.name}
            onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
          />
          <input type="text" placeholder="Register Number" value={editStudent.registerNumber} readOnly />
          <input
            type="email"
            placeholder="Email"
            value={editStudent.email}
            onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Department"
            value={editStudent.department}
            onChange={(e) => setEditStudent({ ...editStudent, department: e.target.value })}
          />
          <input
            type="number"
            placeholder="Marks"
            value={editStudent.marks}
            onChange={(e) => setEditStudent({ ...editStudent, marks: Number(e.target.value) })}
          />
          <button onClick={handleUpdateStudent}>Update</button>
          <button onClick={() => setShowEditForm(false)}>Cancel</button>
        </div>
      )}

      <div className="statistics">
        <h3>Total Passed Students: {passedStudents}</h3>
        <h3>Success Rate: {successRate}%</h3>
      </div>

      <table className="student-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Register Number</th>
            <th>Email</th>
            <th>Department</th>
            <th>Marks</th>
            <th>Pass/Fail</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  {currentStudents.map((student, index) => (
    <tr key={`${student.registerNumber}-${index}`}> {/* Ensure unique keys */}
      <td>{indexOfFirstStudent + index + 1}</td>
      <td>{student.name}</td>
      <td>{student.registerNumber}</td>
      <td>{student.email}</td>
      <td>{student.department}</td>
      <td>{student.marks}</td>
      <td style={{ color: student.marks >= 40 ? "green" : "red" }}>
        {student.marks >= 40 ? "Pass" : "Fail"}
      </td>
      <td>
        <button onClick={() => handleEdit(student)}>Edit</button>
        <button onClick={() => handleDelete(student.registerNumber)}>Delete</button>
      </td>
    </tr>
  ))}
</tbody>

      </table>

      <div className="pagination">
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        <span> Page {currentPage} </span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={indexOfLastStudent >= filteredStudents.length}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default App;
