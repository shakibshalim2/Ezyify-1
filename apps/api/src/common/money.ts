import type { Currency } from '../generated/prisma/enums.js';

export const money = (amount: number, currency: Currency | string = 'USD') => ({ amount, currency: currency as 'USD' | 'IDR' | 'EUR' | 'GBP' });
export const bps = (amount: number, basisPoints: number) => Math.round((amount * basisPoints) / 10_000);
