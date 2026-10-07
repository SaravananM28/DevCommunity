import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, Sparkles, Code2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onNavigateRegister, onSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, 'password123');
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '480px',
      margin: '60px auto',
      padding: '0 20px',
    }}>
      <div className="glass-panel" style={{ padding: '40px 34px', position: 'relative', overflow: 'hidden' }}>
        {/* Glow Header Rim */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
        }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <Code2 size={28} />
          </div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
            Welcome to DevConnect
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Sign in to expand your developer network
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            color: '#fb7185',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            marginBottom: '20px',
          }}>
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="username"
              required
              placeholder="you@developer.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="login-password">Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-subtle)',
                  padding: '6px',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '12px', height: '46px', fontSize: '0.95rem' }}
          >
            <LogIn size={16} />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Login Options */}
        <div style={{ marginTop: '28px', borderTop: '1px solid var(--glass-border)', paddingTop: '22px' }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '700',
            color: 'var(--text-subtle)',
            textAlign: 'center',
            marginBottom: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Instant Demo Sign In (1-Click)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('alice@devconnect.io')}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '9px 12px', justifyContent: 'flex-start' }}
            >
              <Sparkles size={13} color="#818cf8" />
              Alice (React/Spring)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('bob@devconnect.io')}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '9px 12px', justifyContent: 'flex-start' }}
            >
              <Sparkles size={13} color="#818cf8" />
              Bob (Architect)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('clara@devconnect.io')}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '9px 12px', justifyContent: 'flex-start' }}
            >
              <Sparkles size={13} color="#818cf8" />
              Clara (Frontend Lead)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('david@devconnect.io')}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '9px 12px', justifyContent: 'flex-start' }}
            >
              <Sparkles size={13} color="#818cf8" />
              David (Cloud DevOps)
            </button>
          </div>
        </div>

        {/* Link to Register */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <button
            onClick={onNavigateRegister}
            style={{ color: '#818cf8', fontWeight: '600', textDecoration: 'underline' }}
          >
            Create Developer Profile
          </button>
        </div>
      </div>
    </div>
  );
}
