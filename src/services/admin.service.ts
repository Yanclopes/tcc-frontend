import { api } from '@/lib/api';
import type { AdminQuestion, AdminUser, Role } from '@/types';

export interface QuestionInput {
  text: string;
  goalNumber: number;
  options: { text: string }[];
  correctOptionIndex: number;
  difficulty?: number;
  educationLevelId?: number;
  source?: string;
}

/** Manutenção de perguntas (admin). */
export const questionsAdminService = {
  async list(goalNumber?: number): Promise<AdminQuestion[]> {
    const { data } = await api.get<AdminQuestion[]>('/questions', {
      params: goalNumber ? { goalNumber } : undefined,
    });
    return data;
  },

  async create(input: QuestionInput): Promise<AdminQuestion> {
    const { data } = await api.post<AdminQuestion>('/questions', input);
    return data;
  },

  async update(id: number, input: Partial<QuestionInput> & { isActive?: boolean }): Promise<AdminQuestion> {
    const { data } = await api.patch<AdminQuestion>(`/questions/${id}`, input);
    return data;
  },

  async setActive(id: number, isActive: boolean): Promise<AdminQuestion> {
    const { data } = await api.patch<AdminQuestion>(`/questions/${id}/active`, { isActive });
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/questions/${id}`);
  },
};

/** Gestão de usuários e papéis (somente master para alterar papel). */
export const usersAdminService = {
  async list(): Promise<AdminUser[]> {
    const { data } = await api.get<AdminUser[]>('/users');
    return data;
  },

  async setRole(id: number, role: Extract<Role, 'user' | 'admin'>): Promise<AdminUser> {
    const { data } = await api.patch<AdminUser>(`/users/${id}/role`, { role });
    return data;
  },
};
