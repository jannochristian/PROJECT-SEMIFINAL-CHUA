import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import AOS from "aos";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { GradeReport } from '../pdfTemplates/StudentReportDocument';
import toast from "react-hot-toast";

export default function Grades() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
    AOS.init({ duration: 900, once: true });
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      const loadData = async () => {
        await fetchEnrolledStudents();
        await fetchGrades();
      };
      loadData();
    }
  }, [selectedSubject]);

  async function fetchSubjects() {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, subject_name, subject_code');
      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  }

  async function fetchEnrolledStudents() {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, first_name, last_name, student_number');
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  }

  async function fetchGrades() {
    try {
      const { data: gradesData, error } = await supabase
        .from('grades')
        .select('*')
        .eq('subject_id', selectedSubject);

      if (error) throw error;

      setStudents(prevStudents => 
        prevStudents.map(student => {
          const studentGrades = gradesData?.find(g => g.student_id === student.id) || {};
          return {
            ...student,
            prelim: studentGrades.prelim || '',
            midterm: studentGrades.midterm || '',
            semifinal: studentGrades.semifinal || '',
            final: studentGrades.final || ''
          };
        })
      );
      setGrades(gradesData || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  }

  async function handleSaveGrades() {
    try {
      setIsLoading(true);
      
      const gradesData = students
        .filter(student => student.prelim || student.midterm || student.semifinal || student.final)
        .map(student => ({
          student_id: student.id,
          subject_id: selectedSubject,
          prelim: parseFloat(student.prelim) || 0,
          midterm: parseFloat(student.midterm) || 0,
          semifinal: parseFloat(student.semifinal) || 0,
          final: parseFloat(student.final) || 0
        }));

      await supabase.from('grades').delete().eq('subject_id', selectedSubject);

      const { error } = await supabase.from('grades').insert(gradesData);

      if (error) throw error;
      
      toast.success('Grades saved successfully!');
      await fetchGrades();
    } catch (error) {
      console.error('Error saving grades:', error);
      toast.error('Error saving grades');
    } finally {
      setIsLoading(false);
    }
  }

  function handleGradeChange(studentId, field, value) {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId
          ? { ...student, [field]: value }
          : student
      )
    );
  }

  function computeAverage(student) {
    const grades = ['prelim', 'midterm', 'semifinal', 'final']
      .map(term => parseFloat(student[term]) || 0);
    return (grades.reduce((a, b) => a + b, 0) / 4).toFixed(2);
  }

  async function generateReport() {
    try {
      const passedStudents = students.filter(s => parseFloat(computeAverage(s)) <= 3.0)
        .map(s => `${s.first_name} ${s.last_name}`);
      
      const failedStudents = students.filter(s => parseFloat(computeAverage(s)) > 3.0)
        .map(s => `${s.first_name} ${s.last_name}`);

      setReport({
        summary: `Total students: ${students.length}\nPassed: ${passedStudents.length}\nFailed: ${failedStudents.length}`,
        passed: passedStudents,
        failed: failedStudents
      });

      toast.success("AI Report Generated!")
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error("Error generating report");
    }
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
          <h1 className="text-4xl font-bold text-sky-900">Grade Management</h1>
        </div>

        <div className="bg-sky-900 shadow-2xl rounded-xl p-10 px-8 mb-16">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full border p-3 rounded-lg bg-sky-800 text-white mb-6 text-lg focus:ring-2 focus:ring-sky-500"
          >
            <option value="">Select Subject</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.subject_name}
              </option>
            ))}
          </select>

          {selectedSubject && (
            <div className="bg-sky-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="p-3 text-left text-white text-xl font-semibold">Student Number</th>
                    <th className="p-3 text-left text-white text-xl font-semibold">Name</th>
                    <th className="p-3 text-left text-white text-xl font-semibold">Prelim</th>
                    <th className="p-3 text-left text-white text-xl font-semibold">Midterm</th>
                    <th className="p-3 text-left text-white text-xl font-semibold">Semifinal</th>
                    <th className="p-3 text-left text-white text-xl font-semibold">Final</th>
                    <th className="p-3 text-left text-white text-xl font-semibold">Average</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-700">
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="p-3 text-white text-lg">{student.student_number}</td>
                      <td className="p-3 text-white text-lg">
                        {student.first_name} {student.last_name}
                      </td>
                      {['prelim', 'midterm', 'semifinal', 'final'].map((term) => (
                        <td key={term} className="p-3">
                          <input
                            type="number"
                            min="1"
                            max="5"
                            step="0.01"
                            value={student[term] || ''}
                            onChange={(e) => handleGradeChange(student.id, term, e.target.value)}
                            className="w-full bg-sky-700 text-white border border-sky-600 rounded-lg p-2 text-center text-lg focus:ring-2 focus:ring-sky-500"
                          />
                        </td>
                      ))}
                      <td className="p-3 text-center font-semibold text-white text-lg">
                        {computeAverage(student)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-6 border-t border-sky-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <button
                  onClick={handleSaveGrades}
                  disabled={isLoading}
                  className="px-6 py-3 rounded-full bg-sky-800 hover:bg-sky-700 text-white shadow-xl transition text-lg"
                >
                  {isLoading ? 'Saving...' : 'Save Grades'}
                </button>

                <div className="flex gap-4 mt-4 md:mt-0">
                  <button
                    onClick={generateReport}
                    className="px-6 py-3 rounded-full bg-sky-800 hover:bg-sky-700 text-white shadow-xl transition text-lg"
                  >
                    Generate AI Analysis Report
                  </button>
                  {report && (
                    <PDFDownloadLink
                      document={
                        <GradeReport 
                          subject={subjects.find(s => s.id === Number(selectedSubject))}
                          students={students}
                          report={report}
                        />
                      }
                      fileName="grade-report.pdf"
                      className="px-6 py-3 rounded-full bg-sky-800 hover:bg-sky-700 text-white shadow-xl transition text-lg"
                    >
                      {({ loading }) => loading ? 'Preparing PDF...' : 'Download PDF Report'}
                    </PDFDownloadLink>
                  )}
                </div>
              </div>
            </div>
          )}

          {report && (
            <div className="mt-6 bg-sky-800 rounded-xl p-6 shadow-xl" data-aos="fade-up">
              <h2 className="text-2xl font-bold mb-4 text-white">Analysis Report</h2>
              <p className="mb-2 text-white text-lg">{report.summary}</p>
              <p className="mb-1 text-white text-lg"><strong>Passed:</strong> {report.passed.join(", ") || "None"}</p>
              <p className="text-white text-lg"><strong>Failed:</strong> {report.failed.join(", ") || "None"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
