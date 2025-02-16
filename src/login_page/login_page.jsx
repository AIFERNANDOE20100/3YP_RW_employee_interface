import React from "react";
import { Link } from "react-router-dom";
import "../login_page/login_page.css";
import InputField from "../components/InputField.jsx";

const Login = () => {
  return (
    <div className="login-container">
      <h2 className="form-title">Welcome! Please Log In</h2>

      <form action="#" className="login-form">
        <InputField type="email" placeholder="Email address" className="input-field" />
        <InputField type="password" placeholder="Password" className="input-field" />

        <a href="#" className="forgot-password-link">Forgot password?</a>
        <button type="submit" className="login-button">Log In</button>
      </form>

      <p className="signup-prompt">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;
