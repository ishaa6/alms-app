import CustomButton from '@/components/CustomButton';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View, Modal, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard  } from 'react-native';
import { SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../../src/context/UserContext';
import {ThemeContext} from '../../src/context/ThemeContext';
import { router } from 'expo-router';

import WelcomeUser from '../../src/components/WelcomeUser';
import ClockInForm from '../../src/components/ClockInForm';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export default function HomePage() {
  const insets = useSafeAreaInsets();
  const { theme, mode } = useContext(ThemeContext);
  const { clockIn, clockOut, status, workingDays, lateClockIns, monthlyLeave, upcomingLeaves, user } = useContext(UserContext);
  const [now, setNow] = useState(new Date());
  const [manualClockInVisible, setManualClockInVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { pendingManualEntries, approveManualClockIn } = useContext(UserContext);
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const styles = StyleSheet.create({
    modalContent: {
      width: '90%',
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 16,
      maxHeight: '90%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 10
    }
  });

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000); 
    return () => clearInterval(interval);
  }, []);
  const dateString = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeString = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <SafeAreaView className='flex-1' style={{backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}>
        <View className="px-4 pt-4 rounded-xl" style={{ backgroundColor: theme.colors.secondary }}>
          <View className="flex-row items-center">
            <FontAwesome name="user-circle-o" className="mr-4" size={50} color={theme.colors.text} />
            <WelcomeUser />
          </View>
        </View>
        
        <View className="items-end mt-2">
          <Ionicons name="notifications-outline" size={28} color={theme.colors.text} />
        </View>

        <View>
          <View className='mx-4 my-4 p-4 rounded-2xl items-center shadow-lg'
            style={{ backgroundColor: theme.colors.primary }}>
            <View className='flex-row justify-between w-full'>
              <View className='flex-row items-center'>
                <MaterialIcons name="calendar-today" className="mr-2" size={30} color={theme.colors.text} />
                <Text style={{color:theme.colors.text}}>{dateString}</Text>
              </View>
              <View className='bg-black px-3 py-1 rounded-md'>
                <Text className='text-green-400 font-semibold'>{status}</Text>
              </View>
            </View>

          <View className='flex-row items-center mt-2 w-full mb-4'>
            <Ionicons name="time-outline" className='mr-2' size={30} color={theme.colors.text} />
            <Text className='text-lg' style={{color:theme.colors.text}}>{timeString}</Text>
          </View>

          <View className='flex-row items-center justify-between mt-4'>
            <CustomButton
              title={status === "Clocked Out" ? "Clock In" : "Clock Out"}
              handlePress={() => {
                if (status === "Clocked Out") {
                  clockIn();
                } else {
                  clockOut();
                }
              }}
              containerStyles='w-1/2 rounded-full mt-2 self-center min-h-[50px]'
              textStyles='font-bold leading-none'
              butColor = {theme.colors.text}
              textColor = {theme.colors.primary}
            />
            <TouchableOpacity onPress={() => setManualClockInVisible(true)} className="ml-2">
              <Ionicons name="create-outline" size={30} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

        </View>
        </View>

        {user?.role === 'manager' && (
            <CustomButton
              title='Approve Clock-In'
              handlePress={() => setManualModalVisible(true)}
              containerStyles='mt-2 self-center px-4 bg-white rounded-full py-1 mb-3'
              textStyles='font-semibold'
            />
      )}

        {/* Upcoming Leaves */}
        <View className='px-4'>
          <Text className='text-lg font-semibold mb-2' style={{color:theme.colors.text}}>Upcoming Leaves</Text>
          
          {upcomingLeaves.length === 0 ? (
            <Text style={{color:theme.colors.secondary}}>No upcoming leaves</Text>
          ) : (
            upcomingLeaves.map((leave, index) => (
              <View key={index} className='bg-gray-200 p-3 rounded-lg mb-2' style={{backgroundColor: theme.colors.text}}>
                <Text style={{color:theme.colors.tertiary}}>
                  {new Date(leave.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
                <Text style={{color:theme.colors.primary}}>{leave.title}</Text>
              </View>
            ))
          )}

          <CustomButton
            title='View Attendance'
            handlePress={() => router.push('/screens/AttendanceScreen')}
            containerStyles='mt-2 self-center px-4 bg-white rounded-full py-1'
            textStyles='font-semibold'
          />
        </View>

        {/* Monthly Summary */}
        <View className='mt-4 px-4'>
          <Text className='text-lg font-semibold mb-2'
            style={{color: theme.colors.text}}
          >Monthly Summary</Text>
          <View className="flex-row gap-x-4 mt-2">
            <View className="flex-1 items-center py-2 rounded-xl"
              style={{ backgroundColor: theme.colors.card }}>
              <Text className="font-bold text-lg" style={{ color: theme.colors.primary }}>{workingDays}</Text>
              <Text style={{ color: theme.colors.text }}>working</Text>
              <Text style={{ color: theme.colors.text }}>days</Text>
            </View>
            <View className="flex-1 items-center py-2 rounded-xl"
              style={{ backgroundColor: theme.colors.card }}>
              <Text className="font-bold text-lg" style={{ color: theme.colors.primary }}>{monthlyLeave}</Text>
              <Text style={{ color: theme.colors.text }}>leaves</Text>
            </View>
            <View className="flex-1 items-center py-2 rounded-xl"
              style={{ backgroundColor: theme.colors.card }}>
              <Text className="font-bold text-lg" style={{ color: theme.colors.primary }}>{lateClockIns}</Text>
              <Text style={{ color: theme.colors.text }}>late</Text>
              <Text style={{ color: theme.colors.text }}>clock-ins</Text>
            </View>
          </View>
        </View>

        <Modal
          visible={manualClockInVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setManualClockInVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
              >
                <ScrollView
                  contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    padding: 16,
                  }}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={{
                    backgroundColor: theme.colors.background,
                    borderRadius: 12,
                    padding: 16,
                    elevation: 4,
                  }}>
                    {/* Modal content */}
                    <TouchableOpacity
                      onPress={() => setManualClockInVisible(false)}
                      style={{ alignSelf: 'flex-end' }}
                    >
                      <Text style={{ color: theme.colors.text }}>✕</Text>
                    </TouchableOpacity>

                    <ClockInForm
                      setManualClockInVisible={setManualClockInVisible}
                      setShowSuccessModal={setShowSuccessModal}
                      showSuccessModal={showSuccessModal}
                    />
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

               
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
        >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: theme.colors.overlay }}>
          <View style={{
            backgroundColor: theme.colors.background,
            padding: 24,
            borderRadius: 12,
            alignItems: 'center',
            width: '80%',
          }}>
            <Ionicons name="checkmark-circle" size={64} color="limegreen" />
            <Text style={{ fontSize: 18, color: theme.colors.text, marginVertical: 16 }}>
              Entry Request Made
            </Text>
            <TouchableOpacity
              onPress={() => setShowSuccessModal(false)}
              style={{
                backgroundColor: theme.colors.primary,
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: theme.colors.text }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={manualModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setManualModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white w-[90%] p-4 rounded-xl" 
            style={{ 
              backgroundColor: 'white', 
              borderRadius: 10, 
              padding: 20, 
              width: '90%', 
              maxHeight: '80%'  // <-- Important to prevent overflow
            }}>
            <Text className="text-lg font-bold mb-4 text-black">Pending Clock-In Requests</Text>

            {pendingManualEntries.length === 0 ? (
              <Text>No pending entries</Text>
            ) : (
              <ScrollView style={{ maxHeight: '80%' }}>
                {pendingManualEntries.map((entry) => (
                  <TouchableOpacity
                    key={entry.id}
                    onPress={() => setSelectedEntry(entry)}
                    className="mb-3 bg-gray-200 p-3 rounded-lg"
                  >
                    <Text className="text-black font-semibold">{entry.user_name}</Text>
                    <Text>{entry.user_id}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              onPress={() => setManualModalVisible(false)}
              className="mt-4 bg-red-500 py-2 rounded-lg"
            >
              <Text className="text-white text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!selectedEntry}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedEntry(null)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white p-5 rounded-lg w-[90%]">

            <TouchableOpacity
              className="absolute top-3 right-3"
              onPress={() => setSelectedEntry(null)}
            >
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>×</Text>
            </TouchableOpacity>

            <Text className="text-xl font-bold mb-4">Clock-In Request</Text>

            <Text><Text className="font-semibold">Employee:</Text> {selectedEntry?.user_name}</Text>
            <Text><Text className="font-semibold">Date:</Text> {formatDate(selectedEntry?.date)}</Text>
            <Text><Text className="font-semibold">Clock-In:</Text> {selectedEntry?.clock_in}</Text>
            <Text><Text className="font-semibold">Clock-Out:</Text> {selectedEntry?.clock_out}</Text>
            <Text><Text className="font-semibold">Reason:</Text> {selectedEntry?.reason}</Text>
            <Text><Text className="font-semibold">Location:</Text> {selectedEntry?.location}</Text>

            <View className="flex-row justify-between mt-5 space-x-2">
              <TouchableOpacity
                className="bg-red-600 flex-1 p-3 rounded-lg"
                onPress={() => {
                  approveManualClockIn(selectedEntry.id, 'Rejected');
                  setSelectedEntry(null);
                }}
              >
                <Text className="text-white text-center">Reject</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-green-600 flex-1 p-3 rounded-lg"
                onPress={() => {
                  approveManualClockIn(selectedEntry.id, 'Approved');
                  setSelectedEntry(null);
                }}
              >
                <Text className="text-white text-center">Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

        <StatusBar style={mode}/>
      </ScrollView>
    </SafeAreaView>
  );
}
