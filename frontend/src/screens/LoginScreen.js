import api from '../api/api';
import { Alert } from 'react-native';
import { router } from 'expo-router';

export const handleLogin = async (email, password, setUser, setIsSubmitting) => {
  setIsSubmitting?.(true);

  try {
    const res = await api.login(email, password);
    if (res.token && res.user) {
      setUser?.(res.user); // Only if UserContext is used
      router.push('/home');
    } else if (res.error) {
      Alert.alert('Login Failed', res.error);
    } else {
      Alert.alert('Login Failed', 'Please try again.');
    }
  } catch (err) {
    console.error('Login error:', err);
    Alert.alert('Error', 'Network or server error');
  } finally {
    setIsSubmitting?.(false);
  }
};
