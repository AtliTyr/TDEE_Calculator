import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'http://192.168.0.106:8000/api/v1';

export const apiFetch = async (
  path: string,
  options: RequestInit = {}
) => {
  const token = await AsyncStorage.getItem('@token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let res: Response;

  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('Не удалось подключиться к серверу');
  }

  let data: any = null;

  try {
    data = await res.json();
  } catch {
    /* пусто */
  }

  if (!res.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      `Ошибка запроса (${res.status})`
    );
  }

  return data;
};
