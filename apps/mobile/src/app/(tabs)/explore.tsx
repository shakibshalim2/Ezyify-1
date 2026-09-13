import { View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';

export default function ExploreScreen() {
  return (
    <Screen>
      <View style={{ paddingTop: 8, gap: 16 }}>
        <Text variant="title">Explore</Text>
        <Card>
          <Text tone="secondary">This screen is ported from the web design in Phase 4.5.</Text>
        </Card>
      </View>
    </Screen>
  );
}
