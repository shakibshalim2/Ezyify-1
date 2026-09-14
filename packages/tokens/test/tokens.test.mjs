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
  assert.equal(colors('dark').primary, '#3f86f0'); // paired with a dark on-primary (#0a0d14) → 5.44:1 both as fill and as text
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

// WCAG 2.2 AA guardrails: these pairs are used everywhere (buttons, badges, secondary text) and regressions
// showed up as axe "color-contrast" failures in e2e. Keep them ≥ 4.5:1.
const lum = hex => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
for (const theme of ['light', 'dark']) {
  test(`${theme}: text/background pairs meet WCAG AA (4.5:1)`, () => {
    const c = colors(theme);
    const pairs = [
      ['primaryForeground', 'primary'],
      ['accentForeground', 'accent'],
      ['errorForeground', 'error'],
      ['foreground', 'background'],
      ['foreground', 'backgroundElevated'],
      ['foregroundSecondary', 'background'],
      ['foregroundTertiary', 'background'],
      ['foregroundTertiary', 'backgroundElevated'],
      // primary is also used as link/text colour on surfaces
      ['primary', 'background'],
      ['primary', 'backgroundElevated'],
    ];
    for (const [fg, bg] of pairs) {
      const ratio = contrast(c[fg], c[bg]);
      assert.ok(ratio >= 4.5, `${theme} ${fg} on ${bg} = ${ratio.toFixed(2)}:1 (< 4.5)`);
    }
  });
}
