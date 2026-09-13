import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const raw = JSON.parse(readFileSync(new URL('../tokens.json', import.meta.url), 'utf8'));
const { tokens, colors, nativeTheme, toCssVariables } = await import('../dist/index.js');

test('brand colours match the logo', () => {
  assert.equal(raw.palette.blue['600'], '#0f66c7');
  assert.equal(raw.palette.orange['500'], '#ff6f22');
});

test('references resolve to hex values', () => {
  assert.equal(colors('light').primary, '#0f66c7');
  assert.equal(colors('dark').primary, '#3f86f0');
  assert.equal(tokens.gradient.brand[0], '#1a6fdc');
});

test('light and dark expose the same colour keys', () => {
  assert.deepEqual(Object.keys(colors('light')).sort(), Object.keys(colors('dark')).sort());
});

test('native theme and css variables are derived from the same source', () => {
  const theme = nativeTheme('light');
  const css = toCssVariables('light');
  assert.equal(css['--primary'], theme.colors.primary);
  assert.equal(css['--radius-card'], `${theme.radius.card}px`);
  assert.equal(css['--nav-height'], '64px');
});
