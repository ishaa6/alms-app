import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect, useContext } from 'react';
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

import {ThemeContext} from './../../src/context/ThemeContext'
import api from '../../src/api/api';

export default function CalendarScreen() {
  const { theme } = useContext(ThemeContext);
  const todayString = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [visible, setVisible] = useState({
    month: new Date().getMonth() + 1,
    year:  new Date().getFullYear(),
  });

  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);


  useEffect(() => {
    (async () => {
      setLoadingOverview(true);
      try {
        const { month, year } = visible;
        const data = await api.getMonthlyOverview(month, year);
        setOverview(data);
      } catch (err) {
        console.error('Failed to load overview:', err);
        setOverview(null);
      } finally {
        setLoadingOverview(false);
      }
    })();
  }, [visible]);

  useEffect(() => {
    (async () => {
      setLoadingAttendance(true);
      try {
        const data = await api.getAttendanceByDate(selectedDate);
        setAttendanceData(data);
      } catch (err) {
        console.error('Error loading attendance:', err);
        setAttendanceData(null);
      } finally {
        setLoadingAttendance(false);
      }
    })();
  }, [selectedDate]);

  const buildMarkedDates = () => {
    if (!overview) return {};

    const md = {};

    const addDot = (date, key, color) => {
      if (!md[date]) md[date] = { dots: [] };
      md[date].dots.push({ key, color });
    };

    overview.holidays.forEach((h, index) => {
      const from = new Date(h.from_date);
      const to = new Date(h.to_date);
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        addDot(dateKey, `holiday-${index}`, 'blue');
      }
    });


    overview.notClockedIn.forEach(date => {
      addDot(date, 'absent', 'red');
    });

    overview.leavesApproved.forEach(l => {
      const from = new Date(l.from_date);
      const to = new Date(l.to_date);

      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        const ds = d.toISOString().split('T')[0];
        addDot(ds, `leaveApproved-${ds}`, 'green'); // key must be unique
      }
    });

    if (!md[selectedDate]) md[selectedDate] = { dots: [] };
    md[selectedDate].selected = true;
    md[selectedDate].selectedColor = 'blue';

    return md;
  };

  const markedDates = buildMarkedDates();

  if (loadingOverview) {
    return (
      <SafeAreaView style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:theme.colors.background }}>
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
          >Calendar</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Calendar */}
        <View className="mx-4 my-6 p-4 rounded-xl" style={{ backgroundColor: theme.colors.primary }}>
          <Calendar
            current={`${visible.year}-${String(visible.month).padStart(2, '0')}-01`}
            onDayPress={day => setSelectedDate(day.dateString)}
            onMonthChange={m => setVisible({ month: m.month, year: m.year })}
            markingType="multi-dot"
            markedDates={markedDates}
            theme={{
              backgroundColor: theme.colors.primary,
              calendarBackground: theme.colors.primary,
              dayTextColor: theme.colors.text,
              monthTextColor: theme.colors.text,
              arrowColor: theme.colors.text,
              textSectionTitleColor: theme.colors.text,
            }}
          />
        </View>

        {/* 🔵 LEGEND */}
        <View style={{
          marginHorizontal: 16,
          marginTop: 12,
          marginBottom: 24,
          padding: 12,
          borderRadius: 8,
          backgroundColor: theme.colors.card,
          flexWrap: 'wrap',
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}>
          {[
            { label: 'Holiday', color: 'blue' },
            { label: 'Not Clocked-in', color: 'red' },
            { label: 'Leave (Approved)', color: 'green' },
          ].map(({ label, color }) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4, width: '48%' }}>
              <View style={{
                width: 10, height: 10, borderRadius: 5,
                backgroundColor: color, marginRight: 8
              }} />
              <Text style={{ fontSize: 14, color: theme.colors.text }}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Attendance Info */}
        <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
          <Text style={{
            color: theme.colors.text,
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 12
          }}>
            {new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>

          {loadingAttendance ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <View style={{
              backgroundColor: theme.colors.card,
              padding: 16,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#58a'
            }}>
              <Text style={{ color: theme.colors.text, marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold' }}>Status: </Text>
                {attendanceData?.status || '-'}
              </Text>
              <Text style={{ color: theme.colors.text, marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold' }}>In Time: </Text>
                {attendanceData?.clock_in || '-'}{' '}
                {attendanceData?.isLate && attendanceData.clock_in
                  ? <Text style={{ color: 'orange' }}>(Late)</Text> : null}
              </Text>
              <Text style={{ color: theme.colors.text, marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold' }}>Out Time: </Text>
                {attendanceData?.clock_out || '-'}
              </Text>
              <Text style={{ color: theme.colors.text }}>
                <Text style={{ fontWeight: 'bold' }}>Working Hours: </Text>
                {attendanceData?.working_hours ?? 0} hours
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  function formatDate(dateString) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  }
}


