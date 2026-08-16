import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import { userService } from './user.service';

// Mock do axios instance: monkey-patch dos metodos que o service usa.
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api');
  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe('userService', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
    vi.mocked(api.post).mockReset();
    vi.mocked(api.patch).mockReset();
    vi.mocked(api.delete).mockReset();
  });

  it('me() usa GET /users/me e devolve o AuthUser', async () => {
    const fakeUser = {
      id: 1,
      name: 'Maria',
      email: 'maria@x',
      role: 'user' as const,
      needsSchoolReregistration: false,
      needsConsentReacceptance: true,
      currentConsentVersion: '2026-01-v1',
    };
    vi.mocked(api.get).mockResolvedValueOnce({ data: fakeUser } as never);

    const result = await userService.me();
    expect(vi.mocked(api.get)).toHaveBeenCalledWith('/users/me');
    expect(result).toEqual(fakeUser);
  });

  it('updateOwnSchool() manda PATCH com o payload', async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({ data: { id: 1 } } as never);
    await userService.updateOwnSchool({ stateId: 1, cityId: 2, schoolId: 3 });
    expect(vi.mocked(api.patch)).toHaveBeenCalledWith('/users/me/school', {
      stateId: 1,
      cityId: 2,
      schoolId: 3,
    });
  });

  it('acceptConsent() manda POST vazio e devolve a versao aceita', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { consentVersion: '2026-02-v1' } } as never);
    const r = await userService.acceptConsent();
    expect(vi.mocked(api.post)).toHaveBeenCalledWith('/users/me/consent');
    expect(r).toEqual({ consentVersion: '2026-02-v1' });
  });

  it('deleteMyAccount() usa DELETE /users/me com senha no body', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({} as never);
    await userService.deleteMyAccount('senha123');
    expect(vi.mocked(api.delete)).toHaveBeenCalledWith('/users/me', {
      data: { password: 'senha123' },
    });
  });

  it('anonymizeMyAccount() usa POST /users/me/anonymize com senha', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({} as never);
    await userService.anonymizeMyAccount('senha123');
    expect(vi.mocked(api.post)).toHaveBeenCalledWith('/users/me/anonymize', {
      password: 'senha123',
    });
  });
});
