import {Text, View } from 'react-native'
import {Stack, SplashScreen} from 'expo-router';
import {useFonts} from 'expo-font';
import {useEffect, useContext} from 'react';

import {UserProvider, UserContext} from '../src/context/UserContext';
import {LeaveFilterProvider} from '../src/context/FilterContext';
import "../global.css";
import RefreshWrapper from '../src/components/RefreshWrapper';
import {ThemeProvider} from '../src/context/ThemeContext';

SplashScreen.preventAutoHideAsync();
const InnerLayout = () => {
  const { checkAuth } = useContext(UserContext); 

  useEffect(() => {
    checkAuth();
  }, []);

  return (
      <Stack screenOptions={{ headerShown: false }} />
  );
};

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
  });

  useEffect(() => {
    if(error) throw error;
    if(fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error])

  if(!fontsLoaded && !error) {
    return <Text>Loading...</Text>;
  }; 
  return (
    <ThemeProvider>
      <UserProvider>
        <LeaveFilterProvider>
          <InnerLayout/>
        </LeaveFilterProvider>
      </UserProvider>
    </ThemeProvider>
  )
}

export default RootLayout;  