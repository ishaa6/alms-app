import { Entypo, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useContext } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import privacyPolicy from '../../assets/privacy_policy';
import { ThemeContext } from '../../src/context/ThemeContext';

export default function SettingsScreen() {

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const { theme, mode, toggleMode } = useContext(ThemeContext);

    const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      backgroundColor: theme.colors.secondary,
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.secondary,
    },
    itemText: {
      flex: 1,
      marginLeft: 10,
      color: theme.colors.text,
      fontSize: 16,
    },
    subText: {
      color: theme.colors.secondary,
      fontSize: 12,
      marginTop: 4,
    },
    privacyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      backgroundColor: theme.colors.secondary,
    },
    privacyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    scrollContent: {
      padding: 20,
      flexGrow: 1,
    },
    policyText: {
      color: theme.colors.text,
      fontSize: 14,
      lineHeight: 22,
    },
  });

  // Load stored settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const notifications = await AsyncStorage.getItem('notificationsEnabled');
        const darkMode = await AsyncStorage.getItem('darkModeEnabled');

        if (notifications !== null) setNotificationsEnabled(JSON.parse(notifications));
        if (darkMode !== null) setDarkModeEnabled(JSON.parse(darkMode));
      } catch (error) {
        console.log('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  // Save settings
  const toggleNotifications = async () => {
    try {
      const newValue = !notificationsEnabled;
      setNotificationsEnabled(newValue);
      await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(newValue));
    } catch (error) {
      console.log('Error saving notifications setting:', error);
    }
  };

  const toggleDarkMode = async () => {
    try {
      const newValue = !darkModeEnabled;
      setDarkModeEnabled(newValue);
      await AsyncStorage.setItem('darkModeEnabled', JSON.stringify(newValue));
    } catch (error) {
      console.log('Error saving dark mode setting:', error);
    }
  };

  const openPrivacyPolicy = () => setShowPrivacyPolicy(true);

  if (showPrivacyPolicy) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.privacyHeader}>
          <TouchableOpacity onPress={() => setShowPrivacyPolicy(false)}>
            <Ionicons name="arrow-back" size={30} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.privacyTitle}>Privacy Policy</Text>
          <View style={{ width: 30 }} />
        </View>

        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]} showsVerticalScrollIndicator={true}>
          <Text style={styles.policyText}>{privacyPolicy}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Settings</Text>
      </View>

      <ScrollView>
        {/* Privacy Policy */}
        <TouchableOpacity style={styles.item} onPress={openPrivacyPolicy}>
          <Ionicons name="document-text-outline" size={24} color={theme.colors.text} />
          <Text style={styles.itemText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        {/* System Update */}
        <View style={styles.item}>
          <Ionicons name="information-circle-outline" size={24} color={theme.colors.text} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.itemText}>System Update</Text>
            <Text style={styles.subText}>Last update: 1 week ago</Text>
          </View>
          <Ionicons name="refresh" size={24} color={theme.colors.text} />
        </View>

        {/* Notifications */}
        <View style={styles.item}>
          <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
          <Text style={styles.itemText}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            thumbColor={notificationsEnabled ? theme.colors.primary : '#888'}
          />
        </View>

        {/* Dark Mode */}
        <View style={styles.item}>
          <Entypo name="eye" size={24} color={theme.colors.text} />
          <Text style={styles.itemText}>Dark Mode</Text>
          <Switch
            value={mode === 'dark'}
            onValueChange={toggleMode}
            thumbColor={mode === 'dark' ? theme.colors.primary : '#888'}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}







