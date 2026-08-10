import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export const TOKEN_KEY = 'ods_token';

/** Instância única do Axios usada por todos os serviços. */
export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Anexa o token JWT (quando existir) em cada requisição.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Em caso de 401 (token inválido/expirado), limpa a sessão e redireciona.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

/** Extrai uma mensagem de erro amigável de uma falha do Axios. */
export function extractError(error: unknown, fallback = 'Ocorreu um erro inesperado.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(' ') : data.message;
    }
    if (error.message) return error.message;
  }
  return fallback;
}
