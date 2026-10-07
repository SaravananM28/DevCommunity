import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Edit3, 
  Save, 
  Sparkles, 
  FolderGit2, 
  ExternalLink,
  Trash2,
  UserPlus,
  Check,
  Clock,
  X,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/SocialIcons';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function ProfilePage({ viewedDeveloperId, onBack }) {
  const { user: currentUser, updateProfile, refreshPendingCount } = useAuth();
  const [profile, setProfile] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deletingProject, setDeletingProject] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);

  const isOwnProfile = !viewedDeveloperId || viewedDeveloperId === currentUser?.id;

  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    bio: '',
    skills: '',
    location: '',
    githubUrl: '',
    linkedinUrl: '',
    avatarUrl: '',
  });

  const loadProfile = async () => {
    if (isOwnProfile && currentUser) {
      setProfile(currentUser);
      setFormData({
        name: currentUser.name || '',
        headline: currentUser.headline || '',
        bio: currentUser.bio || '',
        skills: currentUser.skills || '',
        location: currentUser.location || '',
        githubUrl: currentUser.githubUrl || '',
        linkedinUrl: currentUser.linkedinUrl || '',
        avatarUrl: currentUser.avatarUrl || '',
      });

      try {
        const projs = await api.getProjectsByUser(currentUser.id);
        setUserProjects(projs || []);
      } catch (err) {
        console.error(err);
      }
    } else if (viewedDeveloperId) {
      try {
        const data = await api.getDeveloper(viewedDeveloperId);
        setProfile(data);
        const projs = await api.getProjectsByUser(viewedDeveloperId);
        setUserProjects(projs || []);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    loadProfile();
  }, [viewedDeveloperId, currentUser?.id, currentUser?.email, isOwnProfile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await updateProfile(formData);
      setProfile(updated);
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      setDeletingProject(true);
      const id = projectToDelete.id;
      // Optimistic update
      setUserProjects(prev => prev.filter(p => p.id !== id));
      setProjectToDelete(null);

      await api.deleteProject(id);
      setSuccessMsg('Project deleted successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to delete project.');
      loadProfile();
    } finally {
      setDeletingProject(false);
    }
  };

  // Connection actions from profile
  const handleConnect = async () => {
    if (!profile) return;
    try {
      setConnectLoading(true);
      const res = await api.sendConnectionRequest(profile.id);
      if (res.status === 'ACCEPTED') {
        setProfile(prev => ({ ...prev, connectionStatus: 'CONNECTED' }));
      } else {
        setProfile(prev => ({ ...prev, connectionStatus: 'PENDING_SENT', connectionRequestId: res.id }));
      }
      await refreshPendingCount();
    } catch (err) {
      alert(err.message);
    } finally {
      setConnectLoading(false);
    }
  };

  const handleAcceptConnection = async () => {
    if (!profile) return;
    try {
      setConnectLoading(true);
      const reqId = profile.connectionRequestId;
      if (reqId) {
        await api.acceptConnectionRequest(reqId);
      } else {
        const pending = await api.getPendingRequests();
        const match = pending.find(p => p.sender?.id === profile.id || p.senderId === profile.id);
        if (match) await api.acceptConnectionRequest(match.id);
      }
      setProfile(prev => ({ ...prev, connectionStatus: 'CONNECTED' }));
      await refreshPendingCount();
      setSuccessMsg(`🎉 You are now connected with ${profile.name}!`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      alert(err.message);
    } finally {
      setConnectLoading(false);
    }
  };

  const handleRejectConnection = async () => {
    if (!profile || !profile.connectionRequestId) return;
    try {
      setConnectLoading(true);
      await api.rejectConnectionRequest(profile.connectionRequestId);
      setProfile(prev => ({ ...prev, connectionStatus: 'NONE', connectionRequestId: null }));
      await refreshPendingCount();
    } catch (err) {
      alert(err.message);
    } finally {
      setConnectLoading(false);
    }
  };

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
        <div className="pulse-badge" style={{ width: '12px', height: '12px', margin: '0 auto 12px' }} />
        Loading developer profile...
      </div>
    );
  }

  const skillsList = profile.skills ? profile.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '36px 20px' }}>
      {/* Back Navigation Bar (when viewing another user's profile or via separate link) */}
      {onBack && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={onBack}
            className="btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              fontSize: '0.875rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--glass-border)',
              color: '#c7d2fe',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>
      )}

      {/* Profile Card Header */}
      <div className="glass-panel" style={{ padding: '36px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #6366f1, #a855f7, #06b6d4)',
        }} />

        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: '26px',
          flexWrap: 'wrap',
        }}>
          <img
            src={profile.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.name}`}
            alt={profile.name}
            style={{
              width: '108px',
              height: '108px',
              borderRadius: '24px',
              objectFit: 'cover',
              border: '2px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
              background: 'rgba(20, 27, 45, 0.8)',
            }}
          />

          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontSize: '1.9rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
                  {profile.name}
                </h1>
                <p style={{ fontSize: '1.05rem', color: '#a5b4fc', fontWeight: '600', marginTop: '2px' }}>
                  {profile.headline || 'Developer'}
                </p>
              </div>

              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={isEditing ? 'btn-secondary' : 'btn-primary'}
                  style={{ padding: '8px 18px', fontSize: '0.875rem' }}
                >
                  <Edit3 size={15} />
                  {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                </button>
              ) : (
                /* Relationship actions when viewing someone else's profile */
                <div>
                  {profile.connectionStatus === 'CONNECTED' && (
                    <span className="badge-status badge-connected">
                      <Check size={15} />
                      Connected Friend
                    </span>
                  )}
                  {profile.connectionStatus === 'PENDING_SENT' && (
                    <span className="badge-status badge-pending">
                      <Clock size={15} />
                      Request Sent
                    </span>
                  )}
                  {profile.connectionStatus === 'PENDING_RECEIVED' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        disabled={connectLoading}
                        onClick={handleAcceptConnection}
                        className="btn-success"
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        <Check size={15} />
                        {connectLoading ? 'Accepting...' : 'Accept Request'}
                      </button>
                      <button
                        disabled={connectLoading}
                        onClick={handleRejectConnection}
                        className="btn-danger"
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  )}
                  {(!profile.connectionStatus || profile.connectionStatus === 'NONE') && (
                    <button
                      disabled={connectLoading}
                      onClick={handleConnect}
                      className="btn-primary"
                      style={{ padding: '8px 18px', fontSize: '0.875rem' }}
                    >
                      <UserPlus size={15} />
                      {connectLoading ? 'Sending...' : 'Connect'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {profile.location && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-subtle)',
                fontSize: '0.875rem',
                marginTop: '10px',
              }}>
                <MapPin size={15} color="#818cf8" />
                <span>{profile.location}</span>
              </div>
            )}

            {/* Social Links */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.825rem' }}
                >
                  <GithubIcon size={14} />
                  GitHub
                </a>
              )}
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.825rem' }}
                >
                  <LinkedinIcon size={14} />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div style={{
            marginTop: '20px',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.18)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Sparkles size={16} />
            {successMsg}
          </div>
        )}

        {/* Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} style={{ marginTop: '28px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '18px', fontWeight: '700' }}>
              Edit Profile Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Professional Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Full-Stack Engineer | React & Spring Boot"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">About & Bio</label>
              <textarea
                rows={3}
                placeholder="Share your engineering background, tech interests, and collaboration goals..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tech Skills (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. React, Spring Boot, MySQL, Java, Docker, AWS"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="form-control"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">GitHub URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">LinkedIn URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Avatar Image URL (leave blank to generate)</label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                className="form-control"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ marginTop: '28px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
            {profile.bio && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
                  About
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.65', fontSize: '0.95rem' }}>
                  {profile.bio}
                </p>
              </div>
            )}

            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '10px' }}>
                Technical Skills & Tools
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {skillsList.map((skill, i) => (
                  <span key={i} className="badge-tech" style={{ padding: '6px 14px', fontSize: '0.825rem' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Projects by Developer Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <FolderGit2 size={22} color="#818cf8" />
          <h2 style={{ fontSize: '1.45rem', fontWeight: '700', color: '#ffffff' }}>
            Published Projects ({userProjects.length})
          </h2>
        </div>

        {userProjects.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ color: 'var(--text-muted)' }}>
              No projects published yet.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '22px',
          }}>
            {userProjects.map((proj) => {
              const tech = proj.techStack ? proj.techStack.split(',').map(t => t.trim()).filter(Boolean) : [];
              return (
                <div 
                  key={proj.id} 
                  className="glass-panel" 
                  style={{
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', lineHeight: '1.3' }}>
                        {proj.title}
                      </h3>
                      {isOwnProfile && (
                        <button
                          onClick={() => setProjectToDelete(proj)}
                          title="Delete Project"
                          className="btn-danger"
                          style={{ padding: '5px 8px', borderRadius: '6px' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.5' }}>
                      {proj.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px' }}>
                      {tech.map((t, idx) => (
                        <span key={idx} className="badge-tech" style={{ fontSize: '0.725rem' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--glass-border)', paddingTop: '14px' }}>
                    {proj.repoUrl && (
                      <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.775rem', flex: 1 }}>
                        <GithubIcon size={14} /> Repo
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.775rem', flex: 1 }}>
                        <ExternalLink size={14} /> Demo
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Project Deletion from Profile */}
      {projectToDelete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px',
        }}>
          <div 
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '28px',
              background: 'rgba(18, 24, 40, 0.94)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#fb7185' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' }}>
                Delete Project?
              </h3>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '22px' }}>
              Are you sure you want to delete <strong>"{projectToDelete.title}"</strong> from your profile and DevConnect?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="btn-secondary"
                disabled={deletingProject}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProject}
                disabled={deletingProject}
                className="btn-danger"
                style={{ padding: '10px 18px' }}
              >
                <Trash2 size={15} />
                {deletingProject ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
