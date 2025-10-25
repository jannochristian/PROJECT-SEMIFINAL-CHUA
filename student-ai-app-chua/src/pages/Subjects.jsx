import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import AOS from "aos";
import toast from "react-hot-toast";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    subject_code: "",
    subject_name: "",
    instructor: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchSubjects() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("subjects").select("*");
      if (error) throw error;
      setSubjects(data || []);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSubjects();
    AOS.init({ duration: 900, once: true });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (!formData.subject_code || !formData.subject_name) {
        toast.error("Please fill in all required fields");
        return;
      }

      let response;
      if (editingId) {
        response = await supabase
          .from("subjects")
          .update({
            subject_code: formData.subject_code,
            subject_name: formData.subject_name,
            instructor: formData.instructor,
          })
          .eq("id", editingId)
          .select();
      } else {
        response = await supabase
          .from("subjects")
          .insert([
            {
              subject_code: formData.subject_code,
              subject_name: formData.subject_name,
              instructor: formData.instructor,
            },
          ])
          .select();
      }

      if (response.error) throw response.error;

      await fetchSubjects();
      toast.success(editingId ? "Subject updated!" : "Subject added!");
      setShowModal(false);
      setFormData({ subject_code: "", subject_name: "", instructor: "" });
      setEditingId(null);
    } catch (error) {
      console.error("Error saving subject:", error);
      toast.error("Error saving subject");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;

    try {
      await supabase.from("grades").delete().eq("subject_id", id);
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) throw error;

      fetchSubjects();
      toast.success("Subject deleted successfully!");
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Failed to delete subject.");
    }
  }

  function handleEdit(subject) {
    setFormData({
      subject_code: subject.subject_code,
      subject_name: subject.subject_name,
      instructor: subject.instructor,
    });
    setEditingId(subject.id);
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
          <h1 className="text-4xl font-bold text-sky-900">Subjects</h1>
          <button
            onClick={() => {
              setFormData({ subject_code: "", subject_name: "", instructor: "" });
              setEditingId(null);
              setShowModal(true);
            }}
            className="px-6 py-3 rounded-full bg-sky-900 hover:bg-sky-800 text-white shadow-xl transition"
          >
            Add Subject
          </button>
        </div>

        <div className="bg-sky-900 shadow-2xl rounded-xl p-10 px-8 mb-16">
          {isLoading ? (
            <div className="text-center py-4 text-white text-lg">Loading subjects...</div>
          ) : (
            <table className="min-w-full bg-transparent">
              <thead>
                <tr>
                  <th className="p-3 text-left text-white text-xl font-semibold">Subject Code</th>
                  <th className="p-3 text-left text-white text-xl font-semibold">Subject Name</th>
                  <th className="p-3 text-left text-white text-xl font-semibold">Instructor</th>
                  <th className="p-3 text-left text-white text-xl font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.id} className="border-b border-sky-800">
                    <td className="p-3 text-white text-lg">{subject.subject_code}</td>
                    <td className="p-3 text-white text-lg">{subject.subject_name}</td>
                    <td className="p-3 text-white text-lg">{subject.instructor}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="px-4 py-2 rounded-full bg-sky-800 hover:bg-sky-600 text-white mr-2 text-lg shadow-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <form onSubmit={handleSubmit} className="bg-sky-900 p-10 rounded-xl w-96 shadow-2xl" data-aos="zoom-in">
            <h2 className="text-3xl font-bold mb-6 text-white">
              {editingId ? "Edit Subject" : "Add New Subject"}
            </h2>
            <input
              required
              className="w-full border p-3 mb-4 rounded-lg bg-sky-800 text-white placeholder-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-lg"
              placeholder="Subject Code"
              value={formData.subject_code}
              onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })}
            />
            <input
              required
              className="w-full border p-3 mb-4 rounded-lg bg-sky-800 text-white placeholder-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-lg"
              placeholder="Subject Name"
              value={formData.subject_name}
              onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
            />
            <input
              className="w-full border p-3 mb-6 rounded-lg bg-sky-800 text-white placeholder-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-lg"
              placeholder="Instructor"
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-sky-700 hover:bg-sky-600 text-white shadow-xl transition text-lg"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                }}
                className="px-6 py-3 rounded-full bg-sky-800 hover:bg-sky-700 text-white shadow-xl transition text-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
