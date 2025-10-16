import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import RNPickerSelect from 'react-native-picker-select';

import {UserContext} from '../../context/UserContext';
import { ThemeContext } from '../../context/ThemeContext';
import CustomButton from '../../../components/CustomButton';

export default function LeaveForm({setShowLeaveForm, setShowSuccessModal, setShowErrorModal, setErrorMessage, setDetails}) {
  const { theme } = useContext(ThemeContext);
  const { applyLeave, leaveTypes } = useContext(UserContext);
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [reason, setReason] = useState('');
  const [leaveStatus, setLeaveStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const now = new Date();
  const minDate = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const formatDate = (date) => {
    return date ? date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }) : '';
  };

const onSubmit = async () => {
  if (!startDate || !endDate || !reason || !leaveType) {
    Alert.alert('Incomplete Form', 'Please fill all fields');
    return;
  }

  try {
    setIsSubmitting(true);
    const response = await applyLeave(leaveType, startDate, endDate, reason);
    console.log('RESPONSE:', response);

    if (response?.message === 'Leave applied successfully') {
      console.log(">>> Showing Success Modal");
      setLeaveStatus(response.message);
      setStartDate(null);
      setEndDate(null);
      setReason('');
      setLeaveType('');
      setShowSuccessModal(true);
      setShowLeaveForm(false);
      let remaining = '';
      if (response.optional_holidays_left !== undefined) {
        remaining += `Optional Holidays Left: ${response.optional_holidays_left}\n`;
      }
      if (response.holidays_left !== undefined) {
        remaining += `Holidays Left: ${response.holidays_left}`;
      }
      setDetails(`${remaining}`);
    } else if (response?.error) {
      console.log(">>> Showing Error Modal");
      let remaining = '';
      if (response.optional_holidays_left !== undefined) {
        remaining += `Optional Holidays Left: ${response.optional_holidays_left}\n`;
      }
      if (response.holidays_left !== undefined) {
        remaining += `Holidays Left: ${response.holidays_left}`;
      }
      setErrorMessage(`${response.error}`);
      setDetails(`${remaining}`);
      setShowErrorModal(true);
      setShowLeaveForm(false);
    }
  } catch (err) {
    Alert.alert('Error', 'Something went wrong while applying leave');
    console.error(err);
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <View>
    <View style={{ padding: 6 }}>
      {/* Leave Type Dropdown */}
      <Text style={{ color: theme.colors.text, marginBottom: 4 }}>Leave Type</Text>
      <View 
        className='border justify-center rounded-lg mb-4 h-[50px]'
        style={{borderColor: theme.colors.secondary}}>
        <RNPickerSelect
          placeholder={{ label: 'Select Leave Type', value: null, color: theme.colors.secondary, disabled: true }}
          items={leaveTypes} 
          onValueChange={(value) => setLeaveType(value)}
          value={leaveType}
          style={{
            
            inputIOS: { color: theme.colors.text },
            inputAndroid: { color: theme.colors.text },
            placeholder: { color: theme.colors.secondary, fontStyle: 'italic' } // customize as needed
          }}
        />
      </View>

      {/* Start Date Picker */}
      <Text style={{ color: theme.colors.text, marginBottom: 4 }}>Start Date</Text>
      <TouchableOpacity
        onPress={() => setShowStartPicker(true)}
        className='justify-center border rounded-lg mb-4 px-4 handleDecision h-[50px]'
        style={{
          borderColor: theme.colors.secondary,}}
      >
        <Text style={{ color: startDate ? theme.colors.text : theme.colors.secondary }}>
          {startDate ? formatDate(startDate) : 'Select Start Date'}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={showStartPicker}
        mode="date"
        minimumDate={minDate}
        onConfirm={(date) => {
          setStartDate(date);
          setShowStartPicker(false);
          if (endDate && date > endDate) {
              setEndDate(null);
          }
        }}
        onCancel={() => setShowStartPicker(false)}
      />

      {/* End Date Picker */}
      <Text style={{ color: theme.colors.text, marginBottom: 4 }}>End Date</Text>
      <TouchableOpacity
        onPress={() => setShowEndPicker(true)}
        className='border rounded-lg mb-4 px-4 justify-center h-[50px]'
        style={{borderColor: theme.colors.secondary}}
      >
        <Text style={{ color: endDate ? theme.colors.text : theme.colors.secondary }}>
          {endDate ? formatDate(endDate) : 'Select End Date'}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={showEndPicker}
        mode="date"
        minimumDate={
          startDate
            ? new Date(startDate.setDate(startDate.getDate()))
            : new Date()
        }
        onConfirm={(date) => {
          setEndDate(date);
          setShowEndPicker(false);
        }}
        onCancel={() => setShowEndPicker(false)}
      />

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
                    title='Apply Leave'
                    containerStyles='mt-5 w-1/2 min-h-[50px]'
                    handlePress={onSubmit}
                    isLoading={isSubmitting}
            />
        </View>
    </View>
  </View>
  );
}
