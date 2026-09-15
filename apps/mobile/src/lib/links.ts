import * as Linking from 'expo-linking';

export const WEB_ORIGIN = 'https://ezyify.app';

/**
 * Maps web URLs (App Links) and `ezyify://` URLs onto router paths.
 * Web and mobile share the same path grammar so one link works everywhere.
 */
export function pathFromUrl(url: string): string | null {
  try {
    const parsed = Linking.parse(url);
    const path = (parsed.path ?? '').replace(/^\/+/, '');
    if (!path) return '/(tabs)/home';
    const [head, ...rest] = path.split('/');
    switch (head) {
      case 'product':
      case 'p':
        return rest[0] ? `/product/${rest[0]}` : '/(tabs)/shop';
      case 'post':
        return rest[0] ? `/post/${rest[0]}` : '/(tabs)/home';
      case 'loops':
      case 'loop':
        return rest[0] ? `/loops?id=${rest[0]}` : '/loops';
      case 'live':
        return rest[0] ? `/live/${rest[0]}` : '/live';
      case 'profile':
      case 'u':
        return rest[0] ? `/profile/${rest[0]}` : '/(tabs)/profile';
      case 'store':
        return rest[0] ? `/profile/${rest[0]}` : '/(tabs)/shop';
      case 'messages':
        return rest[0] ? `/messages/${rest[0]}` : '/messages';
      case 'orders':
      case 'wallet':
      case 'cart':
      case 'checkout':
      case 'notifications':
      case 'deals':
      case 'settings':
      case 'create':
        return `/${head}`;
      case 'shop':
      case 'explore':
      case 'home':
        return `/(tabs)/${head}`;
      case 'account':
        return rest[0] === 'delete' ? '/settings/delete-account' : '/settings';
      default:
        return null;
    }
  } catch {
    return null;
  }
}

export const shareUrl = (path: string) => `${WEB_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;

/** Deep links and cold starts land on screens with no history; fall back instead of a no-op back. */
export function goBack(router: { canGoBack: () => boolean; back: () => void; replace: (href: never) => void }, fallback = '/(tabs)/home') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback as never);
}
