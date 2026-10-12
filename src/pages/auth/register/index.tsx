import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: name,
          password: password,
        }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (!response.ok) {
        setErrorMsg(data.message || "Registration failed. Please try again.");
        return;
      }

      setSuccessMsg("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/auth/login");
      }, 1500);
    } catch {
      setIsLoading(false);
      setErrorMsg("Failed to connect to backend server. Make sure kidditag-api is running.");
    }
  };

  return (
    <>
      <div className="login-header">
        <h1 className="login-title">Create your account</h1>
        <p className="login-subtitle">
          Join thousands of parents keeping their children safe with smart QR tags.
        </p>
      </div>

      {errorMsg && (
        <div className="login-error-alert">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div 
          className="login-error-alert" 
          style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46" }}
        >
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="reg-name">Caregiver / Parent Name</label>
          <div className="input-with-icon">
            <User size={18} className="input-icon" />
            <input
              id="reg-name"
              type="text"
              placeholder="e.g. Sarah Sinclair"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reg-email">Email Address</label>
          <div className="input-with-icon">
            <Mail size={18} className="input-icon" />
            <input
              id="reg-email"
              type="email"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div className="form-label-row">
            <label htmlFor="reg-password">Password</label>
          </div>
          <div className="input-with-icon">
            <Lock size={18} className="input-icon" />
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <div className="form-label-row">
            <label htmlFor="reg-confirm-password">Confirm Password</label>
          </div>
          <div className="input-with-icon">
            <Lock size={18} className="input-icon" />
            <input
              id="reg-confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary login-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <span>Creating account...</span>
          ) : (
            <>
              <span>Create Free Account</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="login-divider">
        <span>or sign up with</span>
      </div>

      {/* Social Register Buttons */}
      <div className="social-login-grid">
        <button
          type="button"
          className="social-btn"
          onClick={() => navigate("/dashboard")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
            />
          </svg>
          <span>Google</span>
        </button>

        <button
          type="button"
          className="social-btn"
          onClick={() => navigate("/dashboard")}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.98.6-2.63 1.35-.57.65-1.07 1.72-.94 2.74 1.01.08 2.02-.49 2.64-1.24z" />
          </svg>
          <span>Apple</span>
        </button>
      </div>

      {/* Switch to Login Link */}
      <div style={{ textAlign: "center", marginTop: 18, fontSize: "0.86rem", color: "var(--text-muted)" }}>
        Already have an account?{" "}
        <Link to="/auth/login" className="link-highlight" style={{ fontWeight: 600 }}>
          Sign in →
        </Link>
      </div>
    </>
  );
}
