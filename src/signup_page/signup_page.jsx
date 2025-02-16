import React from "react";
import { Link } from "react-router-dom";
import "../signup_page/signup_page.css";
import InputField from "../components/InputField.jsx";

const Signup = () => {
  return (
    <div className="signup-container">
      <h2 className="form-title">Signup</h2>

      <form action="#" className="signup-form">
        <InputField type="text" placeholder="Full Name" className="input-field" />
        <InputField type="email" placeholder="Email Address" className="input-field" />
        <InputField type="password" placeholder="Password" className="input-field" />

        <button type="submit" className="signup-button">Signup</button>
      </form>

      <p className="login-prompt">
        Already have an account? <Link to="/">Login</Link>
      </p>
    </div>
  );
};

export default Signup;
