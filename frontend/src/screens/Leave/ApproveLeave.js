import { Ionicons } from '@expo/vector-icons';
import { useContext, useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LeaveFilterContext } from '../../context/FilterContext';
import { UserContext } from '../../context/UserContext';
import { ThemeContext } from '../../context/ThemeContext';

const statusColors = {
  Pending: '#A0A0A0',
  Approved: '#4CAF50',
};

const statusIcons = {
  Pending: 'time-outline',
  Approved: 'checkmark-circle-outline',
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const ApproveLeave = () => {
  const insets = useSafeAreaInsets();
  const {pendingLeaves, handleApproval, leaveTypes, leaveBalance} = useContext(UserContext);
  const [selectedLeave, setSelectedLeave] = useState(null);
  
  const { searchQuery, setSearchQuery, leaveStatus, setLeaveStatus, triggerRefetch, trigger } = useContext(LeaveFilterContext);
  const [filteredLeaves, setFilteredLeaves] = useState([]);

  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);

  const toggleSelection = (value, list, setter) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
    } else {
      setter([...list, value]);
    }
  };

  const LeaveCard = ({ item, onPress }) => (
  <TouchableOpacity onPress={() => onPress(item)}>
    <View style={styles.card}>
      <View style={styles.avatarContainer}>
        <Ionicons name="person-circle-outline" size={40} color="#fff" />
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{item.user_name}</Text>
        <Text style={styles.empId}>{item.user_id}</Text>
      </View>
      <View style={styles.statusContainer}>
        <Ionicons name={statusIcons[item.status]} size={18} color={statusColors[item.status]} />
        <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
          {item.status}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

  useEffect(() => {
  const filtered = pendingLeaves.filter((emp) => {
    const nameMatch = (emp.user_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const idMatch = (emp.id?.toString() || '').includes(searchQuery);
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(emp.leave_type);

    return (nameMatch || idMatch) && typeMatch;
  });

  setFilteredLeaves(filtered);
}, [pendingLeaves, searchQuery, leaveStatus, trigger, selectedTypes]);



  const closeModal = () => setSelectedLeave(null);
  const { theme } = useContext(ThemeContext);

  const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  avatarContainer: {
    marginRight: 16,
  },
  detailsContainer: {
    flex: 1,
  },
  name: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  empId: {
    color: theme.colors.text,
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    marginLeft: 5,
    fontSize: 13,
    fontWeight: '500',
  },
});

  return (
    <>
      <View className="flex-row items-center rounded-xl px-3 mb-4"
                      style={{borderColor: theme.colors.text, borderWidth: 1}}
      >
        <TouchableOpacity
          onPress={() => {triggerRefetch()}}
        >
          <Ionicons name="search" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <TextInput
          placeholder='employee name or ID'
          placeholderTextColor={theme.colors.secondary}
          style={{ flex: 1, color: 'white', paddingHorizontal: 8 }}
          className='mb-2'
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={() => setFilterVisible(true)}>
          <Ionicons name="filter" size={20} 
          color={selectedTypes.length > 0 ? theme.colors.primary : theme.colors.text} />
        </TouchableOpacity>

      </View>

        <FlatList
        data={filteredLeaves}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LeaveCard item={item} onPress={setSelectedLeave} />}
        contentContainerStyle={{paddingBottom: insets.bottom + 80}}
        ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20, color: theme.colors.text}}>No pending leaves</Text>}
        />

        <Modal
        visible={!!selectedLeave}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
        > 
        <View className="flex-1 justify-center items-center">
          <View className="p-6 rounded-xl w-[90%] relative"
            style={{backgroundColor: theme.colors.card}}
          >
            <Text className="text-2xl font-pbold mb-5"
              style={{color: theme.colors.text}}
            >Leave Details</Text>
            <View className="space-y-2">
              <Text className="text-base mb-2 text-lg"
                style={{color: theme.colors.text}}
              >
                <Text className="font-semibold"
                  style={{color: theme.colors.primary}}
                >Employee:</Text> {selectedLeave?.user_name}
              </Text>
              <Text className="text-base mb-2 text-lg"
                style={{color: theme.colors.text}}
              >
                <Text className="font-semibold"
                  style={{color: theme.colors.primary}}
                >Emp ID:</Text> {selectedLeave?.id}
              </Text>
              <Text className="text-base mb-2 text-lg"
                style={{color: theme.colors.text}}
              >
                <Text className="font-semibold"
                  style={{color: theme.colors.primary}}
                >Type:</Text> {selectedLeave?.leave_type}
              </Text>
              <Text className="text-base mb-2 text-lg"
                style={{color: theme.colors.text}}
              >
                <Text className="font-semibold"
                  style={{color: theme.colors.primary}}
                >From:</Text> {formatDate(selectedLeave?.from_date)}
              </Text>
              <Text className="text-base mb-2 text-lg"
                style={{color: theme.colors.text}}
              >
                <Text className="font-semibold"
                  style={{color: theme.colors.primary}}
                >To:</Text> {formatDate(selectedLeave?.to_date)}
              </Text>
              <Text className="text-base mb-2 text-lg"
                style={{color: theme.colors.text}}
              >
                <Text className="font-semibold"
                  style={{color: theme.colors.primary}}
                >Reason:</Text> {selectedLeave?.reason}
              </Text>
              <Text className="text-base mb-2 text-lg"
                style={{color: theme.colors.text}}
              >
                <Text className="font-semibold"
                  style={{color: theme.colors.primary}}
                >Leave Balance:</Text> {leaveBalance}
              </Text>                          
            </View>

            <View className="flex-row justify-between mt-4 space-x-2">
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => {handleApproval(selectedLeave.id, 'Rejected');
                closeModal();}
                } className="flex-1 bg-red-600 p-3 rounded-lg"
              >
                <Text className="text-white text-center font-semibold">Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => {handleApproval(selectedLeave.id, 'Approved');
                  closeModal();}
                } className="flex-1 bg-green-600 p-3 rounded-lg"
              >
                <Text className="text-white text-center font-semibold">Approve</Text>
              </TouchableOpacity>
            </View>

            <Pressable onPress={closeModal} className="absolute top-3 right-3">
              <Ionicons name="close" size={24} color="#fff" />
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={filterVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterVisible(false)}
      >
        <View className="flex-1 justify-end"
          style={{backgroundColor: theme.colors.overlay}}
        >
          <View className="rounded-t-2xl p-6">
            <Text className="text-lg font-bold mb-4 "
              style={{color: theme.colors.text}}
            >Filter By</Text>

            {/* Leave Type Section */}
            <Text className="font-semibold mt-4 mb-2"
              style={{color: theme.colors.text}}
            >Leave Type</Text>
            {leaveTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                onPress={() => toggleSelection(type.value, selectedTypes, setSelectedTypes)}
                className="flex-row items-center mb-2"
              >
                <Ionicons
                  name={selectedTypes.includes(type.value) ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={theme.colors.primary}
                />
                <Text className="ml-2" style={{color: theme.colors.text}}>{type.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className="py-3 mt-6 rounded-xl w-1/2"
              onPress={() => setFilterVisible(false)}
              style={{backgroundColor: theme.colors.primary}}
            >
              <Text className="text-center" style={{color: theme.colors.text}}>APPLY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </>
  );
};

export default ApproveLeave;