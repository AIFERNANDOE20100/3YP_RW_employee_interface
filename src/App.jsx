import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login_page/login_page.jsx";
import Signup from "./signup_page/signup_page.jsx";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Home Route: Shows the Login Page */}
        <Route path="/" element={<Login />} />

        {/* Signup Page Route */}
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
};

export default App;
