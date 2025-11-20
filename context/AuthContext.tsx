import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'ADMIN' | 'OWNER' | 'TENANT';

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: Role;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check local storage on load
    const storedUser = localStorage.getItem('kv_crm_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('kv_crm_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Hardcoded authentication logic
    let authenticatedUser: AuthUser | null = null;

    if (username === 'admin' && password === 'admin123') {
      authenticatedUser = { id: '1', name: 'Super Admin', username: 'admin', role: 'ADMIN' };
    } else if (username === 'owner' && password === 'owner123') {
      authenticatedUser = { id: '2', name: 'John Owner', username: 'owner', role: 'OWNER' };
    } else if (username === 'tenant' && password === 'tenant123') {
      authenticatedUser = { id: '3', name: 'Jane Tenant', username: 'tenant', role: 'TENANT' };
    }

    if (authenticatedUser) {
      setUser(authenticatedUser);
      setIsAuthenticated(true);
      localStorage.setItem('kv_crm_user', JSON.stringify(authenticatedUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('kv_crm_user');
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};