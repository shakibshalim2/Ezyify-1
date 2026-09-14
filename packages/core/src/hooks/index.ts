import { createContext, useContext, useMemo } from 'react';
import { useStore } from 'zustand';
import type { Endpoints } from '../api/endpoints.js';
import type { AuthStore, AuthState } from '../stores/auth.js';
import type { CartStore, CartState } from '../stores/cart.js';

export interface EzyifyRuntime {
  api: Endpoints;
  auth: AuthStore;
  cart: CartStore;
}

/** Host apps (web/mobile) build the runtime once with their own storage + fetch and provide it here. */
export const EzyifyContext = createContext<EzyifyRuntime | null>(null);

export function useRuntime(): EzyifyRuntime {
  const ctx = useContext(EzyifyContext);
  if (!ctx) throw new Error('EzyifyContext.Provider is missing above this component');
  return ctx;
}

export const useApi = () => useRuntime().api;

export function useAuth<T = AuthState>(selector: (s: AuthState) => T = s => s as unknown as T): T {
  return useStore(useRuntime().auth, selector);
}

export function useCart<T = CartState>(selector: (s: CartState) => T = s => s as unknown as T): T {
  return useStore(useRuntime().cart, selector);
}

export function useCartCount() {
  const lines = useCart(s => s.lines);
  return useMemo(() => lines.reduce((n, l) => n + l.quantity, 0), [lines]);
}

export const queryKeys = {
  me: ['me'] as const,
  profile: (username: string) => ['profile', username] as const,
  products: (params: Record<string, unknown> = {}) => ['products', params] as const,
  product: (id: string) => ['product', id] as const,
  cart: ['cart'] as const,
  orders: (params: Record<string, unknown> = {}) => ['orders', params] as const,
  order: (id: string) => ['order', id] as const,
  wallet: ['wallet'] as const,
  feed: ['feed'] as const,
  notifications: ['notifications'] as const,
  conversations: ['conversations'] as const,
};
