#!/usr/bin/env node
/**
 * Renders the brand mark (same paths as `components/primitives/BrandMark.tsx`) into the PNG set a PWA needs:
 * manifest icons (any + maskable), apple-touch-icon, favicon PNGs, shortcut icons and the Open Graph image.
 * Run `pnpm --filter @ezyify/web icons` after changing the mark or brand colours.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'public');

const BLUE = '#0F66C7';
const BLUE_DEEP = '#0B4FA0';
const ORANGE = '#FF6F22';

const MARK_PATHS = (bar = '#FFFFFF') => `
  <path fill="${bar}" d="M35.5 14H64.5A6.5 6.5 0 0 1 64.5 27H29V20.5A6.5 6.5 0 0 1 35.5 14Z"/>
  <path fill="${ORANGE}" d="M29 33H59.5A6.5 6.5 0 0 1 59.5 46H29Z"/>
  <path fill="${bar}" d="M29 52H64.5A6.5 6.5 0 0 1 64.5 65H35.5A6.5 6.5 0 0 1 29 58.5Z"/>
  <circle cx="50" cy="78" r="8" fill="${ORANGE}"/>`;

/** Rounded-square app icon. `maskable` pads the glyph into the 80 % safe zone. */
function iconSvg(size, { maskable = false, radius = 0.22 } = {}) {
  const glyphScale = maskable ? 0.6 : 0.74;
  const offset = (1 - glyphScale) / 2;
  const rx = maskable ? 0 : size * radius;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2F7FE0"/><stop offset="1" stop-color="${BLUE_DEEP}"/></linearGradient></defs>
  <rect width="${size}" height="${size}" rx="${rx}" fill="url(#g)"/>
  <g transform="translate(${size * offset} ${size * offset}) scale(${(size * glyphScale) / 100})">${MARK_PATHS()}</g>
</svg>`;
}

/** Shortcut icons: brand disc + white lucide glyph. */
function shortcutSvg(glyph) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" rx="20" fill="${BLUE}"/>
  <g transform="translate(24 24) scale(2)" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${glyph}</g>
</svg>`;
}

const GLYPHS = {
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  shop: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  messages: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
};

function ogSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0A0D14"/><stop offset="1" stop-color="#10141D"/></linearGradient>
    <radialGradient id="a1" cx="0.2" cy="0.2" r="0.6"><stop offset="0" stop-color="#3F86F0" stop-opacity="0.45"/><stop offset="1" stop-color="#3F86F0" stop-opacity="0"/></radialGradient>
    <radialGradient id="a2" cx="0.85" cy="0.3" r="0.5"><stop offset="0" stop-color="#7C5CFF" stop-opacity="0.35"/><stop offset="1" stop-color="#7C5CFF" stop-opacity="0"/></radialGradient>
    <radialGradient id="a3" cx="0.6" cy="0.95" r="0.55"><stop offset="0" stop-color="${ORANGE}" stop-opacity="0.3"/><stop offset="1" stop-color="${ORANGE}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#a1)"/><rect width="1200" height="630" fill="url(#a2)"/><rect width="1200" height="630" fill="url(#a3)"/>
  <g transform="translate(96 195) scale(2.4)"><circle cx="50" cy="50" r="50" fill="${BLUE}"/>${MARK_PATHS()}</g>
  <text x="400" y="290" font-family="'Plus Jakarta Sans', Inter, Arial, sans-serif" font-weight="700" font-size="112" fill="#fff" letter-spacing="-4">Ezy<tspan fill="#3F86F0">ify</tspan></text>
  <text x="404" y="365" font-family="Inter, Arial, sans-serif" font-weight="500" font-size="40" fill="#C7D0E0">Shop. Talk. Share. Live the Moment.</text>
  <text x="404" y="430" font-family="Inter, Arial, sans-serif" font-size="28" fill="#8A97AD">Social commerce with escrow-protected checkout</text>
</svg>`;
}

const png = (svg, size, file) =>
  sharp(Buffer.from(svg), { density: 384 })
    .resize(size.width ?? size, size.height ?? size)
    .png({ compressionLevel: 9 })
    .toFile(path.join(out, file));

await mkdir(path.join(out, 'icons'), { recursive: true });

const jobs = [
  ...[64, 192, 512].map(s => png(iconSvg(s), s, `icons/icon-${s}.png`)),
  png(iconSvg(512, { maskable: true }), 512, 'icons/icon-512-maskable.png'),
  png(iconSvg(180, { radius: 0 }), 180, 'apple-touch-icon.png'),
  png(iconSvg(32), 32, 'favicon-32.png'),
  png(iconSvg(16), 16, 'favicon-16.png'),
  ...Object.entries(GLYPHS).map(([name, glyph]) => png(shortcutSvg(glyph), 96, `icons/shortcut-${name}.png`)),
  png(ogSvg(), { width: 1200, height: 630 }, 'og-image.png'),
  writeFile(path.join(out, 'favicon.svg'), iconSvg(32)),
];
await Promise.all(jobs);
console.log(`icons written to ${path.relative(process.cwd(), out)} (${jobs.length} files)`);
