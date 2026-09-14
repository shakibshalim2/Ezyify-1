import { priceCart } from './cart.service.js';

describe('priceCart', () => {
  it('charges flat shipping under the free-shipping threshold', () => {
    expect(priceCart([{ unitPrice: 1000, quantity: 2 }], null)).toEqual({ subtotal: 2000, discount: 0, shipping: 499, total: 2499 });
  });
  it('waives shipping at or above 50.00', () => {
    expect(priceCart([{ unitPrice: 5000, quantity: 1 }], null).shipping).toBe(0);
  });
  it('applies percentage and flat coupons, never below zero', () => {
    expect(priceCart([{ unitPrice: 10000, quantity: 1 }], 'WELCOME10').discount).toBe(1000);
    expect(priceCart([{ unitPrice: 300, quantity: 1 }], 'ezy5').discount).toBe(300);
    expect(priceCart([], 'WELCOME10')).toEqual({ subtotal: 0, discount: 0, shipping: 0, total: 0 });
  });
});
