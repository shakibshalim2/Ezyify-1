import { createStore } from 'zustand/vanilla';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS, memoryStorage, type KeyValueStorage } from './storage';

export interface LocalCartLine {
  productId: string;
  variantId: string | null;
  quantity: number;
}

export interface CartState {
  lines: LocalCartLine[];
  add(productId: string, quantity?: number, variantId?: string | null): void;
  setQuantity(productId: string, quantity: number, variantId?: string | null): void;
  remove(productId: string, variantId?: string | null): void;
  clear(): void;
  count(): number;
}

const same = (a: LocalCartLine, productId: string, variantId: string | null) =>
  a.productId === productId && a.variantId === variantId;

/** Guest cart kept locally; merged into the server cart on login by the host app. */
export function createCartStore(storage: KeyValueStorage = memoryStorage()) {
  return createStore<CartState>()(
    persist(
      (set, get) => ({
        lines: [],
        add: (productId, quantity = 1, variantId = null) =>
          set(s => {
            const existing = s.lines.find(l => same(l, productId, variantId));
            if (existing) {
              return { lines: s.lines.map(l => (same(l, productId, variantId) ? { ...l, quantity: Math.min(99, l.quantity + quantity) } : l)) };
            }
            return { lines: [...s.lines, { productId, variantId, quantity: Math.min(99, quantity) }] };
          }),
        setQuantity: (productId, quantity, variantId = null) =>
          set(s => ({
            lines:
              quantity <= 0
                ? s.lines.filter(l => !same(l, productId, variantId))
                : s.lines.map(l => (same(l, productId, variantId) ? { ...l, quantity: Math.min(99, quantity) } : l)),
          })),
        remove: (productId, variantId = null) => set(s => ({ lines: s.lines.filter(l => !same(l, productId, variantId)) })),
        clear: () => set({ lines: [] }),
        count: () => get().lines.reduce((n, l) => n + l.quantity, 0),
      }),
      { name: STORAGE_KEYS.cart, storage: createJSONStorage(() => storage) },
    ),
  );
}

export type CartStore = ReturnType<typeof createCartStore>;
