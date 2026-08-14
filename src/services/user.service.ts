import { api } from '@/lib/api';

/** Serviços do usuário autenticado (LGPD: portabilidade e esquecimento). */
export const userService = {
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
