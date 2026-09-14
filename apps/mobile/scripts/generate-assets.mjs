#!/usr/bin/env node
/**
 * Renders every native brand asset from the same vector mark as the web (`components/primitives/BrandMark.tsx`)
 * so app icon, adaptive icon layers, splash logo, notification glyph and Play listing art stay pixel‑identical.
 * Run `pnpm --filter @ezyify/mobile assets` then `pnpm --filter @ezyify/mobile android:prebuild` to refresh android/.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// librsvg resolves SVG <text> through fontconfig; point it at the app's bundled Inter / Plus Jakarta Sans TTFs
// so the feature graphic uses the real brand type instead of whatever the host has installed.
const fontDirs = ['@expo-google-fonts/plus-jakarta-sans', '@expo-google-fonts/inter'].map(p => path.dirname(require.resolve(`${p}/package.json`)));
const fontsConf = path.join(os.tmpdir(), 'ezyify-fonts.conf');
await writeFile(fontsConf, `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig>${fontDirs.map(d => `<dir>${d}</dir>`).join('')}<cachedir>${os.tmpdir()}/ezyify-fc-cache</cachedir></fontconfig>`);
process.env.FONTCONFIG_FILE = fontsConf;

// sharp lives in the web workspace; reuse it instead of adding a second native dependency.
const sharp = require('../../web/node_modules/sharp');
const images = path.join(root, 'assets/images');
const store = path.join(root, 'store');

const BLUE = '#0F66C7';
const BLUE_DEEP = '#0B4FA0';
const ORANGE = '#FF6F22';

const MARK = (bar = '#FFFFFF', dot = ORANGE, mid = ORANGE) => `
  <path fill="${bar}" d="M35.5 14H64.5A6.5 6.5 0 0 1 64.5 27H29V20.5A6.5 6.5 0 0 1 35.5 14Z"/>
  <path fill="${mid}" d="M29 33H59.5A6.5 6.5 0 0 1 59.5 46H29Z"/>
  <path fill="${bar}" d="M29 52H64.5A6.5 6.5 0 0 1 64.5 65H35.5A6.5 6.5 0 0 1 29 58.5Z"/>
  <circle cx="50" cy="78" r="8" fill="${dot}"/>`;

const svg = (size, body, { width = size, height = size } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;

/** Mark centred in a square, glyph occupying `scale` of the side (viewBox 0‑100 → side). */
const centredMark = (size, scale, colors) => {
  const offset = (size * (1 - scale)) / 2;
  return `<g transform="translate(${offset} ${offset}) scale(${(size * scale) / 100})">${MARK(...(colors ?? []))}</g>`;
};

const gradient = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2F7FE0"/><stop offset="1" stop-color="${BLUE_DEEP}"/></linearGradient></defs>`;

const assets = [
  // Legacy square icon (also used by iOS/web).
  ['icon.png', 1024, svg(1024, `${gradient}<rect width="1024" height="1024" fill="url(#g)"/>${centredMark(1024, 0.74)}`)],
  // Adaptive icon: 108 dp canvas, 66 dp safe zone ⇒ glyph ≤ 61 % of the side.
  ['android-icon-foreground.png', 1024, svg(1024, centredMark(1024, 0.56))],
  ['android-icon-background.png', 1024, svg(1024, `${gradient}<rect width="1024" height="1024" fill="url(#g)"/>`)],
  // Monochrome (themed icons, Android 13+): single colour, alpha only.
  ['android-icon-monochrome.png', 1024, svg(1024, centredMark(1024, 0.56, ['#FFFFFF', '#FFFFFF', '#FFFFFF']))],
  // Android 12 splash: icon_preferred draws the image inside a 192 dp circle from a 288 dp source ⇒ keep glyph ≤ 60 %.
  ['splash-icon.png', 1024, svg(1024, centredMark(1024, 0.6))],
  // Notification small icon: white alpha glyph only (Android tints it with `color`).
  ['notification-icon.png', 96, svg(96, centredMark(96, 0.9, ['#FFFFFF', '#FFFFFF', '#FFFFFF']))],
  ['favicon.png', 48, svg(48, `<rect width="48" height="48" rx="11" fill="${BLUE}"/>${centredMark(48, 0.74)}`)],
];

const storeAssets = [
  ['icon-512.png', { width: 512, height: 512 }, svg(512, `${gradient}<rect width="512" height="512" fill="url(#g)"/>${centredMark(512, 0.74)}`)],
  [
    'feature-graphic-1024x500.png',
    { width: 1024, height: 500 },
    svg(0, `
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0A0D14"/><stop offset="1" stop-color="#10141D"/></linearGradient>
        <radialGradient id="a1" cx="0.15" cy="0.2" r="0.7"><stop offset="0" stop-color="#3F86F0" stop-opacity="0.5"/><stop offset="1" stop-color="#3F86F0" stop-opacity="0"/></radialGradient>
        <radialGradient id="a2" cx="0.9" cy="0.9" r="0.6"><stop offset="0" stop-color="${ORANGE}" stop-opacity="0.35"/><stop offset="1" stop-color="${ORANGE}" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="1024" height="500" fill="url(#bg)"/><rect width="1024" height="500" fill="url(#a1)"/><rect width="1024" height="500" fill="url(#a2)"/>
      <g transform="translate(96 130) scale(2.4)"><circle cx="50" cy="50" r="50" fill="${BLUE}"/>${MARK()}</g>
      <text x="380" y="235" font-family="'Plus Jakarta Sans', Inter, Arial, sans-serif" font-weight="700" font-size="96" fill="#fff" letter-spacing="-3">Ezy<tspan fill="#3F86F0">ify</tspan></text>
      <text x="384" y="300" font-family="Inter, Arial, sans-serif" font-weight="500" font-size="34" fill="#C7D0E0">Shop. Talk. Share. Live the Moment.</text>
      <text x="384" y="352" font-family="Inter, Arial, sans-serif" font-size="24" fill="#8A97AD">Social commerce with escrow‑protected checkout</text>`,
      { width: 1024, height: 500 }),
  ],
];

const render = (markup, size, file) =>
  sharp(Buffer.from(markup), { density: 384 })
    .resize(size.width ?? size, size.height ?? size)
    .png({ compressionLevel: 9 })
    .toFile(file);

await mkdir(images, { recursive: true });
await mkdir(store, { recursive: true });
await Promise.all([
  ...assets.map(([file, size, markup]) => render(markup, size, path.join(images, file))),
  ...storeAssets.map(([file, size, markup]) => render(markup, size, path.join(store, file))),
]);
console.log(`wrote ${assets.length} app assets + ${storeAssets.length} store assets`);
