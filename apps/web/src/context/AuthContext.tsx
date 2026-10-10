import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  isAdvocate: boolean;
  isAssociate: boolean;
  isStaff: boolean;
  isClient: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('advocate_token');
    const savedUser = localStorage.getItem('advocate_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('advocate_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await apiClient.post('/auth/login', { email, password: pass });
    const { token: receivedToken, user: receivedUser } = res.data.data;

    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('advocate_token', receivedToken);
    localStorage.setItem('advocate_user', JSON.stringify(receivedUser));
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('advocate_token');
      localStorage.removeItem('advocate_user');
    }
  };

  // Quick role switcher for testing all 5 roles
  const switchDemoRole = async (role: UserRole) => {
    const credentialsMap: Record<UserRole, { email: string; pass: string }> = {
      ADVOCATE: { email: 'advocate@legaldesk.com', pass: 'Advocate@123' },
      ASSOCIATE_ADVOCATE: { email: 'associate@legaldesk.com', pass: 'Advocate@123' },
      CLIENT: { email: 'client@legaldesk.com', pass: 'Client@123' },
      LEGAL_STAFF: { email: 'staff@legaldesk.com', pass: 'Advocate@123' },
      ADMINISTRATOR: { email: 'admin@legaldesk.com', pass: 'Advocate@123' },
    };

    const target = credentialsMap[role];
    if (target) {
      await login(target.email, target.pass);
    }
  };

  const isAdvocate = user?.role === 'ADVOCATE';
  const isAssociate = user?.role === 'ASSOCIATE_ADVOCATE';
  const isStaff = user?.role === 'LEGAL_STAFF';
  const isClient = user?.role === 'CLIENT';
  const isAdmin = user?.role === 'ADMINISTRATOR';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        switchDemoRole,
        isAdvocate,
        isAssociate,
        isStaff,
        isClient,
        isAdmin,
      }}
    >
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
