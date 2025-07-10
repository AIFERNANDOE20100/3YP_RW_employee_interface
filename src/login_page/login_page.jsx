import React, { useState } from "react";
import "../login_page/login_page.css";
import { loginUser, requestPasswordReset } from "../services/authService";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [status, setStatus] = useState({ loading: false });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus({ loading: true });
    try {
      const data = await loginUser(email, password);
      console.log("Login successful:", data);
      console.log("tokennnnnn", data.user.token);
      // Save restaurantId and awsAccessKey to localStorage
      localStorage.setItem("restaurantId", data.user.restaurantId);
      localStorage.setItem("userId", data.user.uid);
      localStorage.setItem("awsAccessKey", data.user.awsAccessKey);
      localStorage.setItem("awsSecretKey", data.user.awsSecretKey);
      localStorage.setItem("awsSessionToken", data.user.awsSessionToken);  
      localStorage.setItem("awsRegion", data.user.awsRegion);
      localStorage.setItem("awsHost", data.user.awsHost);
      localStorage.setItem("topic", data.user.topic);
      localStorage.setItem("token", data.user.token);
      //user: {
      //   uid: localId,
      //   email,
      //   token: idToken,
      //   restaurantId,
      //   awsAccessKey: AWS.config.credentials.accessKeyId,
      //   awsSecretKey: AWS.config.credentials.secretAccessKey,
      //   awsSessionToken: AWS.config.credentials.sessionToken,
      //   awsRegion: process.env.AWS_REGION,
      //   awsHost: process.env.AWS_IOT_ENDPOINT,
      // },

      setSuccessMessage("Login successful! Redirecting...");
      setTimeout(() => {
        setSuccessMessage("");
        setStatus({ loading: false });
        navigate("/robot"); // Redirect after login
      }, 3000);
    } catch (error) {
      setErrorMessage(error.message || "Invalid email or password");
      setStatus({ loading: false });
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMessage("Please enter your email address.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    try {
      await requestPasswordReset(email);
      setSuccessMessage("Password reset email sent. Check your inbox.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  return (
    <div className="login-page-center-wrapper">
      <div className="login-container">
        <h2 className="login-form-title">WELCOME TO ROBOT WAITER! Please Log In</h2>

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

        <a
          href="#"
          className="forgot-password-link"
          onClick={(e) => {
            e.preventDefault();
            handleForgotPassword();
          }}
        >
          Forgot password?
        </a>

          <button type="submit" className="login-button" disabled={status.loading}>
            {status.loading ? 'Loging in...' : 'Log In'}
          </button>
        </form>

        {/* {successMessage && <div className="popup success">{successMessage}</div>} */}
        {errorMessage && <div className="popup error">{errorMessage}</div>}
      </div>
    </div>
  );
};

export default Login;
