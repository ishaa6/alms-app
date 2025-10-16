import CustomButton from '@/components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState, useContext } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { SafeAreaView } from 'react-native-safe-area-context';

import {UserContext} from '../../src/context/UserContext';
import api from '../../src/api/api';
import { ThemeContext } from '../../src/context/ThemeContext';

export default function AttendanceScreen() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const {leaveBalance} = useContext(UserContext)
  const { theme } = useContext(ThemeContext);

  const fetchSummary = async () => {
    try {
      const response = await api.getAttendanceSummary();
      console.log(response);
      setSummary(response); 
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      Alert.alert('Error', 'Failed to load attendance summary.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between p-4" style={{ backgroundColor: theme.colors.secondary }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text className="text-xl font-bold"
            style={{color:theme.colors.text}}
          >ATTENDANCE</Text>
          <View style={{ width: 28 }} />
        </View>

        <View className="items-center mt-6 mb-6">
          <AnimatedCircularProgress
            size={120}
            width={12}
            fill={summary?.attendancePercentage || 0}
            tintColor="green" // Color for present
            backgroundColor="red" // Color for absent
            rotation={0}
            lineCap="round"
          >
            {() => (
              <Text className="text-2xl font-bold"
                style={{color:theme.colors.text}}
              >
                {summary?.attendancePercentage || 0}%
              </Text>
            )}
          </AnimatedCircularProgress>
        </View>


        {/* Legends */}
        <View className="flex-row justify-around mb-6">
          {renderLegend('green', 'Present')}
          {renderLegend('red', 'Absent')}
        </View>

        {/* Summary Boxes */}
        <View className='mt-4 px-4 items-center mb-4'> 
          <Text className='text-lg font-semibold mb-2'
            style={{color:theme.colors.text}}
          >Annual Summary</Text>
        </View>
          <View className="flex-row justify-around mb-6">
            {renderSummaryBox('Working Days', `${summary?.workingDays || 0} days`)}
            {renderSummaryBox('Leave Taken', `${summary?.leaveTaken || 0} days`)}
          </View>
          <View className="flex-row justify-around mb-6">
            {renderSummaryBox('Leave Balance', `${leaveBalance || 0} days`)}
            {renderSummaryBox('Late clock-ins', `${summary?.lateClockIns || 0} days`)}
          </View>

          <CustomButton
            title="View Calendar"
            handlePress={() => router.push('screens/CalendarScreen')}
            containerStyles="mt-4 mx-20 rounded-full py-2 bg-white"
            textStyles="text-center text-black font-bold"
          />
        
      </ScrollView>
    </SafeAreaView>
  );

  function renderLegend(color, label) {
    return (
      <View className="flex-row items-center">
        <View style={{ width: 15, height: 15, borderRadius: 3, backgroundColor: color, marginRight: 5 }} />
        <Text style={{color:theme.colors.text}}>{label}</Text>
      </View>
    );
  }

  function renderSummaryBox(title, value) {
    return (
      <View className="p-4 rounded-xl w-[40%] items-center border"
        style={{backgroundColor:theme.colors.card, borderColor:theme.colors.primary}}
      >
        <Text className="text-center mb-2"
          style={{color:theme.colors.text}}
        >
          {title}</Text>
        <Text className="font-bold text-lg"
          style={{color:theme.colors.text}}
        >
          {value}</Text>
      </View>
    );
  }
}

