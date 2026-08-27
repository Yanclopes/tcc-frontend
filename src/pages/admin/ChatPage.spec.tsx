import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '@/context/ToastContext';
import { chatService } from '@/services/chat.service';
import { ChatPage } from './ChatPage';

/**
 * Comportamento da lista de conversas no mobile.
 *
 * Num grid de coluna unica a lista fica EMPILHADA acima do chat, e era preciso
 * rolar todas as conversas antes de chegar nas mensagens. Ela passou a ser um
 * painel recolhivel; estes testes travam o recolhimento.
 */
describe('ChatPage — lista de conversas', () => {
  beforeEach(() => {
    vi.spyOn(chatService, 'status').mockResolvedValue({
      habilitado: true,
      trechosIndexados: 100,
      modelo: 'gpt-4o-mini',
    });
    vi.spyOn(chatService, 'listarConversas').mockResolvedValue([
      { id: 'c1', titulo: 'Desempenho por ODS', criadaEm: '', atualizadaEm: '' },
      { id: 'c2', titulo: 'Escolas sem participação', criadaEm: '', atualizadaEm: '' },
    ]);
    vi.spyOn(chatService, 'obterConversa').mockResolvedValue({
      conversa: { id: 'c1', titulo: 'Desempenho por ODS', criadaEm: '', atualizadaEm: '' },
      mensagens: [],
    });
  });

  afterEach(() => vi.restoreAllMocks());

  const renderizar = () =>
    render(
      <MemoryRouter>
        <ToastProvider>
          <ChatPage />
        </ToastProvider>
      </MemoryRouter>,
    );

  it('comeca com a lista recolhida, mostrando quantas conversas existem', async () => {
    renderizar();

    const alternador = await screen.findByRole('button', { expanded: false });
    expect(alternador).toHaveTextContent('2');
  });

  it('revela as conversas ao expandir', async () => {
    renderizar();
    const alternador = await screen.findByRole('button', { expanded: false });

    await userEvent.click(alternador);

    expect(screen.getByRole('button', { name: 'Desempenho por ODS' })).toBeInTheDocument();
    expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument();
  });

  it('recolhe de novo ao escolher uma conversa', async () => {
    // Senao, no mobile, a lista continuaria cobrindo o chat que voce acabou de
    // abrir.
    renderizar();
    await userEvent.click(await screen.findByRole('button', { expanded: false }));

    await userEvent.click(screen.getByRole('button', { name: 'Desempenho por ODS' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument(),
    );
  });

  it('recolhe ao iniciar uma conversa nova', async () => {
    renderizar();
    await userEvent.click(await screen.findByRole('button', { expanded: false }));

    await userEvent.click(screen.getByRole('button', { name: /nova conversa/i }));

    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
  });

  it('mantem o campo de pergunta sempre acessivel', async () => {
    // O campo fica fora da area que rola: mensagem longa nao pode empurra-lo
    // para fora da tela.
    renderizar();

    expect(await screen.findByLabelText('Pergunta')).toBeInTheDocument();
  });
});
