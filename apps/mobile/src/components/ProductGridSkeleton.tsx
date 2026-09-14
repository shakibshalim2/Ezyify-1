import { View } from 'react-native';
import { Skeleton } from './Skeleton';

export function ProductGridSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <View style={{ gap: 12, paddingHorizontal: 16 }}>
      {Array.from({ length: rows }).map((_, r) => (
        <View key={r} style={{ flexDirection: 'row', gap: 12 }}>
          <Skeleton height={250} radius={16} style={{ flex: 1 }} />
          <Skeleton height={250} radius={16} style={{ flex: 1 }} />
        </View>
      ))}
    </View>
  );
}
