import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { EspecificacaoDeGrafico } from '@/types';
import { GraficoDaResposta } from './GraficoDaResposta';

const barras: EspecificacaoDeGrafico = {
  tipo: 'barras',
  titulo: 'Taxa de acerto por ODS',
  formato: 'percentual',
  fonte: 'desempenho_por_ods',
  itens: [
    { rotulo: 'ODS 6 — Água', valor: 50, proporcao: 1, detalhe: '10 respostas', cor: '#26BDE2' },
    { rotulo: 'ODS 7 — Energia', valor: 25, proporcao: 0.5, detalhe: '4 respostas', cor: '#FCC30B' },
  ],
  nota: '1 item(ns) com menos de 10 respostas — percentual instavel.',
};

const indicador: EspecificacaoDeGrafico = {
  tipo: 'indicador',
  titulo: 'Desempenho no ODS 6',
  formato: 'percentual',
  fonte: 'desempenho_por_ods',
  itens: [{ rotulo: 'ODS 6 — Água', valor: 50, proporcao: 1, detalhe: '10 respostas' }],
};

describe('GraficoDaResposta', () => {
  it('mostra o título e o valor de cada barra', () => {
    render(<GraficoDaResposta grafico={barras} />);

    expect(screen.getByText('Taxa de acerto por ODS')).toBeInTheDocument();
    expect(screen.getByText('50,0%')).toBeInTheDocument();
    expect(screen.getByText('25,0%')).toBeInTheDocument();
  });

  it('exibe a ressalva de amostra junto do gráfico', () => {
    // Barra comprida sobre 4 respostas parece sólida e não é.
    render(<GraficoDaResposta grafico={barras} />);

    expect(screen.getByText(/percentual instavel/)).toBeInTheDocument();
  });

  it('informa a procedência dos dados', () => {
    render(<GraficoDaResposta grafico={barras} />);

    expect(screen.getByText('desempenho_por_ods')).toBeInTheDocument();
  });

  it('oferece a tabela equivalente ao gráfico', async () => {
    // O gráfico nunca pode ser a única via de leitura do valor.
    render(<GraficoDaResposta grafico={barras} />);

    await userEvent.click(screen.getByRole('button', { name: /tabela/i }));

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Valor' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'ODS 7 — Energia' })).toBeInTheDocument();
  });

  it('volta do modo tabela para o gráfico', async () => {
    render(<GraficoDaResposta grafico={barras} />);
    const botao = screen.getByRole('button', { name: /tabela/i });

    await userEvent.click(botao);
    await userEvent.click(botao);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renderiza valor único como número, sem barra nem alternador', () => {
    // Gráfico de uma barra é ruído: o número é o gráfico.
    render(<GraficoDaResposta grafico={indicador} />);

    expect(screen.getByText('50,0%')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /tabela/i })).not.toBeInTheDocument();
  });

  it('nao deixa rotulo longo estourar a barra', () => {
    // O rotulo de desempenho_por_pergunta e o enunciado inteiro. Sem truncagem
    // ele empurra o valor para fora do card.
    const { container } = render(
      <GraficoDaResposta
        grafico={{
          ...barras,
          itens: [
            {
              rotulo:
                'Qual dos objetivos abaixo trata especificamente de agua potavel, saneamento basico e gestao sustentavel dos recursos hidricos para todos?',
              valor: 50,
              proporcao: 1,
              detalhe: '10 respostas',
            },
          ],
        }}
      />,
    );

    const rotulo = container.querySelector('.truncate');
    expect(rotulo).not.toBeNull();
  });

  it('formata contagem sem casa decimal nem percentual', () => {
    render(
      <GraficoDaResposta
        grafico={{
          ...barras,
          formato: 'contagem',
          itens: [{ rotulo: 'ODS 4', valor: 3, proporcao: 1 }],
          tipo: 'indicador',
        }}
      />,
    );

    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
