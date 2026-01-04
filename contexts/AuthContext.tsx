import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '@/api/client';

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

  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    height?: number | null;
    weight?: number | null;
    activityLevel?: string | null;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = '@token';

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

  useEffect(() => {
    restoreSession();
  }, []);

  /* =======================
     SESSION RESTORE
  ======================= */

  const restoreSession = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) return;

      const me = await apiFetch('/users/me');
      setUser(normalizeUser(me));
      setIsAuthenticated(true);
    } catch {
      await AsyncStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================
     LOGIN
  ======================= */

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const tokenResponse = await apiFetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: email,
          password,
        }).toString(),
      });

      await AsyncStorage.setItem(TOKEN_KEY, tokenResponse.access_token);

      const me = await apiFetch('/users/me');
      console.log(me);
      setUser(normalizeUser(me));
      setIsAuthenticated(true);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'detail' in err
          ? String((err as any).detail)
          : 'Login failed';

      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================
     REGISTER
  ======================= */

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
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

      await login(data.email, data.password);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'detail' in err
          ? String((err as any).detail)
          : 'Registration failed';

      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================
     UPDATE PROFILE
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

      // console.log('Backend response:', updated);
      // console.log('Activity code from backend:', updated.profile?.activity_level_code);

      setUser(normalizeUser(updated));
    } catch (error) {
      console.error('Update profile error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  /* =======================
     LOGOUT (CLIENT ONLY)
  ======================= */

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isSyncing,
        login,
        register,
        logout,
        updateProfile,
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
