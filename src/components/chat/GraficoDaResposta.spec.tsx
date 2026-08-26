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

const matriz: EspecificacaoDeGrafico = {
  tipo: 'matriz',
  titulo: 'Escolaridade × ODS',
  formato: 'percentual',
  fonte: 'desempenho_por_escolaridade',
  itens: [],
  linhas: ['Ensino Médio', 'Ensino Superior'],
  colunas: ['ODS 2', 'ODS 10'],
  celulas: [
    { linha: 'Ensino Médio', coluna: 'ODS 2', valor: 70, intensidade: 1, detalhe: '10 respostas' },
    { linha: 'Ensino Superior', coluna: 'ODS 2', valor: 50, intensidade: 0.7 },
    // O cruzamento Ensino Médio × ODS 10 não existe: célula sem dado.
  ],
  nota: '1 cruzamento(s) sem nenhuma resposta.',
};

const agrupado: EspecificacaoDeGrafico = {
  tipo: 'barras_agrupadas',
  titulo: 'Cadastradas × respondidas',
  formato: 'contagem',
  fonte: 'cobertura_do_catalogo',
  itens: [
    { rotulo: 'ODS 4', valor: 3, proporcao: 1 },
    { rotulo: 'ODS 3', valor: 0, proporcao: 0 },
  ],
  series: [
    { nome: 'Cadastradas', cor: '#0a97d9', valores: [3, 0] },
    { nome: 'Já respondidas', cor: '#f59e0b', valores: [2, 0] },
  ],
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

  describe('matriz', () => {
    it('desenha os dois eixos do cruzamento', () => {
      render(<GraficoDaResposta grafico={matriz} />);

      expect(screen.getByRole('rowheader', { name: 'Ensino Médio' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: '2' })).toBeInTheDocument();
    });

    it('escreve o valor dentro da celula, nao so na cor', () => {
      // Quem nao distingue as cores precisa conseguir ler o numero.
      render(<GraficoDaResposta grafico={matriz} />);

      expect(screen.getByText('70')).toBeInTheDocument();
    });

    it('distingue cruzamento sem dado de valor zero', () => {
      render(<GraficoDaResposta grafico={matriz} />);

      expect(screen.getByTitle(/Ensino Médio · ODS 10: sem resposta/)).toBeInTheDocument();
    });

    it('mostra a legenda da escala', () => {
      // Sem legenda a intensidade da cor nao tem referencia.
      render(<GraficoDaResposta grafico={matriz} />);

      expect(screen.getByText('menor')).toBeInTheDocument();
      expect(screen.getByText('maior')).toBeInTheDocument();
    });

    it('oferece tabela equivalente', async () => {
      render(<GraficoDaResposta grafico={matriz} />);

      await userEvent.click(screen.getByRole('button', { name: /tabela/i }));

      expect(screen.getByRole('columnheader', { name: 'ODS 2' })).toBeInTheDocument();
      expect(screen.getByRole('cell', { name: '70,0%' })).toBeInTheDocument();
    });
  });

  describe('barras agrupadas', () => {
    it('sempre mostra a legenda das duas series', () => {
      // Com duas series a legenda e obrigatoria: identidade nunca so por cor.
      render(<GraficoDaResposta grafico={agrupado} />);

      expect(screen.getByText('Cadastradas')).toBeInTheDocument();
      expect(screen.getByText('Já respondidas')).toBeInTheDocument();
    });

    it('rotula o valor de cada barra das duas series', () => {
      render(<GraficoDaResposta grafico={agrupado} />);

      expect(screen.getByText('ODS 4')).toBeInTheDocument();
      expect(screen.getAllByText('3').length).toBeGreaterThan(0);
      expect(screen.getByText('2')).toBeInTheDocument();
    });
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
