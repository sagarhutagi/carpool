import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/auth";

const AuthPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false); // 1. Add loading state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setIsLoading(true); // 2. Set loading to true before the API call

    const endpoint = isLoginView ? "/login" : "/register";
    try {
      const response = await axios.post(`${API_URL}${endpoint}`, {
        username,
        password,
      });

      if (isLoginView) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userName", response.data.name);
        navigate("/");
      } else {
        setMessage({ type: "success", text: response.data.message });
        setIsLoginView(true);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "An error occurred.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setIsLoading(false); // 3. Set loading to false after the API call finishes
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLoginView ? "Login" : "Register"}</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="PRN or SRN"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}
        {/* 4. Update the button to be disabled and show loading text */}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : isLoginView ? "Login" : "Register"}
        </button>
      </form>
      <button
        className="toggle-link"
        onClick={() => setIsLoginView(!isLoginView)}
        disabled={isLoading}
      >
        {isLoginView
          ? "Need an account? Register"
          : "Already have an account? Login"}
      </button>
    </div>
  );
};

export default AuthPage;
