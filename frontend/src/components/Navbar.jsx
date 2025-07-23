import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavButton from "./NavButton.jsx";
import { auth } from "../services/firebase.js";
import { signOut } from "firebase/auth";
import { RiQuestionnaireFill } from "react-icons/ri";
import { AiFillHome } from "react-icons/ai";
import { FaMapSigns, FaFileAlt, FaRobot } from "react-icons/fa";
import { MdWork } from "react-icons/md";
import logo from "../assets/images/intervu-logo-transparent.png";

const Navbar = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAuthClick = async () => {
    if (user) {
      const confirmed = window.confirm("Are you sure you want to log out?");
      if (confirmed) {
        await signOut(auth);
        alert("Goodbye! You have been logged out");
        navigate("/signin");
      }
    } else {
      navigate("/signin");
    }
    setMenuOpen(false);
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 shadow bg-cyan-50">
      <div className="flex items-center min-w-0">
        <button
          className="flex items-center focus:outline-none cursor-pointer"
          onClick={() => navigate('/')}
          style={{ background: "none", border: "none", padding: 0, margin: 0 }}
          type="button"
        >
          <img src={logo} alt="Intervu Logo" className="h-19 w-19 mr-1" />
          <span className="text-5xl font-bold text-app-primary truncate">
            Intervu
          </span>
        </button>
      </div>
      <div className="flex items-center gap-2 relative ml-4" ref={menuRef} style={{flexShrink: 0}}>
        <NavButton icon={<AiFillHome size={24} />} alt="Home" onClick={() => navigate('/')} />
        <NavButton icon={<RiQuestionnaireFill size={24} />} alt="Questionnaire" onClick={() => navigate('/questionnaire')} />
        <NavButton icon={<FaMapSigns size={24} />} alt="Roadmap" onClick={() => navigate('/roadmap')} />
        <NavButton icon={<FaFileAlt size={24} />} alt="Resume" onClick={() => navigate('/resume')} />
        <NavButton icon={<MdWork size={24} />} alt="Job Dashboard" onClick={() => navigate('/dashboard')} />
        <NavButton icon={<FaRobot size={24} />} alt="AI-Interviewer" onClick={() => navigate('/ai-interviewer')} />
        <button
          className="w-12 h-12 rounded-full border-2 border-app-primary cursor-pointer flex items-center justify-center focus:outline-none bg-app-accent ml-1"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="text-base text-app-primary font-bold">U</span>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-12 w-44 bg-app-accent rounded-xl shadow-2xl py-3 z-20 text-app-text border border-app-secondary">
            {user && (
              <button
                  className="dropdown-btn text-app-primary"
                  type="button"
                  // onClick={}
              >
                {user.username}
              </button>
            )}
            <button
              className="dropdown-btn"
              type="button"
              onClick={handleAuthClick}
            >
              {user ? "Logout" : "Sign In"}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;