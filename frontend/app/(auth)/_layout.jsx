//add animations while switching between screens
//add back option for reset password screen

import { Stack } from "expo-router";
import {useContext} from 'react';
import {ThemeContext} from '../../src/context/ThemeContext';
import { StatusBar } from "expo-status-bar";
import React from 'react';

const AuthLayout = () =>{
  const { mode } = useContext(ThemeContext);
  return (
    <>
      <Stack>
        <Stack.Screen
          name="sign-in"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="reset"
          options={{ headerShown: false }}
        />
      </Stack>

      <StatusBar 
        style={mode}
      />
    </>
  );
}

export default AuthLayout;
