import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser: any = jwtDecode(token);
        setUser(decodedUser);
      } catch (err) {
        logout();
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token } = response.data;
    localStorage.setItem('token', token);
    const decodedUser: any = jwtDecode(token);
    setUser(decodedUser);
    setIsAuthenticated(true);
  };

  const register = async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password });
    const { token } = response.data;
    localStorage.setItem('token', token);
    const decodedUser: any = jwtDecode(token);
    setUser(decodedUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
