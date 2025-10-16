import { Ionicons } from '@expo/vector-icons';
import { useState, useContext } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../context/ThemeContext';

import ApproveLeave from './Leave/ApproveLeave';
import History from './Leave/History';
import LeaveForm from './Leave/LeaveForm';
;


const ManagerLeaveScreen = () => {
  const { theme } = useContext(ThemeContext);
  const [mode, setMode] = useState('Apply');
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [details, setDetails] = useState('');

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
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>

      <TouchableOpacity className="flex-row items-center p-4 mb-3 w-1/2 rounded-xl ml-3"
                style={{backgroundColor: theme.colors.primary}}
                onPress={() => setShowLeaveForm(true)}
                >
                <Ionicons name="add-circle" size={25} color={theme.colors.text} />
                <Text className="ml-2 text-xl"
                    style={{color: theme.colors.text}}
                >Apply Leave</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', backgroundColor: theme.colors.card, borderRadius: 20, margin: 16 }}>
        {['Apply', 'Approve'].map(item => (
          <TouchableOpacity
            key={item}
            onPress={() => setMode(item)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 20,
              backgroundColor: mode === item ? theme.colors.primary : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: mode === item ? theme.colors.text : theme.colors.secondary }}>
              {item === 'Apply' ? 'Leave History' : 'Approve Leave'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {mode === 'Apply' ? (
          <History/>
        ) : (
          <ApproveLeave/>
        )}
      </View>

      <Modal
        visible={showLeaveForm}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLeaveForm(false)}
      >
        <View className="flex-1 justify-center items-center" 
          style={{backgroundColor: theme.colors.overlay }}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setShowLeaveForm(false)}
              style={{ alignSelf: 'flex-end', padding: 4 }}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text 
              className = 'font-pbold mb-12'
              style = {{color: theme.colors.text}}
              >Apply Leave
            </Text>
            <LeaveForm 
            setShowLeaveForm={setShowLeaveForm}
            setShowSuccessModal={setShowSuccessModal}
            setShowErrorModal={setShowErrorModal}
            setErrorMessage={setErrorMessage}
            setDetails={setDetails}
            />
          </View>
        </View>
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
          <Text style={{ fontSize: 18, color: theme.colors.text, marginVertical: 16, textAlign: 'center' }}>
            Leave Applied Successfully
          </Text>
          <Text style={{ color: theme.colors.text, marginBottom: 12, textAlign: 'center' }}>
            {details}
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
      visible={showErrorModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowErrorModal(false)}
    >
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: theme.colors.overlay }}>
        <View style={{
          backgroundColor: theme.colors.background,
          padding: 24,
          borderRadius: 12,
          alignItems: 'center',
          width: '80%',
        }}>
          <Ionicons name="close-circle" size={64} color="red" />
          <Text style={{ fontSize: 18, color: theme.colors.text, marginVertical: 16, textAlign: 'center' }}>
            Application Failed
          </Text>
          <Text style={{ color: theme.colors.text, marginBottom: 12, textAlign: 'center' }}>
            {errorMessage}
          </Text>
          <Text style={{ color: theme.colors.text, marginBottom: 12, textAlign: 'center' }}>
            {details}
          </Text>
          <TouchableOpacity
            onPress={() => setShowErrorModal(false)}
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
    </SafeAreaView>
  );
}

export default ManagerLeaveScreen;