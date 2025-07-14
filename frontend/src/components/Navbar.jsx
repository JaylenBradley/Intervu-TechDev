import React, { useState, useRef, useEffect } from "react";
import NavButton from "./NavButton.jsx";

const homeIcon = "https://img.icons8.com/ios-filled/50/1F2937/home.png";
const aboutIcon = "https://img.icons8.com/ios-filled/50/1F2937/info.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="flex items-center justify-between px-6 py-3 shadow bg-app-background">
      <div className="flex items-center">
        <span className="text-4xl font-bold text-app-primary">
          Intervu
        </span>
      </div>
      <div className="flex items-center gap-2 relative" ref={menuRef}>
        <NavButton icon={homeIcon} alt="Home" onClick={() => alert("Home!")} />
        <NavButton icon={aboutIcon} alt="About" onClick={() => alert("About!")} />
        <button
          className="w-10 h-10 rounded-full border-2 border-app-primary flex items-center justify-center focus:outline-none bg-app-accent ml-2"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="text-lg text-app-primary font-bold">U</span>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-12 w-44 bg-app-accent rounded-xl shadow-2xl py-3 z-20 text-app-text border border-app-secondary">
            <button className="block w-full text-left px-5 py-2 hover:bg-app-secondary rounded-md transition">Profile</button>
            <button className="block w-full text-left px-5 py-2 hover:bg-app-secondary rounded-md transition">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;