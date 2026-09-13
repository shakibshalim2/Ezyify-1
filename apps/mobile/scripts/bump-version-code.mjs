// Bumps android.versionCode in app.config.ts (and mirrors it into android/app/build.gradle if present).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const cfg = 'app.config.ts';
let src = readFileSync(cfg, 'utf8');
const m = src.match(/versionCode:\s*(\d+)/);
if (!m) throw new Error('versionCode not found in app.config.ts');
const next = Number(m[1]) + 1;
src = src.replace(/versionCode:\s*\d+/, `versionCode: ${next}`);
writeFileSync(cfg, src);

const gradle = 'android/app/build.gradle';
if (existsSync(gradle)) {
  writeFileSync(gradle, readFileSync(gradle, 'utf8').replace(/versionCode\s+\d+/, `versionCode ${next}`));
}
console.log(`versionCode → ${next}`);
