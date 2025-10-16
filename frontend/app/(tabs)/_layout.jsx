import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import {useContext} from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {ThemeContext} from '../../src/context/ThemeContext'

function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { theme } = useContext(ThemeContext);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
        tabBarStyle: {
          backgroundColor: theme.colors.secondary,
          borderTopWidth: 0,
          height: 60,
          position: 'absolute',
          left: 0,
          right: 0,
          paddingTop: 15,
          bottom: insets.bottom,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let label;
          let IconComponent = Ionicons;

          switch (route.name) {
            case 'home':
              iconName = focused ? 'home' : 'home-outline';
              label = 'Home';
              break;
            case 'leaveApply':
              IconComponent = MaterialIcons;
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              label = 'Apply Leave';
              break;
            case 'profile':
              iconName = focused ? 'person' : 'person-outline';
              label = 'Profile';
              break;
            case 'settings':
              iconName = focused ? 'settings' : 'settings-outline';
              label = 'Settings';
              break;
            default:
              iconName = 'help-circle-outline';
              label = 'Other';
          }

          return (
            <View className="flex-1 items-center justify-center">
              <IconComponent name={iconName} size={26} color={color} />
              <Text
                className={`${focused ? "font-psemibold" : "font-pregular"} text-xxs w-full text-center`}
                style={{
                  color: focused ? theme.colors.primary : theme.colors.text,
                  fontFamily: focused ? 'Poppins-Bold' : 'Poppins-Regular',
                }}
              >
                {label}
              </Text>
            </View>
          );
        },
      })}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="leaveApply" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <TabsLayout />
  );
}
