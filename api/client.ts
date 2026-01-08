import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'http://192.168.0.103:8000/api/v1';

/* =======================
   STORAGE KEYS
======================= */

const ACCESS_TOKEN_KEY = '@access_token';
const REFRESH_TOKEN_KEY = '@refresh_token';

/* =======================
   TYPES
======================= */

interface CustomRequestInit extends RequestInit {
  _retry?: boolean;
}

type FailedQueueItem = {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
};

/* =======================
   REFRESH QUEUE
======================= */

let isRefreshing = false;
const failedQueue: FailedQueueItem[] = [];

const processQueue = (error?: any) => {
  failedQueue.forEach(p => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve();
    }
  });
  failedQueue.length = 0;
};

/* =======================
   TOKEN STORAGE
======================= */

export const saveTokens = async (
  accessToken: string,
  refreshToken: string
) => {
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, accessToken],
    [REFRESH_TOKEN_KEY, refreshToken],
  ]);
};

export const clearTokens = async () => {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
};

export const getTokens = async () => {
  const [[, accessToken], [, refreshToken]] = await AsyncStorage.multiGet([
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
  ]);
  return { accessToken, refreshToken };
};

/* =======================
   REFRESH TOKEN
======================= */

/**
 * EXPECTED BACKEND SIGNATURE:
 *
 * @router.post("/auth/refresh")
 * async def refresh(refresh_token: str = Body(...)):
 *     ...
 */
const refreshAccessToken = async (refreshToken: string) => {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('Refresh failed:', err);
    return null;
  }

  return response.json();
};

/* =======================
   API FETCH
======================= */

export const apiFetch = async (
  path: string,
  options: CustomRequestInit = {}
): Promise<any> => {
  const { accessToken } = await getTokens();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  /* =======================
     401 HANDLING
  ======================= */

  if (response.status === 401 && !options._retry && path !== '/auth/refresh') {
    const { refreshToken } = await getTokens();

    if (!refreshToken) {
      await clearTokens();
      throw new Error('NO_REFRESH_TOKEN');
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() =>
        apiFetch(path, { ...options, _retry: true })
      );
    }

    isRefreshing = true;

    try {
      const refreshed = await refreshAccessToken(refreshToken);

      if (!refreshed?.access_token) {
        throw new Error('SESSION_EXPIRED');
      }

      await saveTokens(
        refreshed.access_token,
        refreshed.refresh_token ?? refreshToken
      );

      processQueue();
      return apiFetch(path, { ...options, _retry: true });
    } catch (err) {
      processQueue(err);
      await clearTokens();
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  /* =======================
     RESPONSE HANDLING
  ======================= */

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        `HTTP ${response.status}`
    );
  }

  return data;
};

/* =======================
   AUTH
======================= */

export const login = async (email: string, password: string) => {
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'LOGIN_FAILED');
  }

  const data = await response.json();

  if (!data.access_token || !data.refresh_token) {
    throw new Error('INVALID_LOGIN_RESPONSE');
  }

  await saveTokens(data.access_token, data.refresh_token);
  return data;
};
