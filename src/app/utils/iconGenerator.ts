/**
 * EZYIFY Icon Generator Utility
 * 
 * This utility generates placeholder PWA icons programmatically
 * Uses SVG to create scalable, high-quality icons
 * Can be used until professional icons are designed
 */

// Brand colors
export const BRAND_COLORS = {
  blue: '#0095f6',
  gradientStart: '#667eea',
  gradientEnd: '#f093fb',
  dark: '#0a0a0a',
  white: '#ffffff',
  accent: '#10b981',
} as const;

// Icon sizes required for PWA
export const ICON_SIZES = [
  72, 96, 128, 144, 152, 192, 384, 512
] as const;

/**
 * Generate SVG icon with gradient background and text
 */
export function generateIconSVG(
  size: number,
  options: {
    text?: string;
    fontSize?: number;
    background?: 'gradient' | 'blue' | 'dark';
    maskable?: boolean;
  } = {}
): string {
  const {
    text = 'E',
    fontSize = size * 0.55,
    background = 'gradient',
    maskable = false,
  } = options;

  // Calculate safe area for maskable icons (75% of total size)
  const safeAreaSize = size * 0.75;
  const safeAreaOffset = (size - safeAreaSize) / 2;
  
  // Adjust font size for safe area if maskable
  const adjustedFontSize = maskable ? fontSize * 0.75 : fontSize;
  
  // Background style
  let backgroundDef = '';
  let backgroundFill = '';
  
  if (background === 'gradient') {
    backgroundDef = `
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${BRAND_COLORS.gradientStart};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${BRAND_COLORS.gradientEnd};stop-opacity:1" />
        </linearGradient>
      </defs>
    `;
    backgroundFill = 'url(#bg-gradient)';
  } else if (background === 'blue') {
    backgroundFill = BRAND_COLORS.blue;
  } else {
    backgroundFill = BRAND_COLORS.dark;
  }

  // Border radius for maskable icons
  const borderRadius = maskable ? size * 0.23 : 0;

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      ${backgroundDef}
      <rect width="${size}" height="${size}" rx="${borderRadius}" fill="${backgroundFill}" />
      <text
        x="50%"
        y="50%"
        dominant-baseline="central"
        text-anchor="middle"
        font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        font-weight="700"
        font-size="${adjustedFontSize}"
        fill="${BRAND_COLORS.white}"
      >${text}</text>
    </svg>
  `.trim();
}

/**
 * Generate shortcut icon SVG with Lucide icon
 */
export function generateShortcutIconSVG(
  iconPath: string,
  options: {
    size?: number;
    background?: 'gradient' | 'blue' | 'dark';
  } = {}
): string {
  const { size = 96, background = 'gradient' } = options;
  
  // Background
  let backgroundDef = '';
  let backgroundFill = '';
  
  if (background === 'gradient') {
    backgroundDef = `
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${BRAND_COLORS.gradientStart};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${BRAND_COLORS.gradientEnd};stop-opacity:1" />
        </linearGradient>
      </defs>
    `;
    backgroundFill = 'url(#bg-gradient)';
  } else if (background === 'blue') {
    backgroundFill = BRAND_COLORS.blue;
  } else {
    backgroundFill = BRAND_COLORS.dark;
  }

  const iconSize = size * 0.5;
  const iconOffset = (size - iconSize) / 2;
  const borderRadius = size * 0.2;

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      ${backgroundDef}
      <rect width="${size}" height="${size}" rx="${borderRadius}" fill="${backgroundFill}" />
      <g transform="translate(${iconOffset}, ${iconOffset})">
        <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${BRAND_COLORS.white}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${iconPath}
        </svg>
      </g>
    </svg>
  `.trim();
}

/**
 * Shortcut icon paths (Lucide icons)
 */
export const SHORTCUT_ICONS = {
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  shop: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  messages: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
} as const;

/**
 * Convert SVG string to data URL
 */
export function svgToDataURL(svg: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml,${encoded}`;
}

/**
 * Download SVG as PNG (requires canvas)
 */
export async function downloadIconAsPNG(
  svg: string,
  filename: string,
  size: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Could not create blob'));
          return;
        }
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        resolve();
      }, 'image/png');
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load SVG'));
    };
    
    img.src = svgToDataURL(svg);
  });
}

/**
 * Generate all PWA icons
 */
export function generateAllIcons() {
  const icons: Array<{
    filename: string;
    svg: string;
    size: number;
  }> = [];

  // Main app icons
  ICON_SIZES.forEach(size => {
    const maskable = size === 192 || size === 512;
    icons.push({
      filename: `icon-${size}x${size}.png`,
      svg: generateIconSVG(size, {
        text: 'E',
        background: 'gradient',
        maskable,
      }),
      size,
    });
  });

  // Shortcut icons
  Object.entries(SHORTCUT_ICONS).forEach(([name, path]) => {
    icons.push({
      filename: `shortcut-${name}.png`,
      svg: generateShortcutIconSVG(path, {
        size: 96,
        background: 'gradient',
      }),
      size: 96,
    });
  });

  // Favicon sizes
  [16, 32].forEach(size => {
    icons.push({
      filename: `favicon-${size}x${size}.png`,
      svg: generateIconSVG(size, {
        text: 'E',
        background: 'blue',
        maskable: false,
      }),
      size,
    });
  });

  // Apple touch icon
  icons.push({
    filename: 'apple-touch-icon.png',
    svg: generateIconSVG(180, {
      text: 'E',
      background: 'gradient',
      maskable: false,
    }),
    size: 180,
  });

  return icons;
}

/**
 * Download all icons as PNG files
 */
export async function downloadAllIcons(): Promise<void> {
  const icons = generateAllIcons();
  
  console.log(`Generating ${icons.length} icons...`);
  
  for (const icon of icons) {
    await downloadIconAsPNG(icon.svg, icon.filename, icon.size);
    // Small delay to prevent browser from blocking downloads
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('All icons generated successfully!');
}

/**
 * Preview icon in browser
 */
export function previewIcon(
  containerElement: HTMLElement,
  size: number = 192,
  options?: Parameters<typeof generateIconSVG>[1]
): void {
  const svg = generateIconSVG(size, options);
  containerElement.innerHTML = svg;
}

/**
 * Generate favicon.ico (multi-size)
 * Note: This returns a data URL that can be used in HTML
 * For actual .ico file, use a backend service or tool
 */
export function generateFaviconHTML(): string {
  const svg16 = generateIconSVG(16, { text: 'E', background: 'blue' });
  const svg32 = generateIconSVG(32, { text: 'E', background: 'blue' });
  
  return `
    <link rel="icon" type="image/svg+xml" href="${svgToDataURL(svg16)}" sizes="16x16">
    <link rel="icon" type="image/svg+xml" href="${svgToDataURL(svg32)}" sizes="32x32">
  `.trim();
}
