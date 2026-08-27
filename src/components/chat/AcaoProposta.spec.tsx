import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '@/context/ToastContext';
import * as chatService from '@/services/chat.service';
import type { AcaoProposta as Proposta } from '@/types';
import { AcaoProposta } from './AcaoProposta';

const proposta: Proposta = {
  id: 'acao-1',
  tipo: 'definir_pergunta_ativa',
  resumo: 'Desativar a pergunta 7.',
  detalhes: [
    { rotulo: 'Pergunta', valor: 'Qual ODS trata de água?' },
    { rotulo: 'Respostas coletadas', valor: '6' },
  ],
  avisos: [
    { nivel: 'atencao', texto: 'Apenas 6 respostas — amostra pequena demais para concluir.' },
    { nivel: 'informacao', texto: 'As respostas coletadas são preservadas.' },
  ],
  requisicao: { metodo: 'PATCH', caminho: '/questions/7/active', corpo: { isActive: false } },
};

function renderizar(acao: Proposta = proposta) {
  return render(
    <ToastProvider>
      <AcaoProposta acao={acao} />
    </ToastProvider>,
  );
}

describe('AcaoProposta', () => {
  afterEach(() => vi.restoreAllMocks());

  it('deixa explícito que nada foi executado ainda', () => {
    renderizar();

    expect(screen.getByText(/nada foi executado ainda/i)).toBeInTheDocument();
  });

  it('mostra o resumo e os detalhes para revisão', () => {
    renderizar();

    expect(screen.getByText('Desativar a pergunta 7.')).toBeInTheDocument();
    expect(screen.getByText('Qual ODS trata de água?')).toBeInTheDocument();
  });

  it('exibe os avisos acima dos botões', () => {
    renderizar();

    expect(screen.getByText(/amostra pequena demais/)).toBeInTheDocument();
    expect(screen.getByText(/são preservadas/)).toBeInTheDocument();
  });

  it('nao executa nada ao renderizar', () => {
    // O ponto central: a proposta aparece, mas a escrita so acontece no clique.
    const executar = vi.spyOn(chatService, 'executarAcao');

    renderizar();

    expect(executar).not.toHaveBeenCalled();
  });

  it('executa somente quando o administrador confirma', async () => {
    const executar = vi.spyOn(chatService, 'executarAcao').mockResolvedValue(undefined);

    renderizar();
    await userEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    expect(executar).toHaveBeenCalledWith(proposta);
    // 'Executada' exato: o toast tambem diz 'Acao executada.' e a busca por
    // regex casaria com os dois.
    expect(await screen.findByText('Executada')).toBeInTheDocument();
  });

  it('nao executa quando o administrador descarta', async () => {
    const executar = vi.spyOn(chatService, 'executarAcao');

    renderizar();
    await userEvent.click(screen.getByRole('button', { name: /descartar/i }));

    expect(executar).not.toHaveBeenCalled();
    expect(screen.getByText(/descartada/i)).toBeInTheDocument();
  });

  it('volta ao estado pendente se a execucao falhar', async () => {
    // Falhou: o administrador precisa poder tentar de novo, nao ficar travado.
    vi.spyOn(chatService, 'executarAcao').mockRejectedValue(new Error('403'));

    renderizar();
    await userEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    expect(await screen.findByRole('button', { name: /confirmar/i })).toBeEnabled();
  });

  it('nao oferece confirmar duas vezes', async () => {
    vi.spyOn(chatService, 'executarAcao').mockResolvedValue(undefined);

    renderizar();
    await userEvent.click(screen.getByRole('button', { name: /confirmar/i }));

    expect(screen.queryByRole('button', { name: /confirmar/i })).not.toBeInTheDocument();
  });
});
