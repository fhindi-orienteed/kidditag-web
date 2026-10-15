import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import api from "../../../services/api";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const hasRequested = useRef(false);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setIsSuccess(false);
      setMessage("Verification token is missing. Please check the link from your email.");
      return;
    }

    if (hasRequested.current) return;
    hasRequested.current = true;

    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        setIsSuccess(true);
        setMessage(res.data?.message || "Your email has been verified successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/auth/login");
        }, 2500);
      } catch (err: any) {
        setIsSuccess(false);
        setMessage(err.message || "Failed to verify email. The link may have expired or is invalid.");
      } finally {
        setIsLoading(false);
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div style={{ textAlign: "center", padding: "16px 0" }}>
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <Loader2 size={44} className="animate-spin" style={{ color: "var(--primary-color, #4F46E5)" }} />
          <h2 className="login-title">Verifying your email...</h2>
          <p className="login-subtitle">Please wait while we activate your account.</p>
        </div>
      ) : isSuccess ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#ecfdf5",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle2 size={36} />
          </div>
          <h2 className="login-title">Email Verified!</h2>
          <p className="login-subtitle">{message}</p>
          <Link
            to="/auth/login"
            className="btn-primary login-submit-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 16,
              textDecoration: "none",
            }}
          >
            <span>Proceed to Login</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#fef2f2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertCircle size={36} />
          </div>
          <h2 className="login-title">Verification Failed</h2>
          <p className="login-subtitle" style={{ color: "#dc2626" }}>
            {message}
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <Link
              to="/auth/login"
              className="btn-primary login-submit-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                textDecoration: "none",
              }}
            >
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
