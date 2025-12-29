// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW server instance for test environments
 */
export const server = setupServer(...handlers);
