import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BarChart3, Bot } from 'lucide-react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { MenuAdmin } from './MenuAdmin';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/admin/chat', label: 'Assistente', icon: Bot },
];

function renderizar(itens = links, rota = '/') {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <MenuAdmin links={itens} />
    </MemoryRouter>,
  );
}

describe('MenuAdmin', () => {
  it('nao aparece quando nao ha link administrativo', () => {
    // Quem nao e admin recebe a lista vazia e nao deve ver nem o gatilho.
    const { container } = renderizar([]);

    expect(container).toBeEmptyDOMElement();
  });

  it('mostra um gatilho unico em vez de um item por tela', () => {
    renderizar();

    expect(screen.getByRole('button', { name: /administração/i })).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('revela as telas ao abrir', async () => {
    renderizar();

    await userEvent.click(screen.getByRole('button', { name: /administração/i }));

    expect(await screen.findByRole('menuitem', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /assistente/i })).toBeInTheDocument();
  });

  it('aplica as classes reais no item, e nao o codigo da funcao', async () => {
    // Regressao: com className em forma de FUNCAO dentro de asChild, o Radix
    // concatenava e o atributo class virava o codigo-fonte. O item ficava sem
    // estilo, e sem `flex` o icone empilhava sobre o texto.
    renderizar();
    await userEvent.click(screen.getByRole('button', { name: /administração/i }));

    const item = await screen.findByRole('menuitem', { name: /dashboard/i });

    expect(item.className).not.toContain('=>');
    expect(item.className).toContain('flex');
    expect(item.className).toContain('items-center');
  });

  it('marca o item da rota atual', async () => {
    renderizar(links, '/dashboard');
    await userEvent.click(screen.getByRole('button', { name: /administração/i }));

    const item = await screen.findByRole('menuitem', { name: /dashboard/i });

    expect(item.className).toMatch(/brand/);
  });

  it('destaca o gatilho quando a rota atual esta dentro do menu', () => {
    // Sem isso, dentro do admin a barra nao indicaria onde voce esta.
    renderizar(links, '/admin/chat');

    expect(screen.getByRole('button', { name: /administração/i }).className).toMatch(/brand/);
  });

  it('nao destaca o gatilho em rota de fora', () => {
    renderizar(links, '/ranking');

    expect(screen.getByRole('button', { name: /administração/i }).className).not.toMatch(/brand/);
  });
});
