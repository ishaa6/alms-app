import React, {useContext, useEffect, useState} from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ThemeContext} from '../../context/ThemeContext'
import { UserContext } from '../../context/UserContext';
import {LeaveFilterContext} from '../../context/FilterContext';

const getStatusColor = (status) => {
    if (status === 'Approved') return 'text-green-500';
    if (status === 'Rejected') return 'text-red-500';
    if (status === 'Pending') return 'text-gray-400';
    if (status === 'Redeemed') return 'text-red-500';
    if (status === 'Redeem') return 'text-green-500';
    return 'text-white';
  };

function formatDateToDDMMYYYY(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

const ScheduledLeaves = () => {
  const { theme } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();
  const { scheduledLeaves, cancelLeave } = useContext(UserContext);

  const { searchQuery, selectedDate, trigger } = useContext(LeaveFilterContext);
  const [filteredLeaves, setFilteredLeaves] = useState([]);

  const onCancelLeave = (leave) => {
    Alert.alert(
      'Confirm',
      'Are you sure you want to cancel this leave?',
      [
        { text: 'No' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await cancelLeave(leave);
            } catch (err) {
              Alert.alert('Error', 'Could not cancel leave');
            }
          },
        },
      ]
    );
  };

  const renderCard = (item) => (
    <View className="p-4 rounded-xl my-2"
      style={{backgroundColor: theme.colors.card}}
    >
      <Text className="font-semibold"
       style={{color:theme.colors.text}}
      >
        {new Date(item.from_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
          {item.to_date !== item.from_date && (
            ' - ' +
            new Date(item.to_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          )}
        </Text>
      <Text style={{color:theme.colors.text}}>Leave Type: <Text className="font-medium">{item.leave_type}</Text></Text>
      <Text style={{color:theme.colors.text}}>Reason: <Text className="font-medium">{item.reason}</Text>
      </Text>

      <View className="mt-2 flex-row justify-between items-center">
        <Text className={`font-bold ${getStatusColor(item.status)}`}>{item.status}</Text>

        <TouchableOpacity
          onPress={() => onCancelLeave(item)}
          className="py-1 px-3 rounded-lg"
          style={{ backgroundColor: 'red' }}
        >
          <Text className="text-white font-semibold">Cancel Leave</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  useEffect(() => {
    const filtered = scheduledLeaves.filter((leave) => {
      const matchesQuery = 
        leave.leave_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        leave.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        leave.status.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = selectedDate
        ? new Date(formatDateToDDMMYYYY(leave.from_date)) <= new Date(selectedDate) &&
          new Date(selectedDate) <= new Date(formatDateToDDMMYYYY(leave.to_date))
        : true;
      return matchesQuery && matchesDate;
    });
    setFilteredLeaves(filtered);
  }, [scheduledLeaves, searchQuery, selectedDate, trigger]);

  return (
    <View style={{flex:1}}>
      {filteredLeaves.length>0?(
        <FlatList
            data = {filteredLeaves}
            renderItem={({ item }) => renderCard(item)}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        />): (
        <Text className='text-xl font-semibold'
        style={{ textAlign: 'center', marginTop: 20, color:theme.colors.text }}>No data found</Text>
      )}
    </View>
  );
};

export default ScheduledLeaves;