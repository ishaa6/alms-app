import React, { useContext } from 'react';
import { SafeAreaView, StyleSheet, Button, View } from 'react-native';
import { UserContext } from '../context/UserContext';

import WelcomeUser from '../components/WelcomeUser';
import Attendance from '../components/Attendance';
import ApplyLeave from '../components/ApplyLeave';
import LeaveApprovals from '../components/LeaveApprovals';
import Logs from '../components/Logs';

export default function HomeScreen() {
  const { user, logout } = useContext(UserContext);

  return (
    <SafeAreaView style={styles.container}>
      <WelcomeUser />
      <Attendance />
      <ApplyLeave />
      {user.role === 'manager' && <LeaveApprovals />}
      <Logs />
    
      <View style={styles.logoutContainer}>
        <Button title="Logout" color="#d9534f" onPress={logout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  logoutContainer: {
    marginTop: 20,
  },
});
