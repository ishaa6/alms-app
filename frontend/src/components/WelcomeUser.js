import React, { useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { UserContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext';

export default function WelcomeUser() {
  const { user } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);

  if (user === undefined) {
    console.log("User not defined")
    return <ActivityIndicator />;
  }

  return (
    <View>
      <Text className="font-pregular text-xxl" style={{ color: theme.colors.text}}>WELCOME</Text>
      <Text className="text-xl mb-2 font-psemibold" style={{ color: theme.colors.text }}>{user?.name ?? 'Guest'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
});
