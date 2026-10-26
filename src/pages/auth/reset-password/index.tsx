import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../../../services/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing password reset token. Please request a new link.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please check again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/auth/login');
      }, 3500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password. Link may have expired.');
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
          Create New Password
        </h1>
        <p style={{ color: '#595573', fontSize: '0.92rem', margin: 0 }}>
          Your new password must be at least 6 characters long.
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
          <h3 style={{ color: '#14532d', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px' }}>
            Password Reset Successful!
          </h3>
          <p style={{ color: '#166534', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 16px' }}>
            Your account password has been updated. Redirecting you to login in a few seconds...
          </p>
          <Link to="/auth/login" className="btn-primary" style={{ display: 'inline-flex', textDecoration: 'none', padding: '10px 20px', fontSize: '0.9rem' }}>
            Login Now
          </Link>
        </div>
      ) : !token ? (
        <div style={{
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: 14,
          padding: 24,
          textAlign: 'center',
        }}>
          <AlertTriangle size={36} style={{ color: '#ea580c', margin: '0 auto 12px' }} />
          <h3 style={{ color: '#9a3412', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 8px' }}>
            Missing Recovery Token
          </h3>
          <p style={{ color: '#c2410c', fontSize: '0.88rem', margin: '0 0 16px' }}>
            Please click the exact link sent to your email or request a new one below.
          </p>
          <Link to="/auth/forgot-password" className="btn-primary" style={{ display: 'inline-flex', textDecoration: 'none', padding: '10px 20px', fontSize: '0.9rem' }}>
            Request New Link
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

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#140d3a', marginBottom: 8 }}>
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="dash-input"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  borderRadius: 12,
                  border: '1px solid #e7e2f5',
                  fontSize: '0.95rem',
                }}
                required
              />
              <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8d89a5' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#8d89a5',
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#140d3a', marginBottom: 8 }}>
              Confirm New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="dash-input"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: 12,
                  border: '1px solid #e7e2f5',
                  fontSize: '0.95rem',
                }}
                required
              />
              <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8d89a5' }} />
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
                <span>Saving Password...</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
