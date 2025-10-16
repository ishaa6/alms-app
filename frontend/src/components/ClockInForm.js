import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Modal, Image} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {images} from '../../constants';
import MapView, { Marker } from 'react-native-maps';
import RNPickerSelect from 'react-native-picker-select';
import * as Location from 'expo-location';

import {UserContext} from  '../context/UserContext';
import {ThemeContext} from '../context/ThemeContext'
import CustomButton from '../../components/CustomButton';

export default function ClockInForm({setManualClockInVisible, setShowSuccessModal, showSuccessModal}) {
  const { theme } = useContext(ThemeContext);
  const { makeEntry, shiftTypes } = useContext(UserContext);
  const [shiftType, setShiftType] = useState('');
  const [date, setDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTimePicker, setStartTimePicker] = useState(false);
  const [endTimePicker, setEndTimePicker] = useState(false);
  const [inTime, setInTime] = useState(null);
  const [outTime, setOutTime] = useState(null);
  const [location, setLocation] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationModal, setLocationModal] = useState(false);
  const [reason, setReason] = useState('');
  const [applyStatus, setApplyStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const now = new Date();
  const minDate = new Date(now.getFullYear(), now.getMonth(), 1);

  const detectLocation = async () => {
    setIsFetchingLocation(true);
    console.log("Starting location detection...");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      console.log("Coordinates:", latitude, longitude);

      setCoordinates({ latitude, longitude });

      const res = await fetch(`http://192.168.1.8:3000/api/reverse-geocode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          latitude,
          longitude
        })
      });
      
      const data = await res.json();
      console.log("Reverse geocode result:", data);

      setLocationName(data.location);
      setLocation(data.location);
      setIsFetchingLocation(false);
    } catch (error) {
      console.error("Location detection failed:", error);
      Alert.alert("Error", "Failed to detect location.");
    }
  };

  
  const formatDate = (date) => {
    return date ? date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }) : '';
  };

  const formatTime = (date) => {
  return date.toLocaleTimeString('en-GB', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  };

  const formatDateOnly = (date) => {
    return date.toISOString().split('T')[0]; 
  };

const getPublicIP = async () => {
    try {
      const response = await fetch('https://api64.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Failed to get public IP:', error);
      return null;
    }
};  

const onSubmit = async () => {
  if (!date || !reason || !shiftType || !inTime || !outTime || !location) {
    Alert.alert('Please fill all fields');
    return;
  }

  const ip = await getPublicIP();

  try {
    const response = await makeEntry(
      shiftType,
      formatDateOnly(date),
      reason,
      formatTime(inTime),
      formatTime(outTime),
      location,
      ip,
      coordinates,
    );

    if (response?.error) {
      Alert.alert('Failed to make entry', response.error);
    } else if (response?.message === 'Attendance entry created') {
      setApplyStatus('Entry submitted');
      setDate('');
      setReason('');
      setInTime('');
      setOutTime('');
      setShiftType('');
      setLocation('')
      setShowSuccessModal(true); 
      setManualClockInVisible(false);
    } else {
      Alert.alert('Unexpected response', JSON.stringify(response));
    }
  } catch (err) {
    console.error('Submission error:', err);
    Alert.alert('Error', 'Something went wrong while making entry');
  }
};


  return (
    <View>
    <View style={{ padding: 6 }}>
      {/*Date Picker */}
      <Text style={{ color: theme.colors.text, marginBottom: 4 }}>Date</Text>
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        className='justify-center border rounded-lg mb-4 px-4 handleDecision h-[50px]'
        style={{
          borderColor: theme.colors.secondary,}}
      >
        <Text style={{ color: date ? theme.colors.text : theme.colors.secondary }}>
          {date ? formatDate(date) : 'Select Date'}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        minimumDate={minDate}
        onConfirm={(date) => {
          setDate(date);
          setShowDatePicker(false)
        }}
        onCancel={() => setShowDatePicker(false)}
      />

        <View className='flex-row items-center justify-between mb-4'>
            <View>
                <Text style={{ color: theme.colors.text, marginBottom: 4 }}>Clock-in Time</Text>
                <TouchableOpacity
                    onPress={() => setStartTimePicker(true)}
                    className='justify-center border rounded-lg mb-4 px-4 handleDecision h-[50px]'
                    style={{
                    borderColor: theme.colors.secondary,}}
                >
                    <Text style={{ color: inTime ? theme.colors.text : theme.colors.secondary }}>
                    {inTime ? inTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'In time'}
                    </Text>
                </TouchableOpacity>

                <DateTimePickerModal
                    isVisible={startTimePicker}
                    mode="time"
                    is24Hour={false}
                    display="clock"
                    onConfirm={(time) => {
                    setStartTimePicker(false);
                    if (outTime && time >= outTime) {
                      Alert.alert("Invalid Time", "Clock-in time must be before Clock-out time");
                    }
                    else{
                    setInTime(time);
                    }
                    }}
                    onCancel={() => setStartTimePicker(false)}
                />
            </View>

            <View>
                <Text style={{ color: theme.colors.text, marginBottom: 4 }}
                    className='text-m'
                >Clock-out Time</Text>
                <TouchableOpacity
                    onPress={() => setEndTimePicker(true)}
                    className='justify-center border rounded-lg mb-4 px-4 handleDecision h-[50px]'
                    style={{
                    borderColor: theme.colors.secondary,}}
                >
                    <Text style={{ color: outTime ? theme.colors.text : theme.colors.secondary }}>
                    {outTime ? outTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Out time'} 
                    </Text>
                </TouchableOpacity>

                <DateTimePickerModal
                    isVisible={endTimePicker}
                    mode="time"
                    is24Hour={false}
                    display="clock"
                    onConfirm={(time) => {
                    setEndTimePicker(false);
                    if (inTime && time <= inTime) {
                      Alert.alert("Invalid Time", "Clock-out time must be after Clock-in time");
                      return;
                    }
                    else{
                    setOutTime(time);
                    }
                    }}
                    onCancel={() => setEndTimePicker(false)}
                />
            </View>
        </View>

        <Text style={{ color: theme.colors.text, marginBottom: 4 }}>Shift Type</Text>
        <View 
            className='border justify-center rounded-lg mb-4 h-[50px]'
            style={{borderColor: theme.colors.secondary}}>
            <RNPickerSelect
            placeholder={{ label: 'Select Shift Type', value: null, color: theme.colors.secondary, disabled: true }}
            items={shiftTypes} 
            onValueChange={(value) => setShiftType(value)}
            value={shiftType}
            style={{
                
                inputIOS: { color: theme.colors.text },
                inputAndroid: { color: theme.colors.text },
                placeholder: { color: theme.colors.secondary, fontStyle: 'italic' } // customize as needed
            }}
            />
        </View>

        {/*Location */}
          <Text style={{ color: theme.colors.text }}>Location</Text>
          <TouchableOpacity
          onPress = {async()=>{
            detectLocation().then(() => {
            setLocationModal(true);
          });
          }}
          >
              <Text 
                className='border rounded-lg mb-4 px-4 justify-center h-min-[50px]'
                style={{ color: location ? theme.colors.text : theme.colors.secondary, borderColor: theme.colors.secondary, borderWidth: 1, borderRadius: 8, padding: 8, marginBottom: 20 }}>
                {location || "Detect Location"}
              </Text>
          </TouchableOpacity>

        {/* Leave Reason */}
        <Text style={{ color: theme.colors.text }}>Reason</Text>
            <TextInput
              className='border rounded-lg mb-4 px-4 justify-center h-[50px]'
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
              style={{ color: theme.colors.text, borderColor: theme.colors.secondary, borderWidth: 1, borderRadius: 8, padding: 8, marginBottom: 20 }}
              placeholder="Enter reason"
              placeholderTextColor={theme.colors.secondary}
        />

        <View className='w-full items-center'>
            <CustomButton
                    title='Clock In'
                    containerStyles='mt-5 w-1/2 min-h-[50px]'
                    handlePress={onSubmit}
                    isLoading={isSubmitting}
            />
        </View>

        <Modal visible={locationModal} animationType="slide" transparent={false}>
          <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            
            <MapView
              style={{ flex: 1 }}
              region={{
                latitude: coordinates?.latitude || 12.9716,
                longitude: coordinates?.longitude || 77.5946,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              {coordinates && (
                <Marker
                  coordinate={coordinates}
                  title="Your Location"
                  description={isFetchingLocation ? "Detecting..." : locationName}
                />
              )}
            </MapView>

            <View style={{ padding: 16 }}>
              <Text style={{ fontSize: 16, color: theme.colors.primary, marginBottom: 8 }}>
                Detected Location
              </Text>
              <Text className='bg-gray-200 p-3 rounded-md'>
                {locationName || 'Detecting...'}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                <TouchableOpacity
                  onPress={() => setLocationModal(false)}
                  className='py-3 px-5 rounded-md mr-2'
                  style = {{backgroundColor: theme.colors.secondary}}
                >
                  <Text className='font-semibold'
                  style = {{color: theme.colors.text}}
                  >CANCEL</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={async () => {
                    setLocationModal(false);
                    await detectLocation();
                  }}
                  className='py-3 px-5 rounded-md'
                  style = {{backgroundColor: theme.colors.primary}}
                >
                  <Text className='text-white font-semibold'
                  style = {{color: theme.colors.text}}
                  >CONFIRM</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
    </View>


  </View>
  );
}
