import { api } from '@/lib/api';
import type { AcaoProposta, ChatConversa, ChatMensagem, ChatResposta, ChatStatus } from '@/types';

/**
 * Assistente de análise com RAG (admin). A chave da OpenAI vive apenas no
 * back-end — o front nunca a vê. Ver .specs/06-chat-ia.md.
 */
export const chatService = {
  /** Diz se o assistente está configurado e quanto há indexado. */
  async status(): Promise<ChatStatus> {
    const { data } = await api.get<ChatStatus>('/chat/status');
    return data;
  },

  async listarConversas(): Promise<ChatConversa[]> {
    const { data } = await api.get<ChatConversa[]>('/chat/conversas');
    return data;
  },

  async criarConversa(titulo?: string): Promise<ChatConversa> {
    const { data } = await api.post<ChatConversa>('/chat/conversas', titulo ? { titulo } : {});
    return data;
  },

  async obterConversa(
    id: string,
  ): Promise<{ conversa: ChatConversa; mensagens: ChatMensagem[] }> {
    const { data } = await api.get<{ conversa: ChatConversa; mensagens: ChatMensagem[] }>(
      `/chat/conversas/${id}`,
    );
    return data;
  },

  async removerConversa(id: string): Promise<void> {
    await api.delete(`/chat/conversas/${id}`);
  },

  /** Envia uma pergunta. Pode demorar: há embedding, recuperação e tool calling. */
  async perguntar(conversaId: string, pergunta: string): Promise<ChatResposta> {
    const { data } = await api.post<ChatResposta>(
      `/chat/conversas/${conversaId}/mensagens`,
      { pergunta },
    );
    return data;
  },
};

/**
 * Executa uma ação proposta pelo assistente.
 *
 * Dispara o endpoint administrativo de sempre — o mesmo que as telas de
 * Perguntas e Escolas usam —, com `RolesGuard`, validação de DTO e
 * `audit_log`. O assistente montou o formulário; quem submete é o
 * administrador, ao clicar. Ver `.specs/06-chat-ia.md`.
 */
export async function executarAcao(acao: AcaoProposta): Promise<void> {
  const { metodo, caminho, corpo } = acao.requisicao;
  if (metodo === 'POST') {
    await api.post(caminho, corpo);
    return;
  }
  await api.patch(caminho, corpo);
}
