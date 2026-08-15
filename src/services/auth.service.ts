import { api } from '@/lib/api';
import type { AuthResponse } from '@/types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  /** Obrigatório — sustenta o recorte por segmento educacional na pesquisa. */
  educationLevelId: number;
  /** Obrigatório — sustenta o recorte regional. */
  stateId: number;
  cityId: number;
  /** Uma das duas opções abaixo é obrigatória. */
  schoolId?: number;
  suggestedSchoolName?: string;
  suggestedSchoolCityId?: number;
  consentVersion?: string;
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
