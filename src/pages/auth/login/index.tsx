import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [is2FA, setIs2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      if (is2FA) {
        // Verify 2FA code
        const res = await api.post("/auth/2fa/verify-login", {
          tempToken,
          code: twoFactorCode,
        });

        setIsLoading(false);
        const data = res.data;
        login(data.token, data.user);
        navigate("/dashboard");
        return;
      }

      // Standard Login
      const res = await api.post("/auth/login", {
        userName: email,
        password: password,
      });

      const data = res.data;
      setIsLoading(false);

      if (data.requires2FA) {
        setIs2FA(true);
        setTempToken(data.tempToken);
        setErrorMsg("");
        return;
      }

      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || "Login failed. Please check your credentials.");
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    setErrorMsg("");
    setIsLoading(true);
    try {
      const res = await api.post("/auth/google", { idToken });
      const data = res.data;
      setIsLoading(false);

      if (data.requires2FA) {
        setIs2FA(true);
        setTempToken(data.tempToken);
        return;
      }

      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || "Google login failed.");
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      (window as any).google?.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          handleGoogleLogin(response.credential);
        },
      });
    };
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <div className="login-header">
        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">
          Sign in to manage your child's KiddieTag profiles and view instant scan alerts.
        </p>
      </div>

      {errorMsg && (
        <div className="login-error-alert">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="login-form">
        {is2FA ? (
          <div className="form-group">
            <label htmlFor="login-2fa">Enter 6-Digit 2FA Code</label>
            <div className="input-with-icon">
              <ShieldCheck size={18} className="input-icon" />
              <input
                id="login-2fa"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="login-email">Username or Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="login-email"
                  type="text"
                  placeholder="Username or Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="login-password">Password</label>
              </div>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
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
          </>
        )}

        <button
          type="submit"
          className="btn-primary login-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <span>{is2FA ? "Verifying Code..." : "Signing in..."}</span>
          ) : (
            <>
              <span>{is2FA ? "Verify 2FA Code" : "Sign In to Dashboard"}</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="login-divider">
        <span>or continue with</span>
      </div>

      {/* Social Login Buttons */}
      <div className="social-login-grid">
        <button
          type="button"
          className="social-btn"
          onClick={() => (window as any).google?.accounts.id.prompt()}
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

      {/* Switch to Register Link */}
      <div style={{ textAlign: "center", marginTop: 18, fontSize: "0.86rem", color: "var(--text-muted)" }}>
        Don't have an account?{" "}
        <Link to="/auth/register" className="link-highlight" style={{ fontWeight: 600 }}>
          Create an account →
        </Link>
      </div>
    </>
  );
}
