import React, { useState, useEffect, useCallback } from 'react';
import { 
  FolderGit2, 
  Plus, 
  ExternalLink, 
  Trash2, 
  Sparkles, 
  X,
  Code2,
  Search,
  AlertTriangle
} from 'lucide-react';
import { GithubIcon } from '../components/SocialIcons';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ProjectsPage({ onRequireAuth, onViewProfile }) {
  const { user, isAuthenticated } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: '',
    repoUrl: '',
    liveUrl: '',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects, user?.id, user?.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onRequireAuth?.();
      return;
    }

    try {
      setSubmitting(true);
      const created = await api.createProject(formData);
      setShowModal(false);
      setFormData({ title: '', description: '', techStack: '', repoUrl: '', liveUrl: '' });
      showToast('🎉 Project successfully published to the community!');
      
      // Optimistically prepend or reload
      if (created) {
        setProjects(prev => [created, ...prev.filter(p => p.id !== created.id)]);
      }
      await loadProjects();
    } catch (err) {
      alert(err.message || 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      setDeleting(true);
      const idToDelete = projectToDelete.id;
      // Optimistic instant removal from UI
      setProjects(prev => prev.filter(p => p.id !== idToDelete));
      setProjectToDelete(null);

      await api.deleteProject(idToDelete);
      showToast('Project deleted successfully.');
      await loadProjects();
    } catch (err) {
      alert(err.message || 'Failed to delete project.');
      await loadProjects();
    } finally {
      setDeleting(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.techStack?.toLowerCase().includes(q) ||
      p.authorName?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px 20px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="glass-toast">
          <Sparkles size={18} color="#10b981" />
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '32px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              padding: '10px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
            }}>
              <FolderGit2 size={24} />
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
              Community Projects & Initiatives
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Discover open-source software initiatives and collaborate with talented developers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => {
              if (!isAuthenticated) onRequireAuth?.();
              else setShowModal(true);
            }}
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: '0.95rem' }}
          >
            <Plus size={19} />
            Publish Project
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '28px',
        flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '480px' }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search projects by title, stack, author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '42px', height: '44px', fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
          Showing <strong>{filteredProjects.length}</strong> of {projects.length} initiatives
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
          <div className="pulse-badge" style={{ width: '12px', height: '12px', margin: '0 auto 12px' }} />
          <p>Loading community projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <FolderGit2 size={44} color="#6366f1" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '8px' }}>
            {projects.length === 0 ? 'No projects published yet' : 'No matching projects found'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginBottom: '22px', maxWidth: '440px', margin: '0 auto 22px' }}>
            {projects.length === 0 
              ? 'Be the first developer to showcase your work and invite collaborators!'
              : 'Try clearing your search query to see all community software projects.'}
          </p>
          <button
            onClick={() => {
              if (projects.length === 0) {
                if (!isAuthenticated) onRequireAuth?.();
                else setShowModal(true);
              } else {
                setSearchQuery('');
              }
            }}
            className="btn-primary"
          >
            {projects.length === 0 ? <Plus size={16} /> : <Search size={16} />}
            {projects.length === 0 ? 'Publish First Project' : 'Clear Filter'}
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '26px',
        }}>
          {filteredProjects.map((proj) => {
            const techList = proj.techStack ? proj.techStack.split(',').map(t => t.trim()).filter(Boolean) : [];
            
            // Robust owner verification checking both ID and email
            const isOwner = Boolean(
              user && (
                (user.id && (user.id === proj.userId || String(user.id) === String(proj.userId))) ||
                (user.email && proj.authorEmail && user.email.toLowerCase() === proj.authorEmail.toLowerCase())
              )
            );

            return (
              <div
                key={proj.id}
                className="glass-panel"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: isOwner ? '3px solid #10b981' : '3px solid #6366f1',
                }}
              >
                <div>
                  {/* Author Row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                  }}>
                    <div 
                      onClick={() => {
                        if (proj.userId) {
                          onViewProfile?.({ id: proj.userId, name: proj.authorName });
                        }
                      }}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        cursor: proj.userId ? 'pointer' : 'default',
                      }}
                      title={proj.userId ? `View ${proj.authorName}'s Profile` : undefined}
                    >
                      <img
                        src={proj.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${proj.authorName}`}
                        alt={proj.authorName}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '12px',
                          objectFit: 'cover',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                      <div>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '700', 
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                        }}>
                          <span style={{ 
                            textDecoration: proj.userId ? 'underline' : 'none', 
                            textDecorationColor: 'transparent', 
                            transition: 'color 0.2s' 
                          }}>
                            {proj.authorName}
                          </span>
                          {isOwner && (
                            <span style={{
                              marginLeft: '6px',
                              fontSize: '0.675rem',
                              color: '#34d399',
                              background: 'rgba(16, 185, 129, 0.12)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              padding: '1px 6px',
                              borderRadius: '6px',
                              fontWeight: '600',
                            }}>
                              YOU
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>
                          {proj.authorHeadline || 'Developer'}
                        </div>
                      </div>
                    </div>

                    {isOwner && (
                      <button
                        onClick={() => setProjectToDelete(proj)}
                        title="Delete project"
                        className="btn-danger"
                        style={{
                          padding: '6px 10px',
                          fontSize: '0.75rem',
                          borderRadius: '8px',
                        }}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', marginBottom: '8px', lineHeight: '1.3' }}>
                    {proj.title}
                  </h3>

                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                    lineHeight: '1.55',
                    marginBottom: '18px',
                  }}>
                    {proj.description}
                  </p>

                  {/* Tech stack */}
                  {techList.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                      {techList.map((t, idx) => (
                        <span key={idx} className="badge-tech">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Links */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  borderTop: '1px solid var(--glass-border)',
                  paddingTop: '16px',
                }}>
                  {proj.repoUrl && (
                    <a
                      href={proj.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary"
                      style={{ padding: '8px 14px', fontSize: '0.825rem', flex: 1 }}
                    >
                      <GithubIcon size={15} />
                      Repository
                    </a>
                  )}
                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary"
                      style={{ padding: '8px 14px', fontSize: '0.825rem', flex: 1 }}
                    >
                      <ExternalLink size={15} />
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog for Project Deletion */}
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
              maxWidth: '460px',
              padding: '28px',
              background: 'rgba(18, 24, 40, 0.92)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#fb7185' }}>
              <div style={{
                padding: '10px',
                borderRadius: '12px',
                background: 'rgba(244, 63, 94, 0.15)',
              }}>
                <AlertTriangle size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' }}>
                Confirm Project Deletion
              </h3>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '22px' }}>
              Are you sure you want to permanently delete <strong>"{projectToDelete.title}"</strong>? This initiative will be removed from DevConnect.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="btn-danger"
                style={{ padding: '10px 20px' }}
              >
                <Trash2 size={15} />
                {deleting ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Project Glass Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div 
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '580px',
              padding: '34px',
              position: 'relative',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
            }}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '22px',
                right: '22px',
                color: 'var(--text-muted)',
                padding: '6px',
                borderRadius: '8px',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
              <div style={{
                padding: '8px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#818cf8',
              }}>
                <Code2 size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#ffffff' }}>
                  Publish Community Project
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Share your software project and invite fellow developers to contribute
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Task Queue"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your architecture, problem solved, and collaboration goals..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-control"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Spring Boot, MySQL, Redis, Docker"
                  value={formData.techStack}
                  onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">GitHub Repository URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={formData.repoUrl}
                    onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Live Demo URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.liveUrl}
                    onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '26px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ padding: '10px 22px' }}
                >
                  {submitting ? 'Publishing...' : 'Publish to DevConnect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
