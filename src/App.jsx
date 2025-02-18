import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login_page/login_page.jsx";
import Signup from "./signup_page/signup_page.jsx";
import VideoFeedPage from "./video_feed_page/video_feed_page.jsx";
import Test from "./test.jsx"

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Video feed Route */}
        <Route path="/" element={<Test />} />

        {/* Login Page Route */}
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
