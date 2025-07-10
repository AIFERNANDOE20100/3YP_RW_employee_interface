import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./login_page/login_page.jsx";
import Signup from "./signup_page/signup_page.jsx";
import VideoFeedPage from "./video_feed_page/video_feed_page.jsx";
import RobotPage from "./robot_page/robot_page.jsx";

const App = () => {
  return (
    <div className="app-container">
      {/* Floating Background Elements */}
      <div className="floating-elements">
        <div className="floating-circle"></div>
        <div className="floating-circle"></div>
        <div className="floating-circle"></div>
        <div className="floating-circle"></div>
        <div className="floating-circle"></div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <Router>
          <div className="page-enter">
            <Routes>
              {/* Video feed Route */}
              <Route path="/robot" element={<RobotPage />} />

              {/* Login Page Route */}
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />

              {/* Signup Page Route */}
              <Route path="/signup" element={<Signup />} />

              {/* Video feed Route */}
              <Route path="/videofeed" element={<VideoFeedPage />} />
            </Routes>
          </div>
        </Router>
      </div>
    </div>
  );
};

export default App;
