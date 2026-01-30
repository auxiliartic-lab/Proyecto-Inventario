
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { loadData } from '../services/inventoryService';

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

  // Cargar sesión del localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('inventory_user_session');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, pin: string): Promise<boolean> => {
    // Leemos directamente del servicio para obtener los usuarios actualizados
    // Esto evita la dependencia circular con InventoryContext
    const appData = loadData();
    const users = appData.users || [];

    return new Promise((resolve) => {
      setTimeout(() => {
        const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        
        // Validación simple de PIN
        if (foundUser && foundUser.pin === pin) {
          setUser(foundUser);
          localStorage.setItem('inventory_user_session', JSON.stringify(foundUser));
          resolve(true);
        } else {
          resolve(false);
        }
      }, 500); 
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('inventory_user_session');
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
