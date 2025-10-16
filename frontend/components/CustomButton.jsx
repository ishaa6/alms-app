import { View, Text, TouchableOpacity } from 'react-native';
import React, {useContext} from 'react';
import { ThemeContext } from '../src/context/ThemeContext';

const CustomButton = ({
  title,
  handlePress,
  containerStyles = '',
  textStyles = '',
  isLoading,
  butColor,
  textColor,
  icon = null,
}) => {
  const { theme } = useContext(ThemeContext);
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isLoading}
      style={{ backgroundColor: butColor || theme.colors.primary }}
      className={`rounded-xl justify-center items-center ${containerStyles} ${isLoading ? 'opacity-50' : ''}`}
    >
      <View className="flex-row items-center justify-center">
        {icon && React.isValidElement(icon) ? (
          <View className="px-2 py-1">{icon}</View>
        ) : title && (
          <Text
            className={`font-semibold text-lg text-center ${textStyles}`}
            style={{ color: textColor || theme.colors.text }}
          >
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default CustomButton;
