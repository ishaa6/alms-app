import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native'
import React, {useState} from 'react';

import {icons} from '../constants';
import { router, usePathname } from 'expo-router';

const SearchInput = ({initialQuery}) => {
  const pathName = usePathname();
  const [focused, setfocused] = useState(false)
  const [query, setQuery] = useState( initialQuery || "");

  const handleSearch = () => {
    if (query.trim() === "") {
      return Alert.alert("Missing Query", "Search using a prompt");
    }
    if (pathName.startsWith('/search')) {
      router.setParams({query: String(query)});
    } else {
      router.push(`/search/${String(query)}`);
    }
  };


  return (
      <View 
        className={`border-2 border-black-200 w-full h-16 px-4 bg-black-100 
        rounded-2xl ${focused ? 'border-secondary' : 'border-black-200'} flex-row items-center space-x-4`}>
            <TextInput
                placeholder='Search for video'
                className='text-base mt-0.5 text-white flex-1 font-pregular'
                value = {query}
                onFocus={() => setfocused(true)}
                onBlur={() => setfocused(false)}
                placeholderTextColor='#CDCDE0'
                onChangeText = {(e) => setQuery(e)}
            />

            <TouchableOpacity onPress={handleSearch}>
                <Image 
                    source = {icons.search}
                    className = 'w-5 h-5'
                    resizeMethod='contain'
                />
            </TouchableOpacity>
      </View>
  )
}

export default SearchInput