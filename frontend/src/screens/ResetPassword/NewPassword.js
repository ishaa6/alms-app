import React, {useState, useEffect, useContext} from 'react';
import { View, Alert } from 'react-native';

import api from '../../api/api';
import CustomButton from '../../../components/CustomButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../../context/ThemeContext'
import FormField from '../../../components/FormField';
import {UserContext} from '../../context/UserContext';
import {handleLogin} from '../LoginScreen';

export default function NewPassword({ form, setForm, email }) {
    const { theme } = useContext(ThemeContext);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {setNewPassword, setUser} = useContext(UserContext);

    const onSubmit = async() => {
      if(!form.password || !form.confirmPassword){
        return Alert.alert('Fill all the fields');
      }
      if (form.password !== form.confirmPassword){
        return Alert.alert('Passwords do not match');
      }
      try{
        const response = await setNewPassword(email, form.password);
        if (response?.message){
          handleLogin(email, form.password, setUser, setIsSubmitting);

        }
        else{
          Alert.alert('error', response?.error||'Failed to reset password');
        }
      } catch(err){
        Alert.alert('error', 'Something went wrong');
        console.log(err);
      }

    }  

  return (
    <SafeAreaView className='h-full flex-1 items-center justify-space-between flex-grow' style={{backgroundColor: theme.colors.background}}>
    <View className="border-2 p-5 mt-10 ring-1 ring-offset-2 shadow-xl/30 rounded-lg inset-shadow-xs">
      <FormField
        title="Password"
        value={form.password}
        handleChangeText={(e) => setForm({ ...form, password: e })}
        placeholder="Enter new password"
      />
      <FormField
        title="Password"
        value={form.confirmPassword}
        handleChangeText={(e) => setForm({ ...form, confirmPassword: e })}
        placeholder="Confirm new password"
        containerStyles="mt-5 mb-8"
      />

      <CustomButton
        title="   Reset Password   "
        containerStyles="mt-10 self-center min-h-[50px] mb-8"
        handlePress={onSubmit}
      />
    </View>
    </SafeAreaView>
  );
}
