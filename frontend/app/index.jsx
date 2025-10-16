import {StatusBar} from 'expo-status-bar';
import {Text, View, ScrollView, Image, ActivityIndicator} from 'react-native';
import {logo} from './themes/theme';
import {ThemeContext} from '../src/context/ThemeContext'
import {Redirect, router} from 'expo-router';
import {SafeAreaView} from 'react-native-safe-area-context';
import React, {useState, useEffect, useContext} from 'react';

import { images } from "../constants";
import CustomButton from '../components/CustomButton';
import {UserContext, UserProvider} from '../src/context/UserContext';

function AppNavigator() {
    const { user, checkAuth } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const { theme, mode } = useContext(ThemeContext);

    useEffect(() => {
      const init = async () => {
        try {
          await checkAuth();
        } catch (err) {
          console.error('Auth check failed:', err);
        } finally {
          setLoading(false);
        }
      };
      init();
    }, []);

    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (user!==null) {
      return <Redirect href="/home" />;
    }

    return (
      <SafeAreaView className='h-full flex-1 justify-space-between' style={{backgroundColor: theme.colors.background}}>
        <ScrollView contentContainerStyle={{height:'100%'}}>
          <View className='w-full justify-center items-center min-h-[85vh] px-4'>
            <Image 
              source={logo}
              className='w-[130px] h-[84px]'
              resizeMode='contain'
            />
          <Image
            source={images.cards}
            className='max-w-[280px] w-full h-[300px] mt-10'
            resizeMode='contain'
          />

          <View className='relative'>
            <Text style={{ color: theme.colors.text }} className='text-3xl font-bold text-center'> Track your </Text>
            <Text style={{ color: theme.colors.primary }} className='text-3xl font-pblack text-center mt-1'>Attendance</Text>
          </View>

          <Text className='text-xl font-pregular mt-3 text-center'
            style={{color:theme.colors.text}}>
            Tap In. Track On.
          </Text>

          <CustomButton
            title='Continue with Email'
            handlePress={() => router.push('/sign-in')}
            containerStyles="w-3/4 mt-10 inset-shadow-sm min-h-[50px]"
          />

        </View>      
      </ScrollView>

      <StatusBar 
        style={mode}
      />

    </SafeAreaView>
    );
}

export default function App() {
  return (
    <AppNavigator />
  );
}
