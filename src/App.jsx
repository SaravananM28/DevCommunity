import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ExplorePage from './pages/ExplorePage';
import NetworkPage from './pages/NetworkPage';
import ProjectsPage from './pages/ProjectsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { Code2, Database, ShieldCheck, Cpu } from 'lucide-react';

function parseUrlState() {
  const params = new URLSearchParams(window.location.search);
  const profileId = params.get('profile');
  const tab = params.get('tab') || (profileId ? 'profile' : 'explore');
  return {
    tab,
    profileId: profileId ? (isNaN(profileId) ? profileId : Number(profileId)) : null,
  };
}

function MainApp() {
  const { isAuthenticated, user } = useAuth();
  
  // Initialize state directly from URL query parameters
  const [activeTab, setActiveTab] = useState(() => parseUrlState().tab);
  const [viewedDeveloperId, setViewedDeveloperId] = useState(() => parseUrlState().profileId);
  const [previousTab, setPreviousTab] = useState('explore');

  // Sync state when browser Back / Forward buttons are pressed
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseUrlState();
      setActiveTab(parsed.tab);
      setViewedDeveloperId(parsed.profileId);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update browser URL query and history
  const updateUrl = useCallback((tab, profileId, replace = false) => {
    const params = new URLSearchParams();
    if (tab && tab !== 'explore') {
      params.set('tab', tab);
    }
    if (profileId) {
      params.set('profile', profileId);
    }

    const queryStr = params.toString() ? `?${params.toString()}` : window.location.pathname;
    if (replace) {
      window.history.replaceState({ tab, profileId }, '', queryStr);
    } else {
      window.history.pushState({ tab, profileId }, '', queryStr);
    }
  }, []);

  const handleViewProfile = (developer) => {
    if (activeTab !== 'profile') {
      setPreviousTab(activeTab);
    }
    setViewedDeveloperId(developer.id);
    setActiveTab('profile');
    updateUrl('profile', developer.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab) => {
    if (tab === 'profile') {
      const myId = user?.id || null;
      setViewedDeveloperId(myId);
      setActiveTab('profile');
      updateUrl('profile', myId);
    } else {
      setViewedDeveloperId(null);
      setActiveTab(tab);
      updateUrl(tab, null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromProfile = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      handleTabChange(previousTab || 'explore');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />

      <main style={{ flex: 1 }}>
        {activeTab === 'explore' && (
          <ExplorePage
            onRequireAuth={() => handleTabChange('login')}
            onViewProfile={handleViewProfile}
          />
        )}

        {activeTab === 'network' && (
          isAuthenticated ? (
            <NetworkPage onViewProfile={handleViewProfile} />
          ) : (
            <LoginPage
              onNavigateRegister={() => handleTabChange('register')}
              onSuccess={() => handleTabChange('network')}
            />
          )
        )}

        {activeTab === 'projects' && (
          <ProjectsPage
            onRequireAuth={() => handleTabChange('login')}
            onViewProfile={handleViewProfile}
          />
        )}

        {activeTab === 'profile' && (
          isAuthenticated || viewedDeveloperId ? (
            <ProfilePage 
              viewedDeveloperId={viewedDeveloperId} 
              onBack={viewedDeveloperId && viewedDeveloperId !== user?.id ? handleBackFromProfile : null}
            />
          ) : (
            <LoginPage
              onNavigateRegister={() => handleTabChange('register')}
              onSuccess={() => handleTabChange('profile')}
            />
          )
        )}

        {activeTab === 'login' && (
          <LoginPage
            onNavigateRegister={() => handleTabChange('register')}
            onSuccess={() => handleTabChange('explore')}
          />
        )}

        {activeTab === 'register' && (
          <RegisterPage
            onNavigateLogin={() => handleTabChange('login')}
            onSuccess={() => handleTabChange('explore')}
          />
        )}
      </main>

      {/* Modern Developer Platform Glass Footer */}
      <footer style={{
        borderTop: '1px solid var(--glass-border)',
        background: 'rgba(8, 11, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '36px 24px',
        marginTop: '60px',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Code2 size={20} color="#818cf8" />
              <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#ffffff' }}>
                DevConnect PRO
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', maxWidth: '440px' }}>
              Developer Community & Networking Platform: Discover peers, publish projects, manage connection requests, and build engineering networks.
            </p>
          </div>

          {/* Tech Stack Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <span className="badge-tech">
              <Cpu size={12} /> React 19
            </span>
            <span className="badge-tech" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <Code2 size={12} /> Spring Boot
            </span>
            <span className="badge-tech" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#67e8f9', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
              <Database size={12} /> MySQL
            </span>
            <span className="badge-tech" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
              <ShieldCheck size={12} /> JWT Auth
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
