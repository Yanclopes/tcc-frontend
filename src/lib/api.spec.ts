import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { extractError } from './api';

/**
 * extractError traduz falhas do axios em mensagens amigaveis, sem vazar
 * detalhes internos (stack de 500, etc.).
 */
describe('extractError', () => {
  function axiosErrorWithStatus(status: number, data?: unknown): AxiosError {
    return new AxiosError(
      'Request failed',
      String(status),
      { headers: new AxiosHeaders() } as never,
      undefined,
      {
        status,
        data,
        statusText: '',
        headers: {},
        config: { headers: new AxiosHeaders() } as never,
      },
    );
  }

  it('traduz 429 em mensagem de "muitas requisicoes"', () => {
    const msg = extractError(axiosErrorWithStatus(429));
    expect(msg).toMatch(/muitas requisi/i);
  });

  it('mascara detalhes do servidor em 5xx', () => {
    const msg = extractError(
      axiosErrorWithStatus(500, { message: 'Cannot read property foo of undefined' }),
    );
    expect(msg).toMatch(/erro no servidor/i);
    expect(msg).not.toMatch(/undefined/);
  });

  it('propaga message do backend em 4xx', () => {
    const msg = extractError(axiosErrorWithStatus(400, { message: 'Escolaridade obrigatoria' }));
    expect(msg).toBe('Escolaridade obrigatoria');
  });

  it('junta array de mensagens (validation pipe do Nest)', () => {
    const msg = extractError(
      axiosErrorWithStatus(400, { message: ['nome obrigatorio', 'email invalido'] }),
    );
    expect(msg).toBe('nome obrigatorio email invalido');
  });

  it('usa fallback quando nao e erro do axios', () => {
    const msg = extractError(new Error('boom'), 'algo deu errado');
    expect(msg).toBe('algo deu errado');
  });
});
