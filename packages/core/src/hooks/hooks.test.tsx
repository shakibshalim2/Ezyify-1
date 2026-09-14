// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { createRoot } from 'react-dom/client';
import { act, createElement, type ReactNode } from 'react';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Client render (not SSR): useSyncExternalStore serves the *initial* snapshot on the server, hiding store updates. */
function renderClient(node: ReactNode) {
  const el = document.createElement('div');
  const root = createRoot(el);
  act(() => root.render(node));
  return el.innerHTML;
}
import { EzyifyContext, useCartCount, useAuth, useRuntime, queryKeys } from './index.js';
import { createAuthStore } from '../stores/auth.js';
import { createCartStore } from '../stores/cart.js';
import { memoryStorage } from '../stores/storage.js';

function Provider({ children }: { children: ReactNode }) {
  const auth = createAuthStore(memoryStorage());
  const cart = createCartStore(memoryStorage());
  cart.getState().add('p1', 2);
  cart.getState().add('p2', 1);
  return createElement(EzyifyContext.Provider, { value: { api: {} as never, auth, cart } }, children);
}

function Probe() {
  const count = useCartCount();
  const status = useAuth(s => s.status);
  return createElement('span', null, `${count}:${status}`);
}

describe('runtime hooks', () => {
  it('useCartCount sums quantities; useAuth selects from the store', () => {
    expect(renderClient(createElement(Provider, null, createElement(Probe)))).toContain('3:anonymous');
  });
  it('useRuntime throws a helpful error outside the provider', () => {
    function Bare() {
      useRuntime();
      return null;
    }
    expect(() => renderToString(createElement(Bare))).toThrow(/EzyifyContext.Provider/);
  });
  it('query keys are stable and parameterised', () => {
    expect(queryKeys.product('p1')).toEqual(['product', 'p1']);
    expect(queryKeys.products({ q: 'x' })).toEqual(['products', { q: 'x' }]);
  });
});
