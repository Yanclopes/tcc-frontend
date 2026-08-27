import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { PassoDoAssistente } from '@/types';
import { PassosDoAssistente } from './PassosDoAssistente';

const recuperacao: PassoDoAssistente = {
  tipo: 'recuperacao',
  trechos: [
    { fonte: 'curado:ressalvas', titulo: 'Ressalvas metodologicas', similaridade: 0.51 },
    { fonte: 'banco:question:6', titulo: 'Pergunta 6 — ODS 6', similaridade: 0.64 },
  ],
};

const ferramenta: PassoDoAssistente = {
  tipo: 'ferramenta',
  nome: 'desempenho_por_ods',
  argumentos: { goalNumber: 6 },
  resumo: '1 linha(s)',
};

describe('PassosDoAssistente', () => {
  it('nao renderiza nada quando nao ha passos', () => {
    const { container } = render(<PassosDoAssistente passos={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('resume os passos sem precisar abrir', () => {
    render(<PassosDoAssistente passos={[recuperacao, ferramenta]} />);

    expect(screen.getByRole('button')).toHaveTextContent('2 trechos recuperados');
    expect(screen.getByRole('button')).toHaveTextContent('1 consulta ao banco');
  });

  it('omite a contagem de consultas quando nenhuma ferramenta rodou', () => {
    render(<PassosDoAssistente passos={[recuperacao]} />);

    expect(screen.getByRole('button')).not.toHaveTextContent('consulta ao banco');
  });

  it('mantem o detalhe fechado por padrao', () => {
    render(<PassosDoAssistente passos={[recuperacao, ferramenta]} />);

    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Ressalvas metodologicas')).not.toBeInTheDocument();
  });

  it('revela os trechos e as consultas ao abrir', async () => {
    render(<PassosDoAssistente passos={[recuperacao, ferramenta]} />);

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Ressalvas metodologicas')).toBeInTheDocument();
    expect(screen.getByText('Pergunta 6 — ODS 6')).toBeInTheDocument();
    expect(screen.getByText(/desempenho_por_ods/)).toBeInTheDocument();
    // A similaridade e o que permite auditar a qualidade da recuperacao.
    expect(screen.getByText('0.51')).toBeInTheDocument();
  });

  it('diz explicitamente quando a base nao sustentou a resposta', async () => {
    // Recuperacao vazia significa que a resposta NAO veio do RAG. Esconder isso
    // faria o pesquisador atribuir a base uma afirmacao que ela nao sustenta.
    render(<PassosDoAssistente passos={[{ tipo: 'recuperacao', trechos: [] }]} />);

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByText(/Nada relevante encontrado/)).toBeInTheDocument();
  });

  it('destaca a ferramenta que falhou', async () => {
    render(
      <PassosDoAssistente
        passos={[{ ...ferramenta, resumo: '', erro: 'tempo esgotado' }]}
      />,
    );

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByText('tempo esgotado')).toBeInTheDocument();
  });
});
