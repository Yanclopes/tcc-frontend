import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import { chatService } from './chat.service';

describe('chatService', () => {
  afterEach(() => vi.restoreAllMocks());

  it('consulta o status do assistente', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({
      data: { habilitado: true, trechosIndexados: 100, modelo: 'gpt-4o-mini' },
    } as never);

    await expect(chatService.status()).resolves.toEqual({
      habilitado: true,
      trechosIndexados: 100,
      modelo: 'gpt-4o-mini',
    });
    expect(get).toHaveBeenCalledWith('/chat/status');
  });

  it('cria conversa sem corpo quando nao ha titulo', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { id: 'abc' } } as never);

    await chatService.criarConversa();

    expect(post).toHaveBeenCalledWith('/chat/conversas', {});
  });

  it('cria conversa com o titulo informado', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { id: 'abc' } } as never);

    await chatService.criarConversa('Desempenho por ODS');

    expect(post).toHaveBeenCalledWith('/chat/conversas', { titulo: 'Desempenho por ODS' });
  });

  it('envia a pergunta para a conversa correta', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({
      data: { mensagem: { id: 1, papel: 'assistente', conteudo: 'ok' }, trechosCitados: [] },
    } as never);

    const resposta = await chatService.perguntar('conv-1', 'Qual o ODS com menor acerto?');

    expect(post).toHaveBeenCalledWith('/chat/conversas/conv-1/mensagens', {
      pergunta: 'Qual o ODS com menor acerto?',
    });
    expect(resposta.mensagem.conteudo).toBe('ok');
  });

  it('apaga a conversa pelo id', async () => {
    const del = vi.spyOn(api, 'delete').mockResolvedValue({ data: undefined } as never);

    await chatService.removerConversa('conv-1');

    expect(del).toHaveBeenCalledWith('/chat/conversas/conv-1');
  });

  it('propaga a falha para a tela tratar', async () => {
    // O componente traduz o erro via extractError; o servico nao deve engolir.
    vi.spyOn(api, 'get').mockRejectedValue(new Error('rede'));

    await expect(chatService.listarConversas()).rejects.toThrow('rede');
  });
});
