import React, { useState } from "react";
import "../login_page/login_page.css";
import { loginUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser(email, password);
      console.log("Login successful:", data);

      // Save restaurantId to localStorage
      localStorage.setItem("restaurantId", data.user.restaurantId);

      setSuccessMessage("Login successful! Redirecting...");

      setTimeout(() => {
        setSuccessMessage("");
        navigate("/robot"); // Redirect after login
      }, 3000);
    } catch (error) {
      setErrorMessage(error.message || "Invalid email or password");

      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  };

  return (
    <div className="login-container">
      <h2 className="form-title">WELCOME TO ROBOT WAITER! Please Log In</h2>

      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <a href="#" className="forgot-password-link">
          Forgot password?
        </a>

        <button type="submit" className="login-button">
          Log In
        </button>
      </form>

      {successMessage && <div className="popup success">{successMessage}</div>}
      {errorMessage && <div className="popup error">{errorMessage}</div>}

      <p className="signup-prompt">
        Don't have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
};

export default Login;
