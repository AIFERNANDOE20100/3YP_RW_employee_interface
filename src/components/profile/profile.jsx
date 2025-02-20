// ProfileIcon.jsx
import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, Settings, LogOut, Edit } from "lucide-react";
import "./profile.css";

const Profile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button onClick={toggleDropdown} className="profile-btn">
        <img
          src="src/assets/user_image.png"
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
          <div className="dropdown-item signout">
            <LogOut size={18} />
            <span>Sign Out</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
