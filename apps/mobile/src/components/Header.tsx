import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { Text } from './Text';
import { IconButton } from './IconButton';
import { goBack } from '@/lib/links';

interface HeaderProps {
  title?: string;
  back?: boolean;
  right?: React.ReactNode;
  transparent?: boolean;
}

export function Header({ title, back = true, right, transparent }: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, layout } = useTheme();
  return (
    <View
      style={{
        paddingTop: insets.top,
        height: insets.top + layout.headerHeight,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        backgroundColor: transparent ? 'transparent' : colors.background,
        gap: 4,
      }}
    >
      {back ? <IconButton icon="chevron-back" label="Back" variant={transparent ? 'overlay' : 'ghost'} onPress={() => goBack(router)} /> : <View style={{ width: 44 }} />}
      <Text variant="heading" style={{ flex: 1, textAlign: 'center' }} numberOfLines={1}>
        {title ?? ''}
      </Text>
      <View style={{ minWidth: 44, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}
