import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  departmentId?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (fullName: string, email: string, role: string, password: string, departmentId?: number) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper to base64-decode JWT payload without external libraries
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserFromStorage = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const payload = parseJwt(token);
      if (payload) {
        // Map standard claims (ClaimTypes map to specific keys in JWT payload)
        const id = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload.sub;
        const email = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || payload.email;
        const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload.role;
        const fullName = payload.FullName || payload.name || "User";
        const departmentId = payload.DepartmentId ? parseInt(payload.DepartmentId) : undefined;

        setUser({ id, email, fullName, role, departmentId });
      } else {
        localStorage.clear();
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUserFromStorage();

    // Listen to custom session-expired event dispatched by Axios interceptor
    const handleLogoutEvent = () => {
      setUser(null);
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/v1/auth/login', { email, password });
    if (res.data?.success) {
      const { accessToken, refreshToken } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      const payload = parseJwt(accessToken);
      const id = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || payload.sub;
      const userEmail = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || payload.email;
      const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload.role;
      const fullName = payload.FullName || payload.name || "User";
      const departmentId = payload.DepartmentId ? parseInt(payload.DepartmentId) : undefined;

      setUser({ id, email: userEmail, fullName, role, departmentId });
    }
    return res.data;
  };

  const register = async (fullName: string, email: string, role: string, password: string, departmentId?: number) => {
    const res = await api.post('/v1/auth/register', {
      fullName,
      email,
      role,
      password,
      departmentId: departmentId || null,
    });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
