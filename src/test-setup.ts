import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Desmonta components entre testes para nao vazar estado.
afterEach(() => {
  cleanup();
});
