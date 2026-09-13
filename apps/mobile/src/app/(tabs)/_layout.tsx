import { Tabs, useRouter } from 'expo-router';
import { Platform, Pressable, View, type ColorValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fontFamily, useTheme } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const tab = (name: IconName, active: IconName, label: string) => ({
  title: label,
  tabBarIcon: ({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) => (
    <Ionicons name={focused ? active : name} size={size} color={color} />
  ),
});

export default function TabsLayout() {
  const { colors, gradients, radius } = useTheme();
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.foregroundTertiary,
        tabBarLabelStyle: { fontFamily: fontFamily.bodyMedium, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.backgroundElevated,
          borderTopColor: colors.border,
          height: Platform.OS === 'android' ? 64 : undefined,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen name="home" options={tab('home-outline', 'home', 'Home')} />
      <Tabs.Screen name="explore" options={tab('compass-outline', 'compass', 'Explore')} />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <LinearGradient colors={[gradients.brand[0], gradients.brand[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginTop: -6, shadowColor: colors.primary, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}>
              <Ionicons name="add" size={26} color="#fff" />
            </LinearGradient>
          ),
          tabBarButton: props => (
            <Pressable accessibilityRole="button" accessibilityLabel="Create" onPress={() => router.push('/create')} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <View pointerEvents="none">{props.children}</View>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen name="shop" options={tab('bag-handle-outline', 'bag-handle', 'Shop')} />
      <Tabs.Screen name="profile" options={tab('person-outline', 'person', 'Profile')} />
    </Tabs>
  );
}
