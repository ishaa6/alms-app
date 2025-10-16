import { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useContext } from 'react';

import { ThemeContext } from '../src/context/ThemeContext';

import { icons } from '../constants';

const FormField = ({
    title, value, placeholder, handleChangeText, butColor, textColor, otherStyles, containerStyles, textStyles, ...props
}) => {
  const { theme } = useContext(ThemeContext);
  const [showPassword, setshowPassword] = useState(false)
  const [focused, setfocused] = useState(false)

  return (
    <View className={`space-y-2 ${containerStyles}`}>
      <Text className={`text-xl text-semibold mt-10 font-psemibold ${textStyles}`} style={{color:textColor||theme.colors.text}}>
        {title}
      </Text>

      <View 
        className={`w-full h-16 px-4 border-2 rounded-2xl flex-row items-center min-w-[275px]`}
        style={{borderColor: focused ? theme.colors.primary : theme.colors.secondary}}>    
            <TextInput
                placeholderTextColor={theme.colors.secondary}
                className={`flex-1 bg-transparent py-2 px-1`}
                style={[{color:theme.colors.text} ,{borderColor:theme.colors.text}]}
                value = {value}
                placeholder={placeholder}
                onChangeText={handleChangeText}
                secureTextEntry={title=='Password' && !showPassword} 
                onFocus={() => setfocused(true)}
                onBlur={() => setfocused(false)}
            />

            {title === 'Password' && (
                <TouchableOpacity onPress={() => 
                    setshowPassword(!showPassword)}>
                        <Image 
                            source={!showPassword ? icons.eye : icons.eyeHide}
                            className='w-10 h-10 flex-1 justify-center items-center'
                            resizeMode='contain'
                        />
                </TouchableOpacity>
            )}
      </View>
    </View>
  )
}

export default FormField