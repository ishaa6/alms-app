import CustomButton from '@/components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../src/api/api';
import { UserContext } from '../../src/context/UserContext';
import { ThemeContext } from '../../src/context/ThemeContext'; 

export default function ProfileScreen() {
  const { theme } = useContext(ThemeContext);
  const { logout } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.secondary,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.secondary, // Placeholder color
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },

  detailContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  detailBox: {
    backgroundColor: theme.colors.card,
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginBottom: 15,
  },
  detailText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  input: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.text,
    padding: 10,
    borderRadius: 5,
  },
});

  const fetchProfile = async () => {
    try {
      const response = await api.getUserProfile();
      setProfile(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      await api.updateUserProfile(profile);
      Alert.alert('Success', 'Profile updated successfully.');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Profile</Text>
          <CustomButton
            handlePress={logout}
            containerStyles='w-[50px] h-[50px]'
            textStyles='font-bold leading-none'
            butColor={theme.colors.secondary}
            icon={<Ionicons name="exit" size={40} color={theme.colors.text} />}
          />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage} />
          <Text style={styles.name}>{profile?.name}</Text>
        </View>

        {/* Profile Details */}
        <View style={styles.detailContainer}>
          {renderEditableField('Name', 'name')}
          {renderEditableField('Email', 'email', true)} {/* Non-editable */}
          {renderEditableField('Phone', 'phone_number')}
          {renderEditableField('Address', 'address')}
          {renderEditableField('Department', 'department')}
          {renderEditableField('Designation', 'designation')}
        </View>

        <View style={{ marginHorizontal: 20, marginTop: 10 }}>
          {!isEditing ? (
            <CustomButton 
            containerStyles='w-1/2 rounded-full mt-2 self-center min-h-[50px]'
            title="Edit Profile" handlePress={() => setIsEditing(true)} />
          ) : (
            <CustomButton 
            containerStyles='w-1/2 rounded-full mt-2 self-center min-h-[50px]'
            title="Save Changes" handlePress={handleUpdate} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  function renderEditableField(label, key, disabled = false) {
    return (
      <View style={styles.detailBox}>
        <Text style={[styles.detailText, { marginBottom: 5 }]}>{label}</Text>
        <TextInput
          style={[styles.input, disabled && { backgroundColor: theme.colors.primary }]}
          value={profile?.[key] || ''}
          editable={!disabled && isEditing}
          onChangeText={(text) => setProfile({ ...profile, [key]: text })}
        />
      </View>
    );
  }
}



