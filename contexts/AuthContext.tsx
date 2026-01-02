import React, { createContext, useState, useContext, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Демо пользователь
  const demoUser: User = {
    id: '1',
    name: 'Алексей Петров',
    email: 'alexey@example.com',
    joinDate: '15 января 2024',
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Имитация запроса к API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // В реальном приложении здесь был бы запрос к бэкенду
    // и валидация данных
    setIsAuthenticated(true);
    setUser(demoUser);
    setIsLoading(false);
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    // Имитация запроса к API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: '2',
      name,
      email,
      joinDate: new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    };
    
    setIsAuthenticated(true);
    setUser(newUser);
    setIsLoading(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};