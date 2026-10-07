import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserCheck, 
  Inbox, 
  Send, 
  Check, 
  X, 
  Trash2, 
  MapPin, 
  Sparkles,
  Users,
  Clock
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/SocialIcons';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function NetworkPage({ onViewProfile }) {
  const { user, refreshPendingCount } = useAuth();
  const [subTab, setSubTab] = useState('friends'); // 'friends' | 'pending' | 'sent'
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [friendsRes, pendingRes, sentRes] = await Promise.all([
        api.getFriends(),
        api.getPendingRequests(),
        api.getSentRequests(),
      ]);
      setFriends(friendsRes || []);
      setPendingRequests(pendingRes || []);
      setSentRequests(sentRes || []);
      await refreshPendingCount();

      // If user has incoming requests and 0 friends, automatically help them notice
      if (pendingRes && pendingRes.length > 0 && (!friendsRes || friendsRes.length === 0)) {
        setSubTab('pending');
      }
    } catch (err) {
      console.error('Failed to load network data:', err);
    } finally {
      setLoading(false);
    }
  }, [refreshPendingCount]);

  // Reload when user switches
  useEffect(() => {
    loadData();
  }, [loadData, user?.id, user?.email]);

  const handleAccept = async (requestId, senderName) => {
    try {
      setActionLoading(`accept-${requestId}`);
      
      // Optimistic update
      const acceptedReq = pendingRequests.find(r => r.id === requestId);
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));

      await api.acceptConnectionRequest(requestId);
      showToast(`🎉 You and ${senderName || 'developer'} are now connected friends!`);
      await loadData();
      setSubTab('friends'); // Switch to friends tab so they immediately see the accepted person!
    } catch (err) {
      alert(err.message || 'Failed to accept connection request.');
      await loadData();
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setActionLoading(`reject-${requestId}`);
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      await api.rejectConnectionRequest(requestId);
      showToast('Connection request declined.');
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to decline request.');
      await loadData();
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveFriend = async (connectionId, friendName) => {
    if (!window.confirm(`Are you sure you want to remove ${friendName} from your friends list?`)) {
      return;
    }
    try {
      setActionLoading(`remove-${connectionId}`);
      setFriends(prev => prev.filter(f => f.connectionRequestId !== connectionId));
      await api.removeConnection(connectionId);
      showToast(`Removed ${friendName} from your friends network.`);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to remove connection.');
      await loadData();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '36px 20px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="glass-toast">
          <Sparkles size={18} color="#10b981" />
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            padding: '10px',
            borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
          }}>
            <UserCheck size={24} />
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
            Developer Network & Friends
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Manage your incoming connection requests, view your peer network, and accept invitations.
        </p>
      </div>

      {/* Network Status & Refresh Banner */}
      <div 
        className="glass-panel" 
        style={{
          padding: '16px 22px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          background: 'rgba(99, 102, 241, 0.12)',
          borderColor: 'rgba(99, 102, 241, 0.35)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Sparkles size={20} color="#a5b4fc" />
          <div style={{ fontSize: '0.9rem', color: '#e0e7ff' }}>
            Logged in as <strong>{user?.name || 'Developer'}</strong> ({user?.email}). Manage your connections, review pending requests, and grow your engineering network.
          </div>
        </div>
        <button
          onClick={loadData}
          className="btn-secondary"
          style={{ padding: '6px 14px', fontSize: '0.825rem', whiteSpace: 'nowrap' }}
        >
          Refresh Network
        </button>
      </div>

      {/* Glass Tab Navigation */}
      <div 
        className="glass-panel" 
        style={{
          display: 'flex',
          padding: '6px',
          marginBottom: '28px',
          gap: '6px',
          background: 'rgba(11, 16, 29, 0.65)',
        }}
      >
        <button
          onClick={() => setSubTab('friends')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            color: subTab === 'friends' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: subTab === 'friends' ? '700' : '500',
            fontSize: '0.925rem',
            background: subTab === 'friends' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
            border: subTab === 'friends' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
            boxShadow: subTab === 'friends' ? '0 4px 14px rgba(99, 102, 241, 0.25)' : 'none',
          }}
        >
          <Users size={17} />
          <span>My Friends / Connections</span>
          <span style={{
            background: subTab === 'friends' ? '#6366f1' : 'rgba(255,255,255,0.1)',
            color: '#fff',
            fontSize: '0.725rem',
            padding: '2px 8px',
            borderRadius: '10px',
            fontWeight: '600',
          }}>
            {friends.length}
          </span>
        </button>

        <button
          onClick={() => setSubTab('pending')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            color: subTab === 'pending' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: subTab === 'pending' ? '700' : '500',
            fontSize: '0.925rem',
            background: subTab === 'pending' ? 'rgba(245, 158, 11, 0.22)' : 'transparent',
            border: subTab === 'pending' ? '1px solid rgba(245, 158, 11, 0.45)' : '1px solid transparent',
            boxShadow: subTab === 'pending' ? '0 4px 14px rgba(245, 158, 11, 0.25)' : 'none',
          }}
        >
          <Inbox size={17} />
          <span>Incoming Requests</span>
          {pendingRequests.length > 0 && (
            <span style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
              color: '#ffffff',
              fontSize: '0.725rem',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: '700',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.5)',
            }}>
              {pendingRequests.length} NEW
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('sent')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            color: subTab === 'sent' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: subTab === 'sent' ? '700' : '500',
            fontSize: '0.925rem',
            background: subTab === 'sent' ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
            border: subTab === 'sent' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
          }}
        >
          <Send size={16} />
          <span>Sent Requests</span>
          <span style={{
            background: 'rgba(255,255,255,0.08)',
            color: 'var(--text-subtle)',
            fontSize: '0.725rem',
            padding: '2px 8px',
            borderRadius: '10px',
          }}>
            {sentRequests.length}
          </span>
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <div className="pulse-badge" style={{ width: '12px', height: '12px', margin: '0 auto 12px' }} />
          Loading network records...
        </div>
      ) : (
        <div>
          {/* TAB 1: FRIENDS LIST */}
          {subTab === 'friends' && (
            <div>
              {friends.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.12)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: '#818cf8',
                  }}>
                    <Users size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '8px' }}>
                    No friends connected yet
                  </h3>
                  <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
                    Head to "Explore Developers" to discover peers, or check "Incoming Requests" to accept pending invitations.
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: '22px',
                }}>
                  {friends.map((friend) => {
                    const skills = friend.skills ? friend.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
                    return (
                      <div
                        key={friend.id}
                        className="glass-panel"
                        style={{
                          padding: '22px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          borderTop: '3px solid #10b981',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                            <img
                              src={friend.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${friend.name}`}
                              alt={friend.name}
                              onClick={() => onViewProfile?.(friend)}
                              style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '16px',
                                objectFit: 'cover',
                                border: '2px solid rgba(16, 185, 129, 0.45)',
                                cursor: 'pointer',
                              }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4 
                                onClick={() => onViewProfile?.(friend)}
                                style={{
                                  fontSize: '1.05rem',
                                  fontWeight: '700',
                                  color: '#ffffff',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  cursor: 'pointer',
                                }}
                              >
                                {friend.name}
                              </h4>
                              <p style={{
                                fontSize: '0.8rem',
                                color: '#34d399',
                                fontWeight: '600',
                                marginTop: '1px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}>
                                <span className="pulse-badge" /> Connected Friend
                              </p>
                              {friend.location && (
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.75rem',
                                  color: 'var(--text-subtle)',
                                  marginTop: '3px',
                                }}>
                                  <MapPin size={12} color="#818cf8" />
                                  <span>{friend.location}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <p style={{
                            fontSize: '0.825rem',
                            color: 'var(--text-muted)',
                            marginBottom: '14px',
                            lineHeight: '1.45',
                          }}>
                            {friend.headline}
                          </p>

                          {skills.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px' }}>
                              {skills.slice(0, 3).map((s, idx) => (
                                <span key={idx} className="badge-tech" style={{ fontSize: '0.7rem' }}>
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px solid var(--glass-border)',
                          paddingTop: '14px',
                        }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {friend.githubUrl && (
                              <a
                                href={friend.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  padding: '7px',
                                  borderRadius: '8px',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  border: '1px solid var(--glass-border)',
                                  color: 'var(--text-muted)',
                                }}
                              >
                                <GithubIcon size={14} />
                              </a>
                            )}
                            {friend.linkedinUrl && (
                              <a
                                href={friend.linkedinUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  padding: '7px',
                                  borderRadius: '8px',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  border: '1px solid var(--glass-border)',
                                  color: 'var(--text-muted)',
                                }}
                              >
                                <LinkedinIcon size={14} />
                              </a>
                            )}
                          </div>

                          <button
                            disabled={actionLoading === `remove-${friend.connectionRequestId}`}
                            onClick={() => handleRemoveFriend(friend.connectionRequestId, friend.name)}
                            title="Remove connection"
                            className="btn-danger"
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              borderRadius: '8px',
                            }}
                          >
                            <Trash2 size={13} />
                            <span>Remove Friend</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INCOMING PENDING REQUESTS */}
          {subTab === 'pending' && (
            <div>
              {pendingRequests.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: '#fbbf24',
                  }}>
                    <Inbox size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '8px' }}>
                    No pending connection requests
                  </h3>
                  <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto', fontSize: '0.9rem' }}>
                    When another developer invites you to connect, their request will appear right here with options to Accept or Decline.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {pendingRequests.map((req) => {
                    const sender = req.sender || {};
                    return (
                      <div
                        key={req.id}
                        className="glass-panel"
                        style={{
                          padding: '20px 26px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '20px',
                          flexWrap: 'wrap',
                          borderLeft: '4px solid #f59e0b',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <img
                            src={sender.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${sender.name}`}
                            alt={sender.name}
                            onClick={() => sender.id && onViewProfile?.(sender)}
                            style={{
                              width: '58px',
                              height: '58px',
                              borderRadius: '16px',
                              objectFit: 'cover',
                              border: '2px solid rgba(245, 158, 11, 0.45)',
                              cursor: sender.id ? 'pointer' : 'default',
                            }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <h4 
                                onClick={() => sender.id && onViewProfile?.(sender)}
                                style={{ 
                                  fontSize: '1.1rem', 
                                  fontWeight: '700', 
                                  color: '#ffffff',
                                  cursor: sender.id ? 'pointer' : 'default',
                                }}
                              >
                                {sender.name}
                              </h4>
                              <span style={{
                                fontSize: '0.7rem',
                                background: 'rgba(245, 158, 11, 0.15)',
                                color: '#fbbf24',
                                border: '1px solid rgba(245, 158, 11, 0.35)',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontWeight: '700',
                              }}>
                                Pending Invitation
                              </span>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#a5b4fc', marginTop: '3px' }}>
                              {sender.headline || 'Software Developer'}
                            </p>
                            <div style={{ fontSize: '0.775rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                              {sender.location && `${sender.location} • `}
                              Sent connection request
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button
                            disabled={actionLoading === `accept-${req.id}`}
                            onClick={() => handleAccept(req.id, sender.name)}
                            className="btn-success"
                            style={{ padding: '10px 22px', fontSize: '0.9rem' }}
                          >
                            <Check size={16} />
                            {actionLoading === `accept-${req.id}` ? 'Connecting...' : 'Accept Request'}
                          </button>
                          <button
                            disabled={actionLoading === `reject-${req.id}`}
                            onClick={() => handleReject(req.id)}
                            className="btn-danger"
                            style={{ padding: '10px 18px', fontSize: '0.9rem' }}
                          >
                            <X size={16} />
                            Decline
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SENT REQUESTS */}
          {subTab === 'sent' && (
            <div>
              {sentRequests.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.12)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: '#818cf8',
                  }}>
                    <Send size={30} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '8px' }}>
                    No outgoing pending requests
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Connection requests you send to other developers will appear here until they accept them.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {sentRequests.map((req) => {
                    const receiver = req.receiver || {};
                    return (
                      <div
                        key={req.id}
                        className="glass-panel"
                        style={{
                          padding: '18px 22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <img
                            src={receiver.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${receiver.name}`}
                            alt={receiver.name}
                            onClick={() => receiver.id && onViewProfile?.(receiver)}
                            style={{
                              width: '50px',
                              height: '50px',
                              borderRadius: '14px',
                              objectFit: 'cover',
                              cursor: receiver.id ? 'pointer' : 'default',
                            }}
                          />
                          <div>
                            <h4 
                              onClick={() => receiver.id && onViewProfile?.(receiver)}
                              style={{ 
                                fontSize: '1rem', 
                                fontWeight: '700', 
                                color: '#ffffff',
                                cursor: receiver.id ? 'pointer' : 'default',
                              }}
                            >
                              {receiver.name}
                            </h4>
                            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                              {receiver.headline}
                            </p>
                          </div>
                        </div>

                        <span className="badge-status badge-pending">
                          <Clock size={13} />
                          Awaiting Response
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
