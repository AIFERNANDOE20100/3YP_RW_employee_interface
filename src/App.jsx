import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login_page/login_page.jsx";
import Signup from "./signup_page/signup_page.jsx";
import VideoFeedPage from "./video_feed_page/video_feed_page.jsx";
import RobotPage from "./robot_page/robot_page.jsx";
import { robots } from "./components/robot_profile_frame_components/robot_list.jsx"

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Video feed Route */}
        <Route path="/robot" element={<RobotPage items={robots} />} />

        {/* Login Page Route */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Signup Page Route */}
        <Route path="/signup" element={<Signup />} />

        {/* Video feed Route */}
        <Route path="/videofeed" element={<VideoFeedPage />} />
      </Routes>
    </Router>
  );
};

export default App;
