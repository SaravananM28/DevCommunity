import React, { useState } from 'react';
import { UserPlus, Eye, EyeOff, Sparkles, Code2, AlertCircle, Wand2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage({ onNavigateLogin, onSuccess }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    headline: '',
    skills: '',
    location: '',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(formData);
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    const randomId = Math.floor(Math.random() * 900) + 100;
    setFormData({
      name: `Developer Alex #${randomId}`,
      email: `alex${randomId}@devconnect.io`,
      password: 'password123',
      headline: 'Full-Stack Developer | React & Spring Boot Specialist',
      skills: 'React, Spring Boot, MySQL, Java, Docker, REST API',
      location: 'Berlin, Germany',
      bio: 'Enthusiastic full-stack engineer looking to connect with peers, collaborate on open-source initiatives, and exchange ideas.',
      githubUrl: 'https://github.com/developer-alex',
      linkedinUrl: 'https://linkedin.com/in/developer-alex',
    });
  };

  return (
    <div style={{
      maxWidth: '580px',
      margin: '40px auto 60px',
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
          background: 'linear-gradient(90deg, #6366f1, #a855f7, #06b6d4)',
        }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
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
            Join DevConnect
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Create your professional developer profile and start connecting
          </p>

          <button
            type="button"
            onClick={handleFillDemo}
            className="btn-secondary"
            style={{
              fontSize: '0.8rem',
              padding: '7px 14px',
              margin: '14px auto 0',
              borderColor: 'rgba(99, 102, 241, 0.45)',
              color: '#c7d2fe',
              background: 'rgba(99, 102, 241, 0.12)',
            }}
          >
            <Wand2 size={13} color="#818cf8" />
            Quick-Fill Demo Profile
          </button>
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name *</label>
              <input
                id="reg-name"
                type="text"
                name="name"
                required
                placeholder="Ada Lovelace"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address *</label>
              <input
                id="reg-email"
                type="email"
                name="email"
                autoComplete="username"
                required
                placeholder="ada@devconnect.io"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password * (Min 6 chars)</label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="new-password"
                autoComplete="new-password"
                required
                minLength={6}
                placeholder="Create a secure password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

          <div className="form-group">
            <label className="form-label" htmlFor="reg-headline">Professional Headline *</label>
            <input
              id="reg-headline"
              type="text"
              required
              placeholder="e.g. Full-Stack Engineer | React & Spring Boot"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-skills">Tech Stack & Skills * (comma-separated)</label>
            <input
              id="reg-skills"
              type="text"
              required
              placeholder="e.g. React, Spring Boot, MySQL, Java, Docker, REST API"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="form-control"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-location">Location</label>
              <input
                id="reg-location"
                type="text"
                placeholder="e.g. San Francisco, CA"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-github">GitHub Profile URL</label>
              <input
                id="reg-github"
                type="url"
                placeholder="https://github.com/..."
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-bio">Developer Bio & About</label>
            <textarea
              id="reg-bio"
              rows={2}
              placeholder="Tell other developers what you are passionate about and what projects you want to build..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="form-control"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '12px', height: '46px', fontSize: '0.95rem' }}
          >
            <UserPlus size={16} />
            {loading ? 'Creating Account & Profile...' : 'Complete Registration'}
          </button>
        </form>

        {/* Link to Login */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button
            onClick={onNavigateLogin}
            style={{ color: '#818cf8', fontWeight: '600', textDecoration: 'underline' }}
          >
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
}
