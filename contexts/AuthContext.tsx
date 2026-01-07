import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { 
  apiFetch, 
  login as apiLogin, 
  getTokens, 
  clearTokens,
  saveTokens
} from '@/api/client';

/* =======================
   FRONTEND MODELS
======================= */

export type User = {
  id: string;
  email: string;
  createdAt: string;

  name: string;
  gender: 'male' | 'female';
  birthDate: string | null;

  height: number | null;
  weight: number | null;
  activityLevel: string | null;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
  gender: 'male' | 'female';
  birthDate: string;
};

/* =======================
   BACKEND DTO (RAW)
======================= */

type BackendUserResponse = {
  id: string;
  email: string;
  created_at: string;
  profile?: {
    name: string;
    gender: 'male' | 'female';
    birth_date: string | null;
    height_cm?: number | null;
    weight_kg?: number | null;
    activity_level_id?: number | null;
    activity_level_code?: string | null;
  } | null;
};

/* =======================
   CONTEXT
======================= */

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    height?: number | null;
    weight?: number | null;
    activityLevel?: string | null;
  }) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =======================
   NORMALIZATION
======================= */

const normalizeUser = (data: BackendUserResponse): User => ({
  id: data.id,
  email: data.email,
  createdAt: data.created_at,

  name: data.profile?.name ?? '',
  gender: data.profile?.gender ?? 'male',
  birthDate: data.profile?.birth_date ?? null,

  height: data.profile?.height_cm ?? null,
  weight: data.profile?.weight_kg ?? null,
  activityLevel: data.profile?.activity_level_code ?? null,
});

/* =======================
   PROVIDER
======================= */

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  /* =======================
     ОЧИСТКА ОШИБОК
  ======================= */

  const clearError = () => {
    setError(null);
  };

  /* =======================
     ПРОВЕРКА АВТОРИЗАЦИИ
  ======================= */

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const { accessToken } = await getTokens();
      
      if (!accessToken) {
        setIsAuthenticated(false);
        return;
      }

      // Пробуем получить данные пользователя
      const me = await apiFetch('/users/me');
      setUser(normalizeUser(me));
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error('Auth check error:', err.message);
      if (err.message !== 'NO_REFRESH_TOKEN') {
        setError('Ошибка проверки авторизации');
      }
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================
     ЛОГИН
  ======================= */

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Логинимся и получаем токены
      await apiLogin(email, password);
      
      // 2. Получаем данные пользователя с новым токеном
      const me = await apiFetch('/users/me');
      setUser(normalizeUser(me));
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error('Login error:', err.message);
      
      let message = err?.message || 'Ошибка авторизации';
      
      if (err.message === 'SESSION_EXPIRED') {
        message = 'Сессия истекла. Пожалуйста, войдите снова.';
      } else if (err.message === 'NO_REFRESH_TOKEN') {
        message = 'Требуется повторная авторизация';
      }
      
      setError(message);
      await clearTokens();
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================
     РЕГИСТРАЦИЯ
  ======================= */

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Регистрируемся
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          gender: data.gender,
          birth_date: data.birthDate,
        }),
      });

      // 2. Автоматический логин после регистрации
      await login(data.email, data.password);
    } catch (err: any) {
      console.error('Register error:', err.message);
      
      let message = err?.message || 'Ошибка регистрации';
      
      if (err.message === 'SESSION_EXPIRED') {
        message = 'Ошибка сессии. Попробуйте снова.';
      }
      
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================
     ОБНОВЛЕНИЕ ПРОФИЛЯ
  ======================= */

  const updateProfile = async (updates: {
    height?: number | null;
    weight?: number | null;
    activityLevel?: string | null;
  }) => {
    setIsSyncing(true);
    try {
      const payload = {
        height_cm: updates.height,
        weight_kg: updates.weight,
        activity_level_code: updates.activityLevel,
      };

      const updated = await apiFetch('/users/me/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setUser(normalizeUser(updated));
    } catch (error: any) {
      console.error('Update profile error:', error.message);
      
      if (error.message === 'SESSION_EXPIRED') {
        setError('Сессия истекла. Пожалуйста, войдите снова.');
      } else {
        setError('Ошибка обновления профиля');
      }
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  /* =======================
     ЛОГАУТ
  ======================= */

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Игнорируем ошибки логаута
      console.log('Logout error (ignored):', error);
    } finally {
      await clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isSyncing,
        error,
        login,
        register,
        logout,
        updateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =======================
   HOOK
======================= */

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};