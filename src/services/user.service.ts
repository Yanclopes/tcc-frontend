import { api } from '@/lib/api';
import type { AuthUser } from '@/types';

export interface UpdateOwnSchoolPayload {
  stateId: number;
  cityId: number;
  schoolId?: number;
  suggestedSchoolName?: string;
}

/** Serviços do usuário autenticado (LGPD + completar perfil). */
export const userService = {
  async me(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>('/users/me');
    return data;
  },

  async updateOwnSchool(payload: UpdateOwnSchoolPayload): Promise<AuthUser> {
    const { data } = await api.patch<AuthUser>('/users/me/school', payload);
    return data;
  },

  /** Baixa TODOS os dados pessoais como Blob (Content-Type: application/json). */
  async exportMyData(): Promise<Blob> {
    const res = await api.get('/users/me/export', { responseType: 'blob' });
    return res.data as Blob;
  },

  /** Exclui a própria conta. Exige a senha atual. Ao voltar, o token está inválido. */
  async deleteMyAccount(password: string): Promise<void> {
    await api.delete('/users/me', { data: { password } });
  },
};
