import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  FolderGit2, 
  UserCheck, 
  UserPlus, 
  LogOut, 
  LogIn, 
  Code2
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, isAuthenticated, logout, pendingCount } = useAuth();

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(7, 10, 18, 0.82)',
      backdropFilter: 'blur(24px) saturate(190%)',
      WebkitBackdropFilter: 'blur(24px) saturate(190%)',
      borderBottom: '1px solid var(--glass-border)',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.35)',
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('explore')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 18px rgba(99, 102, 241, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <Code2 size={24} />
          </div>
          <div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '800',
              letterSpacing: '-0.5px',
              background: 'linear-gradient(90deg, #ffffff 40%, #c7d2fe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              DevConnect
              <span style={{
                fontSize: '0.65rem',
                background: 'rgba(99, 102, 241, 0.22)',
                color: '#a5b4fc',
                padding: '2px 7px',
                borderRadius: '6px',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                letterSpacing: '0.5px',
                fontWeight: '700',
              }}>PRO</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)', marginTop: '-2px' }}>
              Developer Networking Platform
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('explore')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: 'var(--radius-md)',
              color: activeTab === 'explore' ? '#ffffff' : 'var(--text-muted)',
              background: activeTab === 'explore' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              border: activeTab === 'explore' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
              boxShadow: activeTab === 'explore' ? '0 2px 10px rgba(99, 102, 241, 0.25)' : 'none',
              fontWeight: activeTab === 'explore' ? '700' : '500',
              fontSize: '0.9rem',
            }}
          >
            <Users size={17} />
            Explore Developers
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: 'var(--radius-md)',
              color: activeTab === 'projects' ? '#ffffff' : 'var(--text-muted)',
              background: activeTab === 'projects' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              border: activeTab === 'projects' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
              boxShadow: activeTab === 'projects' ? '0 2px 10px rgba(99, 102, 241, 0.25)' : 'none',
              fontWeight: activeTab === 'projects' ? '700' : '500',
              fontSize: '0.9rem',
            }}
          >
            <FolderGit2 size={17} />
            Projects
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setActiveTab('network')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: 'var(--radius-md)',
                color: activeTab === 'network' ? '#ffffff' : 'var(--text-muted)',
                background: activeTab === 'network' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                border: activeTab === 'network' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                boxShadow: activeTab === 'network' ? '0 2px 10px rgba(99, 102, 241, 0.25)' : 'none',
                fontWeight: activeTab === 'network' ? '700' : '500',
                fontSize: '0.9rem',
                position: 'relative',
              }}
            >
              <UserCheck size={17} />
              My Network & Friends
              {pendingCount > 0 && (
                <span style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                  color: '#ffffff',
                  fontSize: '0.725rem',
                  fontWeight: '700',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.5)',
                  marginLeft: '4px',
                }}>
                  {pendingCount}
                </span>
              )}
            </button>
          )}
        </nav>

        {/* Right Section: Profile & Authentication */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

          {/* User Profile / Logout or Login / Register */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setActiveTab('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '5px 12px 5px 6px',
                  borderRadius: 'var(--radius-full)',
                  background: activeTab === 'profile' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                  border: activeTab === 'profile' ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid var(--glass-border)',
                }}
              >
                <img
                  src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`}
                  alt={user?.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #6366f1',
                  }}
                />
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#ffffff',
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {user?.name}
                </span>
              </button>

              <button
                onClick={logout}
                title="Sign Out"
                className="btn-danger"
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  width: '38px',
                  height: '38px',
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setActiveTab('login')}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <LogIn size={15} />
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                <UserPlus size={15} />
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
