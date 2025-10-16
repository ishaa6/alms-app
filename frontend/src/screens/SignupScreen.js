import { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import api from '../api/api';
import { Picker } from '@react-native-picker/picker';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee'); // default role
  const [message, setMessage] = useState('');

  const handleSignup = async () => {
    try {
      console.log(name + " " + email + " " +  password + " " + role);
      await api.signup(name, email, password, role); 
      setMessage('Signup successful! Please log in.');
      navigation.navigate('Login');
    } catch {
      setMessage('Signup failed. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signup</Text>
      <TextInput placeholder="Name" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
      <Text style={styles.label}>Role:</Text>
      <Picker selectedValue={role} style={styles.picker} onValueChange={(value) => setRole(value)}>
        <Picker.Item label="Employee" value="employee" />
        <Picker.Item label="Manager" value="manager" />
      </Picker>
      <Button title="Signup" onPress={handleSignup} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 10, borderRadius: 5 },
  label: { marginBottom: 5, fontWeight: 'bold' },
  picker: { height: 50, width: '100%', marginBottom: 20,},
  message: { marginTop: 10, color: 'green' },
});
