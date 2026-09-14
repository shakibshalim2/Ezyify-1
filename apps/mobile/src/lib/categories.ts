import type { Ionicons } from '@expo/vector-icons';

/** Icon per category slug; unknown slugs fall back to a generic tag so new server categories still render. */
const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  fashion: 'shirt-outline',
  beauty: 'sparkles-outline',
  tech: 'phone-portrait-outline',
  home: 'home-outline',
  fitness: 'barbell-outline',
  food: 'restaurant-outline',
};
export const categoryIcon = (slug: string): keyof typeof Ionicons.glyphMap => ICONS[slug] ?? 'pricetag-outline';
