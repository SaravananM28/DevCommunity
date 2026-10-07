// API Client with resilient live backend connection + fallback offline store
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export function getStoredToken() {
  return localStorage.getItem('devconnect_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('devconnect_token', token);
  } else {
    localStorage.removeItem('devconnect_token');
  }
}

// ─────────────────────────────────────────────────────────────
// Initial Seed Data for Demo & Offline Fallback Mode
// ─────────────────────────────────────────────────────────────
const INITIAL_USERS = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@devconnect.io',
    password: 'password123',
    headline: 'Senior Full-Stack Engineer | React & Spring Boot',
    bio: 'Passionate about building scalable distributed systems and sleek developer tooling. Open to collaborating on open-source initiatives.',
    skills: 'React, Java, Spring Boot, MySQL, Docker, TypeScript',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/alicejohnson',
    linkedinUrl: 'https://linkedin.com/in/alicejohnson',
    location: 'San Francisco, CA',
  },
  {
    id: 2,
    name: 'Bob Chen',
    email: 'bob@devconnect.io',
    password: 'password123',
    headline: 'Backend Architect | Cloud & Microservices',
    bio: 'Designing resilient backend architectures and high-throughput data pipelines. Java & Spring Boot evangelist.',
    skills: 'Java, Spring Cloud, Kafka, Kubernetes, MySQL, Redis',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/bobchen',
    linkedinUrl: 'https://linkedin.com/in/bobchen',
    location: 'Seattle, WA',
  },
  {
    id: 3,
    name: 'Clara Rodriguez',
    email: 'clara@devconnect.io',
    password: 'password123',
    headline: 'Frontend Lead & UI/UX Specialist',
    bio: 'Crafting delightful, accessible web interfaces for modern SaaS platforms. Exploring modern web animations and micro-frontends.',
    skills: 'React, Next.js, Tailwind CSS, TypeScript, GraphQL',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/clararodriguez',
    linkedinUrl: 'https://linkedin.com/in/clararodriguez',
    location: 'Austin, TX',
  },
  {
    id: 4,
    name: 'David Kim',
    email: 'david@devconnect.io',
    password: 'password123',
    headline: 'DevOps & Cloud Engineer | AWS Certified',
    bio: 'Automating infrastructure as code and building robust continuous integration/delivery pipelines.',
    skills: 'AWS, Docker, Kubernetes, Terraform, Python, CI/CD',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    githubUrl: 'https://github.com/davidkim',
    linkedinUrl: 'https://linkedin.com/in/davidkim',
    location: 'New York, NY',
  },
];

const INITIAL_PROJECTS = [
  {
    id: 1,
    title: 'DevConnect Platform',
    description: 'A professional developer networking platform with live connection management, project showcase, and secure JWT auth.',
    techStack: 'React, Spring Boot, MySQL, Spring Security, JWT',
    repoUrl: 'https://github.com/devconnect/devconnect',
    liveUrl: 'https://devconnect.preview',
    userId: 1,
    authorName: 'Alice Johnson',
    authorEmail: 'alice@devconnect.io',
    authorHeadline: 'Senior Full-Stack Engineer | React & Spring Boot',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'CloudMetrics Dashboard',
    description: 'Real-time Kubernetes monitoring microservice suite with distributed tracing and Grafana dashboards.',
    techStack: 'Java, Spring Cloud, Kafka, Docker, Prometheus',
    repoUrl: 'https://github.com/bobchen/cloud-metrics',
    liveUrl: 'https://metrics.preview',
    userId: 2,
    authorName: 'Bob Chen',
    authorEmail: 'bob@devconnect.io',
    authorHeadline: 'Backend Architect | Cloud & Microservices',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    title: 'Aura Design System',
    description: 'A comprehensive, accessible component library tailored for dark mode dashboards and developer portals.',
    techStack: 'React, TypeScript, CSS Modules, Storybook',
    repoUrl: 'https://github.com/clara/aura-ui',
    liveUrl: 'https://aura-ui.preview',
    userId: 3,
    authorName: 'Clara Rodriguez',
    authorEmail: 'clara@devconnect.io',
    authorHeadline: 'Frontend Lead & UI/UX Specialist',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

// Initial requests: Bob (2) requested to Alice (1) -> PENDING; David (4) and Bob (2) -> ACCEPTED
const INITIAL_CONNECTIONS = [
  {
    id: 1,
    senderId: 2,
    receiverId: 1,
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    senderId: 4,
    receiverId: 2,
    status: 'ACCEPTED',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Helper to get & set in localStorage
function getLocal(key, defaultVal) {
  try {
    const raw = localStorage.getItem(`devconnect_${key}`);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocal(key, val) {
  try {
    localStorage.setItem(`devconnect_${key}`, JSON.stringify(val));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// Initialize store if needed
function ensureStore() {
  if (!localStorage.getItem('devconnect_users')) {
    setLocal('users', INITIAL_USERS);
  }
  if (!localStorage.getItem('devconnect_projects')) {
    setLocal('projects', INITIAL_PROJECTS);
  }
  if (!localStorage.getItem('devconnect_connections')) {
    setLocal('connections', INITIAL_CONNECTIONS);
  }
}
ensureStore();

// ─────────────────────────────────────────────────────────────
// Real HTTP Network Layer with Automatic Fallback
// ─────────────────────────────────────────────────────────────
let serverOnline = null; // null: unknown, true: backend responding, false: offline/fallback

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);

    // If unauthorized, clear token if expired
    if (res.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
      // Token might be invalid or expired
    }

    serverOnline = true;
    
    // For 204 No Content
    if (res.status === 204) {
      return { success: true };
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMessage = data?.message || (data && typeof data === 'object' ? Object.values(data)[0] : null) || 'Request failed';
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // If backend is unreachable (Failed to fetch, connection refused, 404/504), use fallback store
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.message?.includes('Load failed')) {
      serverOnline = false;
      return handleOfflineRequest(endpoint, options, token);
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// High-Fidelity Local Fallback Engine (For preview / offline)
// ─────────────────────────────────────────────────────────────
function getCurrentUserFromToken(token) {
  ensureStore();
  const users = getLocal('users', INITIAL_USERS);
  if (!token) return null;
  // Tokens are "demo-token-<userId>" or JWT
  if (token.startsWith('demo-token-')) {
    const id = Number(token.replace('demo-token-', ''));
    return users.find(u => u.id === id) || users[0];
  }
  return users[0];
}

function convertUserToDto(targetUser, currentUser, connections) {
  const dto = {
    id: targetUser.id,
    name: targetUser.name,
    email: targetUser.email,
    headline: targetUser.headline,
    bio: targetUser.bio,
    skills: targetUser.skills,
    avatarUrl: targetUser.avatarUrl,
    githubUrl: targetUser.githubUrl,
    linkedinUrl: targetUser.linkedinUrl,
    location: targetUser.location,
    connectionStatus: 'NONE',
    connectionRequestId: null,
  };

  if (!currentUser) {
    dto.connectionStatus = 'NONE';
    return dto;
  }

  if (currentUser.id === targetUser.id || currentUser.email?.toLowerCase() === targetUser.email?.toLowerCase()) {
    dto.connectionStatus = 'SELF';
    return dto;
  }

  const req = connections.find(c => 
    (c.senderId === currentUser.id && c.receiverId === targetUser.id) ||
    (c.senderId === targetUser.id && c.receiverId === currentUser.id)
  );

  if (req) {
    dto.connectionRequestId = req.id;
    if (req.status === 'ACCEPTED') {
      dto.connectionStatus = 'CONNECTED';
    } else if (req.status === 'PENDING') {
      dto.connectionStatus = req.senderId === currentUser.id ? 'PENDING_SENT' : 'PENDING_RECEIVED';
    }
  }

  return dto;
}

function handleOfflineRequest(endpoint, options = {}, token) {
  ensureStore();
  let users = getLocal('users', INITIAL_USERS);
  let projects = getLocal('projects', INITIAL_PROJECTS);
  let connections = getLocal('connections', INITIAL_CONNECTIONS);
  const currentUser = getCurrentUserFromToken(token);

  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  // Auth: Login
  if (endpoint === '/auth/login' && method === 'POST') {
    const user = users.find(u => u.email.toLowerCase() === body.email.toLowerCase());
    if (!user) throw new Error('Invalid email or password.');
    const demoToken = `demo-token-${user.id}`;
    return {
      token: demoToken,
      tokenType: 'Bearer',
      user: convertUserToDto(user, user, connections),
    };
  }

  // Auth: Register
  if (endpoint === '/auth/register' && method === 'POST') {
    if (users.some(u => u.email.toLowerCase() === body.email.toLowerCase())) {
      throw new Error(`An account with email ${body.email} already exists!`);
    }
    const newId = Date.now();
    const newUser = {
      id: newId,
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      password: body.password,
      headline: body.headline || 'Developer',
      skills: body.skills || '',
      location: body.location || '',
      bio: body.bio || '',
      githubUrl: body.githubUrl || '',
      linkedinUrl: body.linkedinUrl || '',
      avatarUrl: body.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${body.name}`,
    };
    users.push(newUser);
    setLocal('users', users);
    const demoToken = `demo-token-${newId}`;
    return {
      token: demoToken,
      tokenType: 'Bearer',
      user: convertUserToDto(newUser, newUser, connections),
    };
  }

  // Auth: Me
  if (endpoint === '/auth/me') {
    if (!currentUser) throw new Error('Unauthorized');
    return convertUserToDto(currentUser, currentUser, connections);
  }

  // Users: List / Search
  if (endpoint.startsWith('/users') && method === 'GET') {
    const urlParts = endpoint.split('?query=');
    const query = urlParts[1] ? decodeURIComponent(urlParts[1]).toLowerCase() : '';
    let filtered = users;
    if (query) {
      filtered = users.filter(u => 
        u.name.toLowerCase().includes(query) ||
        (u.headline && u.headline.toLowerCase().includes(query)) ||
        (u.skills && u.skills.toLowerCase().includes(query))
      );
    }
    return filtered.map(u => convertUserToDto(u, currentUser, connections));
  }

  // Users: Profile update
  if (endpoint === '/users/profile' && method === 'PUT') {
    if (!currentUser) throw new Error('Unauthorized');
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...body };
      setLocal('users', users);
      return convertUserToDto(users[idx], users[idx], connections);
    }
  }

  // Single User
  if (endpoint.startsWith('/users/') && method === 'GET') {
    const id = Number(endpoint.split('/')[2]);
    const u = users.find(user => user.id === id);
    if (!u) throw new Error('User not found');
    return convertUserToDto(u, currentUser, connections);
  }

  // Projects: List All
  if (endpoint === '/projects' && method === 'GET') {
    return projects;
  }

  // Projects: By User
  if (endpoint.startsWith('/projects/user/') && method === 'GET') {
    const userId = Number(endpoint.split('/projects/user/')[1]);
    return projects.filter(p => p.userId === userId);
  }

  // Projects: Create
  if (endpoint === '/projects' && method === 'POST') {
    if (!currentUser) throw new Error('Unauthorized to create project');
    const newProject = {
      id: Date.now(),
      title: body.title,
      description: body.description,
      techStack: body.techStack,
      repoUrl: body.repoUrl,
      liveUrl: body.liveUrl,
      userId: currentUser.id,
      authorName: currentUser.name,
      authorEmail: currentUser.email,
      authorHeadline: currentUser.headline,
      authorAvatar: currentUser.avatarUrl,
      createdAt: new Date().toISOString(),
    };
    projects.unshift(newProject);
    setLocal('projects', projects);
    return newProject;
  }

  // Projects: Delete
  if (endpoint.startsWith('/projects/') && method === 'DELETE') {
    if (!currentUser) throw new Error('Unauthorized to delete project');
    const id = Number(endpoint.split('/projects/')[1]);
    const proj = projects.find(p => p.id === id);
    if (!proj) throw new Error('Project not found');
    const isOwner = proj.userId === currentUser.id || 
                    (proj.authorEmail && proj.authorEmail.toLowerCase() === currentUser.email.toLowerCase());
    if (!isOwner) throw new Error('You can only delete your own projects.');
    projects = projects.filter(p => p.id !== id);
    setLocal('projects', projects);
    return { success: true, message: 'Project deleted successfully.' };
  }

  // Connections: Send Request
  if (endpoint.startsWith('/connections/request/') && method === 'POST') {
    if (!currentUser) throw new Error('Unauthorized');
    const receiverId = Number(endpoint.split('/connections/request/')[1]);
    if (currentUser.id === receiverId) throw new Error('Cannot send request to yourself');

    let existing = connections.find(c => 
      (c.senderId === currentUser.id && c.receiverId === receiverId) ||
      (c.senderId === receiverId && c.receiverId === currentUser.id)
    );

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        throw new Error('Already connected with this user.');
      }
      if (existing.status === 'PENDING') {
        if (existing.senderId === currentUser.id) {
          throw new Error('Connection request already sent and pending.');
        } else {
          // Auto-accept if receiver sends to sender
          existing.status = 'ACCEPTED';
          existing.updatedAt = new Date().toISOString();
          setLocal('connections', connections);
          const receiver = users.find(u => u.id === receiverId);
          return {
            id: existing.id,
            sender: convertUserToDto(currentUser, currentUser, connections),
            receiver: convertUserToDto(receiver, currentUser, connections),
            status: 'ACCEPTED',
          };
        }
      }
      // If REJECTED, delete and recreate
      connections = connections.filter(c => c.id !== existing.id);
    }

    const newReq = {
      id: Date.now(),
      senderId: currentUser.id,
      receiverId: receiverId,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    connections.push(newReq);
    setLocal('connections', connections);

    const receiver = users.find(u => u.id === receiverId);
    return {
      id: newReq.id,
      sender: convertUserToDto(currentUser, currentUser, connections),
      receiver: convertUserToDto(receiver, currentUser, connections),
      status: 'PENDING',
    };
  }

  // Connections: Accept
  if (endpoint.includes('/accept') && method === 'PUT') {
    if (!currentUser) throw new Error('Unauthorized');
    const reqId = Number(endpoint.split('/')[2]);
    const req = connections.find(c => c.id === reqId);
    if (!req) throw new Error('Connection request not found');
    if (req.receiverId !== currentUser.id) {
      throw new Error('You are not authorized to accept this connection request.');
    }
    req.status = 'ACCEPTED';
    req.updatedAt = new Date().toISOString();
    setLocal('connections', connections);

    const sender = users.find(u => u.id === req.senderId);
    return {
      id: req.id,
      sender: convertUserToDto(sender, currentUser, connections),
      receiver: convertUserToDto(currentUser, currentUser, connections),
      status: 'ACCEPTED',
    };
  }

  // Connections: Reject
  if (endpoint.includes('/reject') && method === 'PUT') {
    if (!currentUser) throw new Error('Unauthorized');
    const reqId = Number(endpoint.split('/')[2]);
    const req = connections.find(c => c.id === reqId);
    if (!req) throw new Error('Connection request not found');
    if (req.receiverId !== currentUser.id) {
      throw new Error('You are not authorized to reject this connection request.');
    }
    req.status = 'REJECTED';
    req.updatedAt = new Date().toISOString();
    setLocal('connections', connections);
    return { id: req.id, status: 'REJECTED' };
  }

  // Connections: Pending list
  if (endpoint === '/connections/pending' && method === 'GET') {
    if (!currentUser) return [];
    const pending = connections.filter(c => c.receiverId === currentUser.id && c.status === 'PENDING');
    return pending.map(p => {
      const sender = users.find(u => u.id === p.senderId);
      return {
        id: p.id,
        sender: convertUserToDto(sender, currentUser, connections),
        receiver: convertUserToDto(currentUser, currentUser, connections),
        status: p.status,
        createdAt: p.createdAt,
      };
    });
  }

  // Connections: Sent list
  if (endpoint === '/connections/sent' && method === 'GET') {
    if (!currentUser) return [];
    const sent = connections.filter(c => c.senderId === currentUser.id && c.status === 'PENDING');
    return sent.map(p => {
      const receiver = users.find(u => u.id === p.receiverId);
      return {
        id: p.id,
        sender: convertUserToDto(currentUser, currentUser, connections),
        receiver: convertUserToDto(receiver, currentUser, connections),
        status: p.status,
        createdAt: p.createdAt,
      };
    });
  }

  // Connections: Friends list
  if (endpoint === '/connections/friends' && method === 'GET') {
    if (!currentUser) return [];
    const accepted = connections.filter(c => 
      c.status === 'ACCEPTED' && (c.senderId === currentUser.id || c.receiverId === currentUser.id)
    );
    return accepted.map(c => {
      const friendId = c.senderId === currentUser.id ? c.receiverId : c.senderId;
      const friend = users.find(u => u.id === friendId);
      const dto = convertUserToDto(friend, currentUser, connections);
      dto.connectionRequestId = c.id;
      return dto;
    });
  }

  // Connections: Pending count
  if (endpoint === '/connections/pending-count' && method === 'GET') {
    if (!currentUser) return { count: 0 };
    const count = connections.filter(c => c.receiverId === currentUser.id && c.status === 'PENDING').length;
    return { count };
  }

  // Connections: Remove
  if (endpoint.startsWith('/connections/') && method === 'DELETE') {
    if (!currentUser) throw new Error('Unauthorized');
    const id = Number(endpoint.split('/connections/')[1]);
    connections = connections.filter(c => c.id !== id);
    setLocal('connections', connections);
    return { success: true, message: 'Connection removed successfully.' };
  }

  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// Public API Surface
// ─────────────────────────────────────────────────────────────
export const api = {
  // Auth
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  getMe: () => request('/auth/me'),

  // Developers / Users
  getDevelopers: (query = '') => {
    const q = query ? `?query=${encodeURIComponent(query)}` : '';
    return request(`/users${q}`);
  },

  getDeveloper: (id) => request(`/users/${id}`),

  updateProfile: (profileData) => request('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),

  // Connections & Networking
  sendConnectionRequest: (receiverId) => request(`/connections/request/${receiverId}`, {
    method: 'POST',
  }),

  acceptConnectionRequest: (requestId) => request(`/connections/${requestId}/accept`, {
    method: 'PUT',
  }),

  rejectConnectionRequest: (requestId) => request(`/connections/${requestId}/reject`, {
    method: 'PUT',
  }),

  getPendingRequests: () => request('/connections/pending'),

  getSentRequests: () => request('/connections/sent'),

  getFriends: () => request('/connections/friends'),

  getPendingCount: () => request('/connections/pending-count'),

  removeConnection: (connectionId) => request(`/connections/${connectionId}`, {
    method: 'DELETE',
  }),

  // Projects
  getProjects: () => request('/projects'),

  getProjectsByUser: (userId) => request(`/projects/user/${userId}`),

  createProject: (projectData) => request('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  }),

  deleteProject: (id) => request(`/projects/${id}`, {
    method: 'DELETE',
  }),
};
