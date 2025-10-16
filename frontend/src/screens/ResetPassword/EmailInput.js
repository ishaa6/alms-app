import React, {useContext, useState} from 'react';
import { View, Text, Alert } from 'react-native';
import FormField from '../../../components/FormField';
import CustomButton from '../../../components/CustomButton';
import { ThemeContext } from '../../context/ThemeContext';
import {UserContext} from '../../context/UserContext'

export default function EmailInput({ form, setForm, onNext }) {
  const { theme } = useContext(ThemeContext);
  const {verifyMail, sendVerificationCode} = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async() => {
    if(!form.email){
      Alert.alert("Enter email address");
      return;
    }
    setIsLoading(true);
    try {
      const response = await verifyMail(form.email);
      if (response.exists){
        await sendVerificationCode(form.email);
        onNext();
      }
      else{
        Alert.alert('Error', 'Employee mail not found');
      }
    } catch(err){
      console.log(err);
      Alert.alert('Error', 'Something went wrong. Try again later!')
    } finally{
      setIsLoading(false);
    }
  };

  return (
    <View className='h-full flex-1 items-center justify-space-between flex-grow'>
    <View className='border-2 p-5 mt-10 ring-1 ring-offset-2 shadow-xl/30 rounded-lg inset-shadow-xs'>
      <FormField
        title="Mail id"
        value={form.email}
        handleChangeText={(e) => setForm({ ...form, email: e })}
        keyboardType="email-address"
        placeholder="Enter email address"
        containerStyles='self-center mb-8'
      />

      <CustomButton
        title="   Get Verification Code   "
        containerStyles="mt-8 rounded-full mt-2 self-center min-h-[50px] mb-8"
        handlePress={onSubmit}
        isLoading = {isLoading}
      />
    </View>
    </View>
  );
}
