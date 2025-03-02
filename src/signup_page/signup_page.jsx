import React, { useState } from "react";
import "../signup_page/signup_page.css";
import { signupUser } from "../services/authService"; // Import the signup service

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the form from submitting

    try {
      console.log("Email value before submission:", email);
      const data = await signupUser(fullName, email, password);
      console.log("Signup successful:", data);

      // Show success message
      setSuccessMessage("Signup successful! Redirecting...");

      // Hide message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
        window.location.href = "/login"; // Redirect to login page
      }, 3000);
    } catch (error) {
      console.log("Email value before submission:", email);
      setErrorMessage(error.message || "An error occurred during signup");

      // Hide error message after 3 seconds
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  };

  return (
    <div className="signup-container">
      <h2 className="form-title">Signup</h2>

      <form onSubmit={handleSubmit} className="signup-form">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="signup-button">
          Signup
        </button>
      </form>

      {/* Success Popup */}
      {successMessage && <div className="popup success">{successMessage}</div>}

      {/* Error Popup */}
      {errorMessage && <div className="popup error">{errorMessage}</div>}
    </div>
  );
};

export default Signup;
