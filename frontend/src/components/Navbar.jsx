import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { auth } from "../services/firebase.js";
import { FaFileAlt, FaMapSigns, FaRobot, FaUser } from "react-icons/fa";
import { MdWork } from "react-icons/md";
import NavButton from "./NavButton.jsx";
import { RiQuestionnaireFill } from "react-icons/ri";
import { fetchUserResume } from "../services/resumeServices";
import logo from "../assets/images/intervu-logo-transparent.png";
import { signOut } from "firebase/auth";
import Modal from "./Modal";
import { useNotification } from "./NotificationProvider";

const Navbar = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [resumeCheckLoading, setResumeCheckLoading] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    const handler = (e) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleAuthClick = async () => {
    if (user) {
      setShowLogoutModal(true);
    } else {
      navigate("/signin");
    }
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await signOut(auth);
    localStorage.setItem("justLoggedOut", "true");
    showNotification("Goodbye! You have been logged out", "success");
    navigate("/signin");
  };

  const handleResumeClick = () => {
    navigate("/resume");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 shadow bg-cyan-50">
      {/* Left: Logo and Home */}
      <div className="flex items-center min-w-0">
        <button
          className="flex items-center focus:outline-none cursor-pointer"
          onClick={() => navigate('/')} 
          style={{ background: "none", border: "none", padding: 0, margin: 0 }}
          type="button"
        >
          <img src={logo} alt="Intervu Logo" className="size-20 mr-1" />
          <span className="text-6xl font-bold text-app-primary truncate">
            Intervu
          </span>
        </button>
      </div>
      {/* Center/Right: Nav Buttons and User Menu */}
      <div className="flex items-center gap-2 relative ml-4" style={{ flexShrink: 0 }}>
        <NavButton icon={<AiFillHome size={24} />} alt="Home" onClick={() => navigate('/')} />
        <NavButton icon={<FaMapSigns size={24} />} alt="Roadmaps" onClick={() => navigate('/roadmaps')} />
        <NavButton icon={<FaFileAlt size={24} />} alt="Resume" onClick={handleResumeClick} />
        <NavButton icon={<MdWork size={24} />} alt="Job Dashboard" onClick={() => navigate('/dashboard')} />
        <NavButton icon={<FaRobot size={24} />} alt="Ai Interviewer" onClick={() => navigate('/ai-interviewer')} />
        {/* Dropdown Menu */}
        <div ref={menuRef} className="relative">
          <button
            className="w-12 h-12 rounded-full border-2 border-app-primary cursor-pointer flex items-center justify-center focus:outline-none bg-app-accent ml-1"
            onClick={() => setMenuOpen((v) => !v)}
            type="button"
          >
            <span style={{ fontSize: 22 }}>
              {(user?.username && user.username[0].toUpperCase()) || <FaUser/>}
            </span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 bg-white border border-app-primary rounded-lg shadow-lg z-50 p-2 min-w-[160px]">
              {user ? (
                <>
                  <button
                    className="dropdown-btn text-app-primary w-full text-left"
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/profile');
                    }}
                  >
                    {user.username}
                  </button>
                  <button
                    className="dropdown-btn w-full text-left"
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/questionnaire');
                    }}
                  >
                    Questionnaire
                  </button>
                  <button
                    className="dropdown-btn w-full text-left"
                    type="button"
                    onClick={handleAuthClick}
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <button
                  className="dropdown-btn w-full text-left"
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/signin');
                  }}
                >
                  Sign In
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <Modal
        open={showLogoutModal}
        message="Are you sure you want to log out?"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        confirmText="Log out"
        cancelText="Cancel"
      />
    </nav>
  );
};

export default Navbar;