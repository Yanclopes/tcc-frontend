import { api } from '@/lib/api';
import type { AuthResponse } from '@/types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  /** Obrigatório — sustenta o recorte por segmento educacional na pesquisa. */
  educationLevelId: number;
  schoolId?: number;
  consentVersion?: string;
  /** Escola inexistente sugerida pelo aluno (gera sugestão para o admin). */
  suggestedSchoolName?: string;
  suggestedSchoolCityId?: number;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    return data;
  },
};
