import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface LinkDoMenu {
  to: string;
  label: string;
  icon?: LucideIcon;
}

/**
 * Agrupa as telas administrativas num único menu.
 *
 * Sem isso, um admin via seis itens lado a lado na barra e as opções do dia a
 * dia (Jogar, Ranking) ficavam espremidas entre ferramentas de gestão. Aqui o
 * gatilho é um só, e ele **nem aparece** para quem não é admin.
 */
export function MenuAdmin({ links }: { links: LinkDoMenu[] }) {
  const { pathname } = useLocation();

  if (links.length === 0) return null;

  // O gatilho fica destacado quando você está numa das telas de dentro —
  // senão, dentro do admin, a barra não indicaria onde você está.
  const dentro = links.some((link) => pathname.startsWith(link.to));

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium outline-none transition',
          dentro ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
        )}
      >
        <Shield className="h-4 w-4" />
        Administração
        <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[13rem] rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
        >
          {links.map((link) => (
            <DropdownMenu.Item key={link.to} asChild>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none',
                    isActive
                      ? 'bg-brand-50 font-medium text-brand-700'
                      : 'text-slate-700 data-[highlighted]:bg-slate-100',
                  )
                }
              >
                {link.icon && <link.icon className="h-4 w-4 shrink-0" />}
                {link.label}
              </NavLink>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
