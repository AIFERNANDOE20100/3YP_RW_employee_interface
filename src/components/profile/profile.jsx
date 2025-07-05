import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, Settings, LogOut, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import "./profile.css";

const Profile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      const uid = localStorage.getItem("userId");
      if (!uid) {
        console.error("UID not found");
        return;
      }

      // Call backend to revoke token
      await api.post("/api/auth/logout", { uid });

      // Clear all local user data
      localStorage.clear();

      // Redirect to login
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button onClick={toggleDropdown} className="profile-btn">
        <img
          src="https://img.icons8.com/?size=96&id=13042&format=png"
          alt="Profile"
          className="profile-img"
        />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-item">
            <User size={18} />
            <span>Profile Details</span>
          </div>
          <div className="dropdown-item">
            <Edit size={18} />
            <span>Edit Details</span>
          </div>
          <div className="dropdown-item">
            <Settings size={18} />
            <span>Settings</span>
          </div>
          <div className="dropdown-item signout" onClick={handleSignOut}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
