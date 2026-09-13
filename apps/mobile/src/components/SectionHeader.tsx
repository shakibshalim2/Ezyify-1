import { Pressable, View } from 'react-native';
import { Text } from './Text';

export function SectionHeader({ title, actionLabel = 'See all', onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 }}>
      <Text variant="heading">{title}</Text>
      {onAction && (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
          <Text variant="label" tone="brand">{actionLabel} →</Text>
        </Pressable>
      )}
    </View>
  );
}
