import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import api from '../../../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: 460, margin: '0 auto' }}>
      <div className="auth-header" style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          width: 54,
          height: 54,
          borderRadius: 16,
          background: '#f4f0ff',
          color: '#582be8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <ShieldCheck size={28} />
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#140d3a', margin: '0 0 8px' }}>
          Reset Password
        </h1>
        <p style={{ color: '#595573', fontSize: '0.92rem', margin: 0 }}>
          Enter the email associated with your KiddiTag account and we'll send you a recovery link.
        </p>
      </div>

      {success ? (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 14,
          padding: 24,
          textAlign: 'center',
        }}>
          <CheckCircle2 size={40} style={{ color: '#16a34a', margin: '0 auto 12px' }} />
          <h3 style={{ color: '#14532d', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px' }}>
            Recovery Link Sent!
          </h3>
          <p style={{ color: '#166534', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 20px' }}>
            If an account exists for <strong>{email}</strong>, you will receive an email shortly with instructions to reset your password.
          </p>
          <Link to="/auth/login" className="btn-primary" style={{ display: 'inline-flex', textDecoration: 'none', padding: '10px 20px', fontSize: '0.9rem' }}>
            Return to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 14px',
              borderRadius: 10,
              fontSize: '0.85rem',
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#140d3a', marginBottom: 8 }}>
              Account Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="dash-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: 12,
                  border: '1px solid #e7e2f5',
                  fontSize: '0.95rem',
                }}
                required
              />
              <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8d89a5' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: 12,
              fontSize: '1rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>Sending link...</span>
              </>
            ) : (
              <span>Send Reset Link</span>
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link to="/auth/login" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#582be8',
              fontSize: '0.88rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}>
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
