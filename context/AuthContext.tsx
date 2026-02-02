
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, pin: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (action: 'edit' | 'delete' | 'create' | 'view_sensitive' | 'manage_users') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const userData = await authService.me();
          setUser(userData);
        } catch (error) {
          console.error("Auth check failed", error);
          logout();
        }
      }
    };
    checkAuth();
  }, []);

  const login = async (username: string, pin: string): Promise<boolean> => {
    try {
      const response = await authService.login(username, pin);
      
      if (response.token && response.user) {
        localStorage.setItem('auth_token', response.token);
        // The API returns the user in snake_case, but our authService.me() uses the adapter.
        // For login, we might need to adapt manually or re-fetch.
        // Let's assume response.user is the raw data, so we adapt it.
        // Or simpler: fetch user profile after login to be safe.
        localStorage.setItem('inventory_user_session', JSON.stringify(response.user));
        
        // Refresh user data from /me endpoint to ensure correct adaptation
        const fullUser = await authService.me();
        setUser(fullUser);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed", error);
      throw error; // Rethrow to let caller handle network errors vs auth errors
    }
  };

  const logout = async () => {
    try {
        await authService.logout();
    } catch (e) {
        // Ignore error on logout
    }
    setUser(null);
    localStorage.removeItem('inventory_user_session');
    localStorage.removeItem('auth_token');
  };

  // RBAC: Control de Acceso Basado en Roles
  const hasPermission = (action: 'edit' | 'delete' | 'create' | 'view_sensitive' | 'manage_users'): boolean => {
    if (!user) return false;
    
    // ADMIN: Acceso total
    if (user.role === UserRole.ADMIN) return true;

    // CONSULTANT: Solo lectura, nada de edición, creación o datos sensibles
    if (user.role === UserRole.CONSULTANT) {
      return false; 
    }

    return false;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, hasPermission }}>
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
