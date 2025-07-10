import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/global.css";
import "../styles/animations.css";
import "../styles/components/forms.css";
import "../styles/components/buttons.css";
import "./LoginScreen.css";

export function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { login, register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setError("");

    try {
      if (isRegister) {
        await register(username, password);
      } else {
        await login(username, password);
      }
    } catch (error) {
      setError(isRegister ? "Registration failed!" : "Login failed!");
    }
  };

  return (
    <div className="login-screen">
      {/* Game Title/Logo Section */}
      <div className="game-header">
        <div className="game-logo">
          <div className="logo-icon">⚔️</div>
          <h1 className="game-title">
            <span className="title-primary">Picoen</span>
          </h1>
        </div>
      </div>

      {/* Login Card */}
      <div className="login-card">
        <div className="login-header">
          <h2>{isRegister ? "Create Account" : "Welcome Back"}</h2>
          <p className="login-subtitle">
            {isRegister ? "Start your adventure today" : "Continue your quest"}
          </p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                className="login-input"
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={isPasswordVisible ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="login-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                disabled={isLoading}
              >
                {isPasswordVisible ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="submit-button"
          >
            {isLoading ? (
              <span className="loading-content">
                <span className="loading-spinner"></span>
                {isRegister ? "Creating..." : "Logging in..."}
              </span>
            ) : (
              <span className="button-content">
                <span className="button-icon">{isRegister ? "✨" : "⚡"}</span>
                {isRegister ? "Start Adventure" : "Enter Game"}
              </span>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="switch-mode-text">
            {isRegister ? "Already have an account?" : "New to the adventure?"}
          </p>
          <button
            type="button"
            className="switch-mode-button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
            disabled={isLoading}
          >
            {isRegister ? "Sign In" : "Create Account"}
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="login-bg-elements">
        <div className="floating-element element-1">💎</div>
        <div className="floating-element element-2">⭐</div>
        <div className="floating-element element-3">🗡️</div>
        <div className="floating-element element-4">🛡️</div>
        <div className="floating-element element-5">🏆</div>
      </div>
    </div>
  );
}
