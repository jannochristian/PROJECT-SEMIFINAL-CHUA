import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import { FaUsers, FaBook, FaChartBar } from "react-icons/fa";
import profileImage from '../assets/profile.jpg';

export default function Landing() {
  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* PROFILE OG NAME NAKO */}
      <section className="text-center pt-16 pb-12" data-aos="fade-up">
        <div className="relative w-44 h-44 mx-auto mb-5">
          <img 
            src={profileImage}
            alt="Profile"
            className="w-full h-full object-cover rounded-full ring-4 ring-white/80 shadow-2xl relative"
          />
        </div>

        <h2 className="text-5xl font-extrabold text-sky-900">
          Janno Christian Chua
        </h2>
        <p className="mt-2 text-2xl font-bold text-sky-900">3rd Year IT Student</p>

      </section>

      {/* MAO NI ANG JOURNEY STORY */}
      <section className="max-w-5xl mx-auto bg-sky-900 shadow-2xl rounded-xl p-10 px-8 mb-16" data-aos="fade-up">
        <h3 className="text-4xl backdrop-blur-sm font-semibold text-center text-white mb-6">
          My IT Journey
        </h3>
        <p className="text-xl text-center text-white leading-relaxed">
         When I started IT in my first year, I didn't really know much about coding. 
         I was just curious about how computers and apps worked. As I learned more, I made mistakes, 
         got stuck many times, and even felt frustrated. But I kept going. Little by little, I improved 
         and started to enjoy creating projects and solving problems. Now, I'm still learning,
         but I'm more confident and motivated to continue my IT journey.
        </p>
      </section>

      {/* STUDENT SUBJECT GRADES DIRI MATUPLOK */}
      <section className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 px-6 pb-20">
        <Link to="/students" className="bg-sky-900 backdrop-blur-sm p-6 rounded-xl shadow-2xl hover:scale-105 transition transform cursor-pointer text-center" data-aos="fade-up">
          <FaUsers className="text-white text-4xl mx-auto mb-3" />
          <h4 className="font-bold text-white text-lg mb-1">Students</h4>
          <p className="text-white text-sm">View student records</p>
        </Link>

        <Link to="/subjects" className="bg-sky-900 backdrop-blur-sm p-6 rounded-xl shadow-2xl hover:scale-105 transition transform cursor-pointer text-center" data-aos="fade-up" data-aos-delay="150">
          <FaBook className="text-white text-4xl mx-auto mb-3" />
          <h4 className="font-bold text-white text-lg mb-1">Subjects</h4>
          <p className="text-white text-sm">Browse available subjects</p>
        </Link>

        <Link to="/grades" className="bg-sky-900 backdrop-blur-sm p-6 rounded-xl shadow-2xl hover:scale-105 transition transform cursor-pointer text-center" data-aos="fade-up" data-aos-delay="300">
          <FaChartBar className="text-white text-4xl mx-auto mb-3" />
          <h4 className="font-bold text-white text-lg mb-1">Grades</h4>
          <p className="text-white text-sm">Check academic performance</p>
        </Link>
      </section>
    </div>
  );
}
