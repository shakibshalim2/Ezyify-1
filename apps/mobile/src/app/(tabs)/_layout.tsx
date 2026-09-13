import { Tabs } from 'expo-router';
import { Platform, type ColorValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fontFamily, useTheme } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const tab = (name: IconName, active: IconName, label: string) => ({
  title: label,
  tabBarIcon: ({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) => (
    <Ionicons name={focused ? active : name} size={size} color={color} />
  ),
});

export default function TabsLayout() {
  const { colors } = useTheme();
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
      <Tabs.Screen name="shop" options={tab('bag-handle-outline', 'bag-handle', 'Shop')} />
      <Tabs.Screen name="profile" options={tab('person-outline', 'person', 'Profile')} />
    </Tabs>
  );
}
