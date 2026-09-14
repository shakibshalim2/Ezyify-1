import type { ReactNode } from 'react';
import { View } from 'react-native';
import { ApiError } from '@ezyify/core';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { Button } from './Button';
import { EmptyState } from './EmptyState';

interface QueryStateProps {
  isLoading: boolean;
  error: unknown;
  /** Re-run the query (react-query `refetch`). */
  onRetry?: () => void;
  /** Rendered while loading — keep the same footprint as the content. */
  skeleton: ReactNode;
  /** Rendered when the query resolved with no items. */
  empty?: ReactNode;
  isEmpty?: boolean;
  children: ReactNode;
}

export function errorCopy(error: unknown): { title: string; body: string } {
  if (error instanceof ApiError) {
    if (error.code === 'NETWORK_ERROR') return { title: "You're offline", body: 'Check your connection and try again.' };
    if (error.code === 'UNAUTHORIZED') return { title: 'Sign in to continue', body: 'Your session has expired.' };
    if (error.code === 'NOT_FOUND') return { title: 'Not found', body: "This may have been removed or the link is wrong." };
    if (error.code === 'RATE_LIMIT_EXCEEDED') return { title: 'Slow down a little', body: error.message };
    return { title: 'Something went wrong', body: error.message };
  }
  return { title: 'Something went wrong', body: 'Please try again in a moment.' };
}

/** Uniform loading / error / empty / content switch for screens driven by react-query. */
export function QueryState({ isLoading, error, onRetry, skeleton, empty, isEmpty, children }: QueryStateProps) {
  if (isLoading) return <>{skeleton}</>;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (isEmpty && empty) return <>{empty}</>;
  return <>{children}</>;
}

export function ErrorState({ error, onRetry, compact }: { error: unknown; onRetry?: () => void; compact?: boolean }) {
  const { colors, radius } = useTheme();
  const { title, body } = errorCopy(error);
  if (compact) {
    return (
      <View accessibilityRole="alert" style={{ marginHorizontal: 16, padding: 12, borderRadius: radius.md, backgroundColor: colors.errorSubtle, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text variant="label" style={{ color: colors.error }}>{title}</Text>
          <Text variant="caption" tone="secondary">{body}</Text>
        </View>
        {onRetry && <Button label="Retry" size="sm" variant="secondary" onPress={onRetry} />}
      </View>
    );
  }
  return <EmptyState icon="cloud-offline-outline" title={title} body={body} actionLabel={onRetry ? 'Try again' : undefined} onAction={onRetry} />;
}
