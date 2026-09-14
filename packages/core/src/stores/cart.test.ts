import { describe, it, expect } from 'vitest';
import { createCartStore } from './cart.js';
import { memoryStorage } from './storage.js';

describe('cart store', () => {
  it('merges same product+variant and caps at 99', () => {
    const cart = createCartStore(memoryStorage());
    cart.getState().add('p1', 2);
    cart.getState().add('p1', 3);
    cart.getState().add('p1', 1, 'blue');
    cart.getState().add('p1', 200, 'blue');
    expect(cart.getState().lines).toEqual([
      { productId: 'p1', variantId: null, quantity: 5 },
      { productId: 'p1', variantId: 'blue', quantity: 99 },
    ]);
    expect(cart.getState().count()).toBe(104);
  });

  it('removes a line when quantity drops to zero', () => {
    const cart = createCartStore(memoryStorage());
    cart.getState().add('p1');
    cart.getState().setQuantity('p1', 0);
    expect(cart.getState().lines).toEqual([]);
  });
});
