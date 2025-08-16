import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { me, login as apiLogin, setAuthToken } from '@/api/client';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ token: string; user: User; must_change_password?: boolean } | null>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize token from localStorage on mount
    const token = localStorage.getItem('auth_token');
    console.log('AuthProvider: Initializing with token from localStorage:', token ? 'Token exists' : 'No token');
    setAuthToken(token);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        console.log('AuthProvider: Checking auth with token');
        setAuthToken(token);
        const userData = await me();
        console.log('AuthProvider: Auth check successful, user data:', userData);
        setUser(userData);
      } else {
        console.log('AuthProvider: No token found, not checking auth');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
      setAuthToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<{ token: string; user: User; must_change_password?: boolean } | null> => {
    try {
      console.log(`AuthProvider: Attempting login for user: ${username}`);
      setIsLoading(true);
      const response = await apiLogin(username, password);
      console.log('AuthProvider: Login response:', response);
      
      if (response && response.token) {
        console.log('AuthProvider: Login successful, storing token and user data');
        localStorage.setItem('auth_token', response.token);
        setAuthToken(response.token);
        setUser(response.user);
        return response;
      }
      console.log('AuthProvider: Login failed, no token in response');
      return null;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('AuthProvider: Logging out, removing token');
    localStorage.removeItem('auth_token');
    setAuthToken(null);
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      console.log('AuthProvider: Updating user data', userData);
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 