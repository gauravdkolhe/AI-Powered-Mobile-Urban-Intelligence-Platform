import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUsers } from '../services/api';

const DEFAULT_USERS = [
  {
    user_id: 'usr_operator',
    name: 'Amit Deshmukh',
    email: 'amit.deshmukh@transport.gov.in',
    department: 'Public Transport Authority (BEST / MSRTC)',
    role: 'TRANSPORT_OPERATOR',
    zone: 'Central Fleet HQ & Depots',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
  },
  {
    user_id: 'usr_traffic',
    name: 'Inspector R. Shinde',
    email: 'r.shinde@trafficpolice.gov.in',
    department: 'Traffic Police Command & Control Center',
    role: 'TRAFFIC_DEPT',
    zone: 'Metropolitan Traffic Control Division',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
  },
  {
    user_id: 'usr_municipal',
    name: 'Dr. Sneha Patil',
    email: 'sneha.patil@mcgm.gov.in',
    department: 'Municipal Corporation (BMC - Road Infrastructure)',
    role: 'MUNICIPAL_CORP',
    zone: 'Ward H-West & Western Corridors',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
  },
  {
    user_id: 'usr_pwd',
    name: 'Er. Rajesh Kulkarni',
    email: 'rajesh.kulkarni@pwd.gov.in',
    department: 'Public Works Department (PWD)',
    role: 'PWD',
    zone: 'PWD Western Division - Zone 3 Maintenance',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
  }
];

export const DEPARTMENT_METADATA = {
  TRANSPORT_OPERATOR: {
    title: 'Public Transport Operator',
    shortName: 'Transport Fleet',
    icon: '🚌',
    color: 'cyan',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    description: 'Fleet health, bus operations, telemetry, and fleet-flagged events.'
  },
  TRAFFIC_DEPT: {
    title: 'Traffic Management Department',
    shortName: 'Traffic Police',
    icon: '🚦',
    color: 'amber',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    description: 'Congestion heatmaps, route delays, bottleneck mitigation, and incidents.'
  },
  MUNICIPAL_CORP: {
    title: 'Municipal Corporation',
    shortName: 'Municipal (BMC)',
    icon: '🏙️',
    color: 'blue',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    description: 'Pothole verification, civic road hazards, and dispatching PWD work orders.'
  },
  PWD: {
    title: 'Public Works Department',
    shortName: 'PWD Repairs',
    icon: '🛣️',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    description: 'Executing assigned repair work orders, location navigation, and uploading proof.'
  }
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(DEFAULT_USERS);
  // Default to Municipal Corporation to showcase pothole verification & work orders right away
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('margadrishti_user_id');
    const match = DEFAULT_USERS.find(u => u.user_id === saved);
    return match || DEFAULT_USERS[2]; // Dr. Sneha Patil (MUNICIPAL_CORP)
  });

  useEffect(() => {
    fetchUsers()
      .then(fetched => {
        if (fetched && fetched.length > 0) {
          setUsers(fetched);
          const currentId = currentUser?.user_id;
          const match = fetched.find(u => u.user_id === currentId);
          if (match) setCurrentUser(match);
        }
      })
      .catch(() => {
        // Fallback to local default users
      });
  }, []);

  const switchUser = (userId) => {
    const match = users.find(u => u.user_id === userId);
    if (match) {
      setCurrentUser(match);
      localStorage.setItem('margadrishti_user_id', match.user_id);
    }
  };

  const switchRole = (role) => {
    const match = users.find(u => u.role === role);
    if (match) {
      setCurrentUser(match);
      localStorage.setItem('margadrishti_user_id', match.user_id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.role || 'MUNICIPAL_CORP',
        users,
        switchUser,
        switchRole,
        metadata: DEPARTMENT_METADATA[currentUser?.role || 'MUNICIPAL_CORP']
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
