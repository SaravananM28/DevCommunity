import React, { useState, useEffect, useCallback } from 'react';
import { Search, Sparkles, Filter, Code2, Users, Compass } from 'lucide-react';
import { api } from '../api/client';
import DeveloperCard from '../components/DeveloperCard';
import { useAuth } from '../context/AuthContext';

const POPULAR_SKILLS = [
  'All',
  'React',
  'Spring Boot',
  'Java',
  'MySQL',
  'Docker',
  'TypeScript',
  'Kubernetes',
  'AWS',
];

export default function ExplorePage({ onRequireAuth, onViewProfile }) {
  const { user } = useAuth();
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All');

  const fetchDevelopers = useCallback(async (query = '') => {
    setLoading(true);
    try {
      const data = await api.getDevelopers(query);
      setDevelopers(data || []);
    } catch (err) {
      console.error('Failed to fetch developers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevelopers(searchQuery);
  }, [fetchDevelopers, user?.id, user?.email]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDevelopers(searchQuery);
  };

  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill);
    if (skill === 'All') {
      setSearchQuery('');
      fetchDevelopers('');
    } else {
      setSearchQuery(skill);
      fetchDevelopers(skill);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px 20px' }}>
      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '52px 20px 40px',
        marginBottom: '36px',
        position: 'relative',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 18px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: '#c7d2fe',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginBottom: '22px',
          boxShadow: '0 4px 16px rgba(99, 102, 241, 0.2)',
        }}>
          <Sparkles size={15} color="#818cf8" />
          The Premier Developer Networking Platform
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
          fontWeight: '800',
          letterSpacing: '-1.5px',
          lineHeight: '1.15',
          marginBottom: '18px',
          background: 'linear-gradient(135deg, #ffffff 25%, #c7d2fe 65%, #818cf8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Connect with Engineers.<br />Build Together.
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-muted)',
          maxWidth: '680px',
          margin: '0 auto 36px',
          lineHeight: '1.6',
        }}>
          DevConnect empowers developers to discover peers, publish open-source projects,
          send connection requests, and build lasting professional engineering networks.
        </p>

        {/* Glass Search Bar */}
        <form 
          onSubmit={handleSearchSubmit}
          style={{
            maxWidth: '640px',
            margin: '0 auto',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search 
            size={20} 
            color="#818cf8" 
            style={{ position: 'absolute', left: '18px', pointerEvents: 'none' }} 
          />
          <input
            type="text"
            placeholder="Search developers by name, headline, or technology (e.g. React, Java)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{
              paddingLeft: '50px',
              paddingRight: '110px',
              height: '56px',
              fontSize: '1rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              background: 'rgba(15, 23, 42, 0.75)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{
              position: 'absolute',
              right: '8px',
              height: '42px',
              padding: '0 20px',
              fontSize: '0.875rem',
            }}
          >
            Search
          </button>
        </form>

        {/* Stack Filter Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          marginTop: '24px',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginRight: '6px' }}>
            Filter by Stack:
          </span>
          {POPULAR_SKILLS.map((skill) => (
            <button
              key={skill}
              onClick={() => handleSkillSelect(skill)}
              style={{
                fontSize: '0.825rem',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: selectedSkill === skill ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                color: selectedSkill === skill ? '#ffffff' : 'var(--text-muted)',
                border: selectedSkill === skill ? '1px solid #6366f1' : '1px solid var(--glass-border)',
                fontWeight: selectedSkill === skill ? '600' : '500',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
              }}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Developers Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '26px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            padding: '8px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8',
          }}>
            <Users size={20} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '700', color: '#ffffff' }}>
            Featured Developers
          </h2>
          <span style={{
            fontSize: '0.775rem',
            color: '#a5b4fc',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            padding: '2px 9px',
            borderRadius: '12px',
            fontWeight: '600',
          }}>
            {developers.length} Available
          </span>
        </div>
      </div>

      {/* Developers Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
          <div className="pulse-badge" style={{ width: '12px', height: '12px', margin: '0 auto 12px' }} />
          Discovering developers in the community...
        </div>
      ) : developers.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Compass size={44} color="#6366f1" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '8px' }}>
            No developers found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginBottom: '20px' }}>
            Try searching for another skill, or clear your query to see all developers.
          </p>
          <button
            onClick={() => {
              setSelectedSkill('All');
              setSearchQuery('');
              fetchDevelopers('');
            }}
            className="btn-primary"
          >
            Show All Developers
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '26px',
        }}>
          {developers.map((dev) => (
            <DeveloperCard
              key={`${dev.id}-${user?.id}`}
              developer={dev}
              onRequireAuth={onRequireAuth}
              onViewProfile={onViewProfile}
              onConnectionChange={() => fetchDevelopers(searchQuery)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
