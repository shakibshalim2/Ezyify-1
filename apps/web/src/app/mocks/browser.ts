// Mock Service Worker Browser Setup
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Setup MSW worker for browser environment
export const worker = setupWorker(...handlers);

// Note: Worker is started in App.tsx to avoid import.meta.env issues
// Start worker in development mode is handled in App.tsx