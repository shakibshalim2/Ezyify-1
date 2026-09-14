// Mirrors tokens.json into a TS module so consumers (tsc, Vite, Metro) need no JSON import attributes.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const json = JSON.parse(readFileSync(join(here, '..', 'tokens.json'), 'utf8'));
delete json.$schema;
const out = `// Generated from tokens.json by scripts/sync-json.mjs — do not edit.\nexport default ${JSON.stringify(json, null, 2)} as const;\n`;
writeFileSync(join(here, '..', 'src', 'tokens.data.ts'), out);
