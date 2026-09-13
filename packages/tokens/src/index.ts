import raw from './tokens.data.js';

type Hex = string;
type Palette = Record<string, Record<string, Hex> | Hex>;

const REF = /^\{([a-zA-Z0-9.]+)\}$/;

/** Resolves `{palette.blue.600}` style references against the token tree. */
function resolveRef(value: string, root: Record<string, unknown>): string {
  const match = REF.exec(value);
  if (!match) return value;
  const found = match[1].split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, root);
  if (typeof found !== 'string') throw new Error(`Unresolvable token reference ${value}`);
  return resolveRef(found, root);
}

function resolveTree<T>(node: T, root: Record<string, unknown>): T {
  if (typeof node === 'string') return resolveRef(node, root) as unknown as T;
  if (Array.isArray(node)) return node.map(n => resolveTree(n, root)) as unknown as T;
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) out[k] = resolveTree(v, root);
    return out as T;
  }
  return node;
}

const resolved = resolveTree(raw, raw as unknown as Record<string, unknown>);

export type ColorScheme = 'light' | 'dark';
export type ColorTokens = Record<keyof typeof resolved.color.light, string>;
export type Tokens = typeof resolved;

export const tokens: Tokens = resolved;
export const palette = resolved.palette as Palette;
export const typography = resolved.typography;
export const radius = resolved.radius;
export const spacing = resolved.spacing;
export const layout = resolved.layout;
export const motion = resolved.motion;
export const gradients = resolved.gradient;

/** Colour set for a scheme — what a React Native ThemeProvider consumes. */
export function colors(scheme: ColorScheme): ColorTokens {
  return resolved.color[scheme] as ColorTokens;
}

/** Ready-to-use RN theme object (no CSS variables on native). */
export function nativeTheme(scheme: ColorScheme) {
  return {
    scheme,
    colors: colors(scheme),
    radius,
    spacing,
    typography,
    layout,
    motion,
    gradients,
  } as const;
}

export type NativeTheme = ReturnType<typeof nativeTheme>;

/** Flat `--kebab-case` map for a scheme, used to emit CSS. */
export function toCssVariables(scheme: ColorScheme): Record<string, string> {
  const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  const vars: Record<string, string> = {};
  for (const [k, v] of Object.entries(colors(scheme))) vars[`--${kebab(k)}`] = v;
  for (const [k, v] of Object.entries(radius)) vars[`--radius-${k}`] = `${v}px`;
  for (const [k, v] of Object.entries(motion.duration)) vars[`--duration-${k}`] = `${v}ms`;
  for (const [k, v] of Object.entries(motion.easing)) vars[`--ease-${k}`] = `cubic-bezier(${(v as readonly number[]).join(', ')})`;
  vars['--nav-height'] = `${layout.navHeight}px`;
  vars['--header-height'] = `${layout.headerHeight}px`;
  return vars;
}
