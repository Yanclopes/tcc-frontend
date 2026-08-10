import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Combina classes condicionais e resolve conflitos do Tailwind. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Formata um número 0-1 como porcentagem (ex.: 0.6563 -> "65,6%"). */
export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits).replace('.', ',')}%`;
}

/** Formata milissegundos em segundos legíveis (ex.: 5200 -> "5,2 s"). */
export function formatMs(ms: number): string {
  if (!ms) return '—';
  return `${(ms / 1000).toFixed(1).replace('.', ',')} s`;
}

/** Formata inteiros com separador de milhar pt-BR. */
export function formatInt(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value ?? 0);
}
