import React, { useRef, useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import CustomButton from '../../../components/CustomButton';
import {ThemeContext} from '../../context/ThemeContext'
import {UserContext} from '../../context/UserContext'

export default function CodeVerification({ codeInput, setCodeInput, email, setStep }) {
  const { theme } = useContext(ThemeContext);
  
  const inputRefs = useRef([]);

  const [isLoading, setIsLoading] = useState(false);

  const {verifyCode, sendVerificationCode, timer, setTimer} = useContext(UserContext);

  const [expired, setExpired] = useState(false);

  const onResend = async() => {
    if (expired){
      setExpired(false);
    }
    try{
      await sendVerificationCode(email);
    } catch(err){
      console.log(err);
      Alert.alert('error', 'Something went wrong');
    }
  }

  useEffect(() => {
    if (timer <= 0) {
      setExpired(true);
      return;
    }
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCodeChange = (val, i) => {
    const updated = [...codeInput];
    updated[i] = val.replace(/[^0-9]/g, '');
    setCodeInput(updated);
    if (val && i < 3) inputRefs.current[i + 1].focus();
  };

  const handleCodeVerification = async() => {
    const code = codeInput.join('')

    if (code.length < 4) {
      Alert.alert('Error', 'Please enter the full 4-digit code');
      return;
    }

    setIsLoading(true);
        
    try{
      const res = await verifyCode(email, code);
      if(res?.error){
        Alert.alert('Verification Error', res.error);
        setCodeInput('');
      } else{
        setStep(3);
      }
    } catch(err)
    {
      Alert.alert('Error', err?.error || 'Something went wrong');
    } finally{
      setIsLoading(false);
    }
  };

  return (
    <View className="items-center mt-10 p-6 rounded-xl shadow mb-4" style={{ backgroundColor: theme.colors.card }}>
      <Text className="text-xxl font-semibold mb-2" style={{ color: theme.colors.primary }}>
        Enter Verification Code
      </Text>

      <Text className="mb-8 text-center" style={{ color: theme.colors.text }}>
        We’ve sent a code to <Text style={{ fontWeight: 'bold' }}>{email}</Text>
      </Text>

      <View className="flex-row justify-between mb-6 w-full px-8">
        {[0, 1, 2, 3].map((_, i) => (
          <TextInput
            key={i}
            ref={(ref) => (inputRefs.current[i] = ref)}
            value={codeInput[i]}
            onChangeText={(val) => handleCodeChange(val, i)}
            keyboardType="number-pad"
            maxLength={1}
            style={{
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.secondary,
              borderWidth: 1,
              borderRadius: 10,
              textAlign: 'center',
              fontSize: 22,
              color: theme.colors.text,
              width: 50,
              height: 50,
            }}
          />
        ))}
      </View>

      <TouchableOpacity onPress={onResend}>
        <Text style={[{ textDecorationLine: 'underline' }, { color: theme.colors.secondary}]}>
          Click to Resend Code
        </Text>
      </TouchableOpacity>

      <CustomButton
        title="Verify"
        containerStyles="mt-6 w-1/2 min-h-[50px]"
        handlePress={handleCodeVerification}
        isLoading={isLoading}
      />

      <View className="mt-10">
        {timer > 0 ? (
          <Text style={{ color: theme.colors.text }}>
            Code expires in: {formatTime(timer)}
          </Text>
        ) : (
          <Text style={{ color: 'red', fontWeight: 'bold' }}>
            Code expired
          </Text>
        )}
      </View>

    </View>
  );
}
