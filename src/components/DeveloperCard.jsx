import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Check, 
  Clock, 
  MapPin, 
  X
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './SocialIcons';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function DeveloperCard({ 
  developer, 
  onConnectionChange, 
  onViewProfile,
  onRequireAuth 
}) {
  const { isAuthenticated, refreshPendingCount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(developer.connectionStatus || 'NONE');
  const [requestId, setRequestId] = useState(developer.connectionRequestId);

  // Sync state whenever props update (e.g. user switch, search, refetch)
  useEffect(() => {
    setLocalStatus(developer.connectionStatus || 'NONE');
    setRequestId(developer.connectionRequestId);
  }, [developer.connectionStatus, developer.connectionRequestId]);

  const skillsList = developer.skills 
    ? developer.skills.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const handleConnect = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onRequireAuth?.();
      return;
    }

    try {
      setLoading(true);
      const res = await api.sendConnectionRequest(developer.id);
      if (res.status === 'ACCEPTED') {
        setLocalStatus('CONNECTED');
      } else {
        setLocalStatus('PENDING_SENT');
      }
      setRequestId(res.id);
      await refreshPendingCount();
      onConnectionChange?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (e) => {
    e.stopPropagation();
    const targetReqId = requestId || developer.connectionRequestId;
    if (!targetReqId) {
      // If request ID is not attached directly, fetch from pending
      try {
        setLoading(true);
        const pending = await api.getPendingRequests();
        const match = pending.find(p => p.sender?.id === developer.id || p.senderId === developer.id);
        if (match) {
          await api.acceptConnectionRequest(match.id);
          setLocalStatus('CONNECTED');
          await refreshPendingCount();
          onConnectionChange?.();
          return;
        }
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      await api.acceptConnectionRequest(targetReqId);
      setLocalStatus('CONNECTED');
      await refreshPendingCount();
      onConnectionChange?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.stopPropagation();
    const targetReqId = requestId || developer.connectionRequestId;
    if (!targetReqId) return;
    try {
      setLoading(true);
      await api.rejectConnectionRequest(targetReqId);
      setLocalStatus('NONE');
      await refreshPendingCount();
      onConnectionChange?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="glass-panel"
      style={{
        padding: '26px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Banner Glass Glow Indicator */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: localStatus === 'CONNECTED' 
          ? 'linear-gradient(90deg, #10b981, #06b6d4)'
          : localStatus === 'PENDING_RECEIVED'
          ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
          : localStatus === 'PENDING_SENT'
          ? 'linear-gradient(90deg, #6366f1, #a855f7)'
          : 'linear-gradient(90deg, rgba(99, 102, 241, 0.4), rgba(139, 92, 246, 0.2))',
      }} />

      <div>
        {/* Header: Avatar, Name, Headline, Location */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
          <div 
            onClick={() => onViewProfile?.(developer)}
            style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}
          >
            <img
              src={developer.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${developer.name}`}
              alt={developer.name}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                objectFit: 'cover',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(20, 27, 45, 0.8)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
              }}
            />
            {localStatus === 'CONNECTED' && (
              <span 
                className="pulse-badge" 
                title="Connected Friend"
                style={{ position: 'absolute', bottom: -2, right: -2 }}
              />
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 
              onClick={() => onViewProfile?.(developer)}
              style={{
                fontSize: '1.15rem',
                fontWeight: '700',
                color: '#ffffff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => e.target.style.color = '#a5b4fc'}
              onMouseLeave={(e) => e.target.style.color = '#ffffff'}
            >
              {developer.name}
            </h3>

            <p style={{
              fontSize: '0.85rem',
              color: '#a5b4fc',
              fontWeight: '500',
              marginTop: '3px',
              lineHeight: '1.3',
            }}>
              {developer.headline || 'Software Developer'}
            </p>

            {developer.location && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.775rem',
                color: 'var(--text-subtle)',
                marginTop: '6px',
              }}>
                <MapPin size={13} color="#818cf8" />
                <span>{developer.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {developer.bio && (
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            marginBottom: '16px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.5',
          }}>
            {developer.bio}
          </p>
        )}

        {/* Skills Pills */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          marginBottom: '20px',
        }}>
          {skillsList.slice(0, 5).map((skill, i) => (
            <span key={i} className="badge-tech">
              {skill}
            </span>
          ))}
          {skillsList.length > 5 && (
            <span className="badge-tech" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-subtle)' }}>
              +{skillsList.length - 5}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Socials and Connect/Accept Action */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '16px',
        borderTop: '1px solid var(--glass-border)',
        marginTop: 'auto',
      }}>
        {/* Social Links */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {developer.githubUrl && (
            <a
              href={developer.githubUrl}
              target="_blank"
              rel="noreferrer"
              title="GitHub Profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-muted)',
                border: '1px solid var(--glass-border)',
                transition: 'all 0.2s ease',
              }}
            >
              <GithubIcon size={15} />
            </a>
          )}
          {developer.linkedinUrl && (
            <a
              href={developer.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              title="LinkedIn Profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-muted)',
                border: '1px solid var(--glass-border)',
                transition: 'all 0.2s ease',
              }}
            >
              <LinkedinIcon size={15} />
            </a>
          )}
        </div>

        {/* Action Button Depending on State */}
        <div>
          {localStatus === 'SELF' && (
            <span style={{
              fontSize: '0.8rem',
              color: 'var(--text-subtle)',
              fontStyle: 'italic',
              padding: '6px 12px',
            }}>
              Your Profile
            </span>
          )}

          {localStatus === 'CONNECTED' && (
            <span className="badge-status badge-connected">
              <Check size={14} />
              Connected Friend
            </span>
          )}

          {localStatus === 'PENDING_SENT' && (
            <span className="badge-status badge-pending">
              <Clock size={14} />
              Request Sent
            </span>
          )}

          {localStatus === 'PENDING_RECEIVED' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                disabled={loading}
                onClick={handleAccept}
                className="btn-success"
                title="Accept connection request"
                style={{ padding: '7px 14px', fontSize: '0.825rem' }}
              >
                <Check size={14} />
                {loading ? 'Accepting...' : 'Accept'}
              </button>
              <button
                disabled={loading}
                onClick={handleReject}
                className="btn-danger"
                title="Decline request"
                style={{ padding: '7px 10px', fontSize: '0.825rem' }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {localStatus === 'NONE' && (
            <button
              disabled={loading}
              onClick={handleConnect}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <UserPlus size={15} />
              {loading ? 'Sending...' : 'Connect'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
