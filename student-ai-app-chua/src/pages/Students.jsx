import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import AOS from "aos";
import toast from 'react-hot-toast';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    student_number: '',
    first_name: '',
    last_name: '',
    course: '',
    year_level: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
    AOS.init({ duration: 900, once: true });
  }, []);

  async function fetchStudents() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (!formData.student_number || !formData.first_name || !formData.last_name) {
        return toast.error("Please fill all required fields");
      }

      let response;
      if (editingId) {
        response = await supabase.from("students").update(formData).eq("id", editingId).select();
      } else {
        response = await supabase.from("students").insert([formData]).select();
      }

      if (response.error) throw response.error;

      toast.success(editingId ? "Student updated!" : "Student added!");
      setShowModal(false);
      setEditingId(null);
      setFormData({ student_number: '', first_name: '', last_name: '', course: '', year_level: '' });
      fetchStudents();
    } catch (err) {
      console.error('Error saving student:', err);
      toast.error("Error saving student");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this student and all related grades?")) return;

    try {
      await supabase.from("grades").delete().eq("student_id", id);
      await supabase.from("students").delete().eq("id", id);
      toast.success("Student deleted successfully!");
      fetchStudents();
    } catch (err) {
      console.error('Error deleting student:', err);
      toast.error("Error deleting student");
    }
  }

  function handleEdit(student) {
    setEditingId(student.id);
    setFormData(student);
    setShowModal(true);
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-sky-900 text-white p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
          <nav className="flex flex-col gap-4 text-lg">
            <Link to="/" className="hover:text-sky-300 transition">Home</Link>
            <Link to="/students" className="hover:text-sky-300 transition">Students</Link>
            <Link to="/subjects" className="hover:text-sky-300 transition">Subjects</Link>
            <Link to="/grades" className="hover:text-sky-300 transition">Grades</Link>
          </nav>
        </div>
        <div className="mt-6">
          <p className="text-sm opacity-70">&copy; 2025 Your School</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto" data-aos="fade-up">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-sky-900">Student Management</h1>
          <button
            onClick={() => {
              setFormData({ student_number: '', first_name: '', last_name: '', course: '', year_level: '' });
              setEditingId(null);
              setShowModal(true);
            }}
            className="px-6 py-3 rounded-xl bg-sky-900 hover:bg-sky-800 text-white shadow transition"
          >
            Add Student
          </button>
        </div>

        <div className="bg-sky-900 shadow-2xl rounded-xl p-10 px-8 mb-16">
          <table className="w-full">
            <thead>
              <tr>
                {["Student #", "First Name", "Last Name", "Course", "Year", "Actions"].map((h, i) => (
                  <th key={i} className="p-3 text-left text-white text-xl font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-700">
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-8 text-white text-lg">Loading students...</td></tr>
              ) : students.length ? (
                students.map(student => (
                  <tr key={student.id}>
                    <td className="p-3 text-white text-lg">{student.student_number}</td>
                    <td className="p-3 text-white text-lg">{student.first_name}</td>
                    <td className="p-3 text-white text-lg">{student.last_name}</td>
                    <td className="p-3 text-white text-lg">{student.course}</td>
                    <td className="p-3 text-white text-lg">{student.year_level}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => handleEdit(student)}
                        className="px-4 py-2 bg-sky-700 hover:bg-sky-500 text-white rounded-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-6 text-white text-lg">No students found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <form onSubmit={handleSubmit} className="bg-sky-900 p-10 rounded-xl w-96 shadow-2xl" data-aos="zoom-in">
              <h2 className="text-3xl font-bold text-white mb-6">{editingId ? "Edit Student" : "Add New Student"}</h2>

              {["student_number", "first_name", "last_name", "course", "year_level"].map((field, i) => (
                <input
                  key={i}
                  required={i < 3}
                  className="w-full border p-3 mb-4 rounded-lg bg-sky-800 text-white placeholder-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder={field.replace("_", " ").toUpperCase()}
                  value={formData[field]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                />
              ))}

              <div className="flex justify-end gap-3">
                <button type="submit" className="px-6 py-3 bg-sky-700 hover:bg-sky-600 text-white rounded-xl">Save</button>
                <button
                  onClick={() => setShowModal(false)}
                  type="button"
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
