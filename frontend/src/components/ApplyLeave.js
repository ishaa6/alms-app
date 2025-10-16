import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { UserContext } from '../context/UserContext';

export default function ApplyLeave() {
  const { applyLeave } = useContext(UserContext);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveStatus, setLeaveStatus] = useState('');

  const onSubmit = async () => {
    if (!fromDate || !toDate || !reason) {
      Alert.alert('Please fill all fields');
      return;
    }
    try {
      await applyLeave(fromDate, toDate, reason);
      setLeaveStatus('Leave Applied');
      setFromDate('');
      setToDate('');
      setReason('');
    } catch {
      Alert.alert('Failed to apply leave');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apply Leave</Text>
      <TextInput
        style={styles.input}
        placeholder="From Date (YYYY-MM-DD)"
        value={fromDate}
        onChangeText={setFromDate}
      />
      <TextInput
        style={styles.input}
        placeholder="To Date (YYYY-MM-DD)"
        value={toDate}
        onChangeText={setToDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Reason"
        value={reason}
        onChangeText={setReason}
      />
      <Button title="Apply" onPress={onSubmit} />
      {leaveStatus ? <Text>{leaveStatus}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});
