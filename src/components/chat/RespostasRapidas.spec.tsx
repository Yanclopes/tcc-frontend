import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RespostasRapidas } from './RespostasRapidas';

const opcoes = ['Aprovar para Ensino Médio', 'Vincular à escola existente', 'Rejeitar'];

describe('RespostasRapidas', () => {
  it('nao renderiza nada sem opcoes', () => {
    const { container } = render(<RespostasRapidas opcoes={[]} onEscolher={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('mostra um botao por opcao', () => {
    render(<RespostasRapidas opcoes={opcoes} onEscolher={vi.fn()} />);

    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('envia o texto exato da opcao ao clicar', () => {
    // O texto do botao E a mensagem enviada: escrito na voz do administrador.
    const escolher = vi.fn();
    render(<RespostasRapidas opcoes={opcoes} onEscolher={escolher} />);

    void userEvent.click(screen.getByRole('button', { name: /vincular/i }));

    return vi.waitFor(() =>
      expect(escolher).toHaveBeenCalledWith('Vincular à escola existente'),
    );
  });

  it('desabilita enquanto uma resposta esta sendo processada', async () => {
    const escolher = vi.fn();
    render(<RespostasRapidas opcoes={opcoes} onEscolher={escolher} desabilitado />);

    await userEvent.click(screen.getByRole('button', { name: /rejeitar/i }));

    expect(escolher).not.toHaveBeenCalled();
  });
});
