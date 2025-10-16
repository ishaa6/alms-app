import { View, Text, Image, Alert, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import {logo} from '../themes/theme';

import {StatusBar} from 'expo-status-bar';
import {Link, router} from 'expo-router';
import React, { useState, useEffect, useContext } from 'react'; 
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Animatable from 'react-native-animatable';
import { UserContext } from '../../src/context/UserContext';
import {ThemeContext} from '../../src/context/ThemeContext'

import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import {handleLogin} from '../../src/screens/LoginScreen';

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const SignIn = () => {
  const { setUser } = useContext(UserContext);
  const { theme, mode } = useContext(ThemeContext);
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all fields');
    }
    else if (!isValidEmail(form.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
    } 
    else
    {
      handleLogin(form.email, form.password, setUser, setIsSubmitting);
    }
  } 

  return (
    <SafeAreaView className='h-full flex-1 items-center justify-space-between flex-grow' style={{backgroundColor: theme.colors.background}}>
      <StatusBar style={mode}/>

      <View className='w-full mt-5 items-center'>
        <Image 
          source={logo}
          className='w-full max-w-[200px] h-auto aspect-square'
          resizeMode='contain'
        />
        <Text className="font-pregular text-2xl" style={{color:theme.colors.text}}>Track your attendance</Text>
      </View>

      <View className='border-2 p-5 mt-10 ring-1 ring-offset-2 shadow-xl/30 rounded-lg inset-shadow-xs'
        style={{backgroundColor: 'theme.colors.secondary', borderColor: theme.colors.secondary}}>
        <FormField 
                    title='Email'
                    value={form.email}
                    handleChangeText={(e) => setForm({...form,
                      email:e
                    })}
                    keyboardType='email-address'
                    placeholder='Enter email address'
        />
        
        <FormField 
                    title='Password'
                    value={form.password}
                    handleChangeText={(e) => setForm({...form,
                      password:e
                    })}
                    otherStyles='mt-7 mb-7'
                    placeholder='Enter password'
        />
      </View>

      <View className='mt-10 w-full items-center'>
        <CustomButton
                    title='Sign In'
                    containerStyles='mt-8 w-1/2 h-6 min-h-[50px]'
                    handlePress={submit}
                    isLoading={isSubmitting}
        />
        
        <TouchableOpacity onPress={() => router.push('/reset')}>
          <Text
            className="text-m underline mt-5"
            style={{ color: theme.colors.secondary }}
          >
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
export default SignIn