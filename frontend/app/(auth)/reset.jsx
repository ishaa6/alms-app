import React, { useState, useContext } from 'react';
import { SafeAreaView, ScrollView, Image, Alert, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { logo } from '../themes/theme';
import EmailInput from '../../src/screens/ResetPassword/EmailInput';
import CodeVerification from '../../src/screens/ResetPassword/CodeVerification';
import NewPassword from '../../src/screens/ResetPassword/NewPassword';
import {ThemeContext} from '../../src/context/ThemeContext'

export default function Reset() {
  const { theme } = useContext(ThemeContext);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: '',
    verificationCode: '',
    password: '',
    confirmPassword: ''
  });

  const [codeInput, setCodeInput] = useState(['', '', '', '']);

  const handleRequestCode = () => {
    setStep(2); // Trigger email send
  };

  return (
    <SafeAreaView className="flex-1 items-center" style={{ backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="w-full px-5">
        <StatusBar style="light" />
          <View className='w-full mt-5 items-center'>
            <Image 
              source={logo}
              className='w-full max-w-[300px] h-auto aspect-square'
              resizeMode='contain'
            />
          </View>

        {step === 1 && <EmailInput form={form} setForm={setForm} onNext={handleRequestCode} />}
        {step === 2 && <CodeVerification codeInput={codeInput} setCodeInput={setCodeInput} email={form.email} setStep = {setStep} />}
        {step === 3 && <NewPassword form={form} setForm={setForm} email={form.email} />}
      </ScrollView>
    </SafeAreaView>
  );
}
