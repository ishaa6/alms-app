import { Ionicons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { LeaveFilterContext } from '../../context/FilterContext';
import { ThemeContext } from '../../context/ThemeContext';

import HolidaySchedule from './HolidaySchedule';
import LeaveHistory from './LeaveHistory';
import ScheduledLeaves from './ScheduledLeave';

const tabs = ['Scheduled Leaves', 'Leave History', 'Holiday Schedule'];

function formatDateToDDMMYYYY(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

const History = () => {
  const { theme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('Scheduled Leaves');
  const [showPicker, setShowPicker] = useState(false);
  const { searchQuery, setSearchQuery, selectedDate, setSelectedDate, triggerRefetch } = useContext(LeaveFilterContext);

    const handleDateChange = (date) => {
    setSelectedDate(date);
    triggerRefetch();
    setShowPicker(false);
    };

  return (
        <>
            {/* Tabs */}
            <View className="flex-row justify-between rounded-xl p-1 mb-3">
                {tabs.map((tab) => (
                <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    className={'flex-1 py-2 rounded-xl'}
                    style={{borderWidth:1, borderColor: activeTab === tab ? theme.colors.primary : theme.colors.secondary}}
                >
                    <Text className="text-center"
                    style={{color: activeTab === tab ? theme.colors.text : theme.colors.secondary}}
                    >{tab}</Text>
                </TouchableOpacity>
                ))}
            </View>

            {/* Search + Calendar Icons */}
            <View className="flex-row items-center rounded-xl px-3 mb-2"
                style={{borderColor: theme.colors.text, borderWidth: 1}}
            >
                <TouchableOpacity
                    onPress={() => {triggerRefetch()}}
                >
                    <Ionicons name="search" size={20} color={theme.colors.text} />
                </TouchableOpacity>
                <TextInput
                placeholder={activeTab === 'Holiday Schedule' ? 'Holiday type or name' 
                  : 'Leave type, reason or status'}  
                placeholderTextColor={theme.colors.secondary}
                className="flex-1 text-white px-2 text-m"
                value={searchQuery}
                onChangeText={setSearchQuery}
                />

                <TouchableOpacity
                    onPress={()=>{setShowPicker(true);
                      setSelectedDate(null);
                    }}
                >
                    <Ionicons name="calendar" size={20} 
                    color={selectedDate? theme.colors.primary : theme.colors.text} />
                </TouchableOpacity>

                <DateTimePickerModal
                    isVisible={showPicker}
                    mode="date"
                    onConfirm={(date) => {
                      handleDateChange(formatDateToDDMMYYYY(date));
                      setShowPicker(false);
                    }}
                    onCancel={() => setShowPicker(false)}
                />
            </View>

            {/* Cards */}
            <View className="flex-1 p-4">
                {activeTab === 'Scheduled Leaves' && <ScheduledLeaves/>}
                {activeTab === 'Leave History' && <LeaveHistory />}
                {activeTab === 'Holiday Schedule' && <HolidaySchedule />}
            </View>
        </>
  );
};

export default History;