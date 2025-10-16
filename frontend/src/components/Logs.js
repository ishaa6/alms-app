import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { UserContext } from '../context/UserContext';

export default function Logs() {
  const { logs } = useContext(UserContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance Logs</Text>
      <FlatList
        data={logs}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => <Text>- {item.message}</Text>}
        ListEmptyComponent={<Text>No logs available</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 10 },
});
