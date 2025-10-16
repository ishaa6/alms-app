import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { UserContext } from '../context/UserContext';

export default function Attendance() {
  const { clockIn, clockOut, status } = useContext(UserContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance</Text>
      <Button title="Clock In" onPress={clockIn} />
      <Button title="Clock Out" onPress={clockOut} />
      <Text>Status: {status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 10 },
});
