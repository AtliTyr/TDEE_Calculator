import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  gender: 'male' | 'female';
  birthDate: string; // ISO string
  height?: number; // в см
  weight?: number; // в кг
  activityLevel?: number; // множитель активности
  joinDate: string;
  lastSync?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isLoading: boolean;
  isSyncing: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  gender: 'male' | 'female';
  birthDate: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = '@metabalance_user';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Загрузка сохраненного пользователя при запуске
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserToStorage = async (userData: UserProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to save user to storage:', error);
    }
  };

  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Имитация запроса к API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Демо-пользователь
    const demoUser: UserProfile = {
      id: '1',
      name: 'Алексей Петров',
      email: email || 'alexey@example.com',
      gender: 'male',
      birthDate: '1990-01-15',
      height: 175,
      weight: 75,
      activityLevel: 1.55,
      joinDate: '2024-01-15',
    };
    
    setUser(demoUser);
    setIsAuthenticated(true);
    await saveUserToStorage(demoUser);
    setIsLoading(false);
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    
    // Имитация запроса к API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newUser: UserProfile = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      gender: data.gender,
      birthDate: data.birthDate,
      joinDate: new Date().toISOString(),
    };
    
    setUser(newUser);
    setIsAuthenticated(true);
    await saveUserToStorage(newUser);
    setIsLoading(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) return;
    
    setIsSyncing(true);
    
    // Имитация синхронизации с сервером
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const updatedUser = {
      ...user,
      ...updates,
      lastSync: new Date().toISOString(),
    };
    
    setUser(updatedUser);
    await saveUserToStorage(updatedUser);
    setIsSyncing(false);
    
    // Не возвращаем значение, только Promise<void>
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    AsyncStorage.removeItem(STORAGE_KEY).catch(console.error);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        register,
        logout,
        updateProfile,
        isLoading,
        isSyncing,
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