import React, { createContext, useState, useEffect } from 'react';
import {useRouter} from 'expo-router';
import api from '../api/api';
import * as Location from 'expo-location';
import {Alert} from 'react-native';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('Clocked Out');
  const [logs, setLogs] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [scheduledLeaves, setScheduledLeaves] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [holiday, setHoliday] = useState([]);
  const [leaveLimit, setLeaveLimit] = useState(0);
  const [optionalLimit, setOptionalLimit] = useState(0);
  const [leaveTaken, setLeaveTaken] = useState(0);
  const [optionalTaken, setOptionalTaken] = useState(0);
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [shiftTypes, setShiftTypes] = useState([]);
  const [workingDays, setWorkingDays] = useState(null);
  const [lateClockIns, setLateClockIns] = useState(null);
  const [monthlyLeave, setMonthlyLeave] = useState(null);
  const [timer, setTimer] = useState(180);
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);
  const [pendingManualEntries, setPendingManualEntries] = useState([]);

  const router = useRouter();

  const fetchAllData = async (user) => {
    try {
      const promises = [
        fetchLogs(),
        fetchScheduledLeaves(),
        fetchLeaveHistory(),
        fetchHolidays(),
        fetchLeaveLimits(),
        fetchWorkingDays(user.company_id),
        fetchLateClockIns(),
        fetchMonthlyLeaves(),
        fetchShiftTypes(),
        fetchStatus(),
        fetchUpcomingLeaves(),
      ];

      // Add manager-specific data if role is manager
      if (user.role === 'manager') {
        promises.push(fetchPendingLeaves());
        promises.push(fetchManualClockIns());
      }

      await Promise.all(promises);
    } catch (err) {
      console.error("Global data refresh failed", err);
    }
  };

  const checkAuth = async () => {
    try {
      console.log("Checking login...");

      const data = await api.getUser();

      if (data?.user) {
        console.log("User authenticated:", data.user.name);
        setUser(data.user);
        await fetchAllData(data.user);  // Ensure all data is fetched after setting user
      } else {
        setUser(null);
        console.warn("No user returned from API");
      }

    } catch (e) {
      console.error('Auth check failed:', e.message || e);
      setUser(null);
    }
  };

  const getCoordinates = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required to clock in.');
      return null;
    }

    const loc = await Location.getCurrentPositionAsync({});
    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
  };

  const fetchLogs = async () => {
    const data = await api.getLogs();
    setLogs(data);
  };

  const fetchPendingLeaves = async () => {
    const data = await api.getPendingLeaves();
    setPendingLeaves(data);
  };

  const fetchUpcomingLeaves = async() => {
    const data = await api.getUpcomingLeaves();
    setUpcomingLeaves(data);
    console.log("Upcoming leaves: ", data);
  }

  const fetchScheduledLeaves = async () => {
    const data = await api.getScheduledLeaves();
    setScheduledLeaves(data);
  };

  const fetchHolidays = async () => {
    const data = await api.getHolidays();
    setHoliday(data);
  }

  const fetchLeaveHistory = async() => {
    const data = await api.getLeaveHistory();
    setLeaveHistory(data);
  }

  const fetchStatus = async () => {
    const data = await api.getStatus();
    setStatus(data.status);
  }

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

  const clockIn = async () => {
  try {
    const ip = await getPublicIP();
    console.log("IP: ", ip);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required to clock in.');
      return;
    }

    const coords = await getCoordinates();
    const { latitude, longitude } = coords;

    console.log("Coordinates: ", latitude, ',', longitude);

    await api.clockIn({latitude, longitude, ip});
    setStatus('Clocked In');
    fetchLogs();
    } catch (error) {
      console.error('Clock-in failed:', error);
      Alert.alert('Error', 'Failed to clock in.');
    } 
  };

  const clockOut = async () => {
    await api.clockOut();
    setStatus('Clocked Out');
    fetchLogs();
  };

  const applyLeave = async (leaveType, fromDate, toDate, reason) => {
    try{
      const res = await api.applyLeave(leaveType, fromDate, toDate, reason);
      fetchScheduledLeaves();
      console.log(res);
      return res;
    } catch(err){
      console.log(err);
    }
  };

  const makeEntry = async (shiftType, date, reason, inTime, outTime, location, ip, coordinates) => {
    return await api.makeEntry(shiftType, date, reason, inTime, outTime, location, ip, coordinates);
  };

  const handleApproval = async (id, decision) => {
    await api.handleApproval(id, decision);
    fetchPendingLeaves();
    fetchLogs();
    console.log('Approval Status:', decision);
  };

  const fetchLeaveLimits = async () => {
    try {
      const data = await api.getLeaveLimits();
      console.log('Leave limit data:', data);

      setLeaveLimit(data.allowedHolidays);
      setOptionalLimit(data.optionalLimit);
      setLeaveTaken(data.holidaysTaken);
      setOptionalTaken(data.optionalTaken);
      setLeaveBalance(data.leaveBalance);
    } catch (err) {
      console.error('Error in fetchLeaveLimits:', err.message || err);
    }
  };
    
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        if (!user) return; // <-- wait until user is authenticated

        const data = await api.getLeaveTypes(); // requires token
        const mapped = data.map(type => ({
          ...type,
          disabled: type.value === 'optional' && optionalTaken >= optionalLimit,
          color: type.value === 'optional' && optionalTaken >= optionalLimit ? 'gray' : 'black',
        }));
        setLeaveTypes(mapped);
      } catch (err) {
        console.error('Failed to fetch leave types:', err);
      }
    };

    fetchLeaveTypes();
  }, [user, optionalTaken, optionalLimit]);

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        if (!user) return; // <-- wait until user is authenticated

        const data = await api.getLeaveTypes(); // requires token
        const mapped = data.map(type => ({
          ...type,
          disabled: type.value === 'optional' && optionalTaken >= optionalLimit,
          color: type.value === 'optional' && optionalTaken >= optionalLimit ? 'gray' : 'black',
        }));
        setLeaveTypes(mapped);
      } catch (err) {
        console.error('Failed to fetch leave types:', err);
      }
    };

    fetchLeaveTypes();
  }, [user, optionalTaken, optionalLimit]);

  const fetchShiftTypes = async() => {
    try {
      const data = await api.getShiftTypes();
      setShiftTypes(data);
    } catch (err) {
      console.error('Error fetching shift types');
    }
  }

  const fetchWorkingDays = async (companyId) => {
    try {
      const data = await api.getWorkingDays(companyId);
      setWorkingDays(data);
    } catch (err) {     
      console.error('Error fetching working days:', err.message || err);
    }
  };

  const fetchLateClockIns = async () => {
    try {
      const data = await api.getLateClockIns();
      setLateClockIns(data);
    } catch (err) {
      console.error('Error fetching late clock-ins:', err.message || err);
    }
  };

  const fetchMonthlyLeaves = async () => {
    try {
      const data = await api.getMonthlyLeaves();
      setMonthlyLeave(data);
    } catch (err) {
      console.error('Error fetching monthly leaves:', err.message || err);
    }
  };  

  const logout = async () => {
    await api.logout(); // clears token from AsyncStorage
    setUser(null);      // clear user state
    router.replace('/'); 
  };

  const verifyMail = async(mail) => {
    const res = await api.checkEmailExists(mail);
    return res;
  };

  const sendVerificationCode = async(mail) => {
    const res = await api.sendVerificationCode(mail);
    if(res?.expiresAt){
      const remainingTime = Math.floor((res.expiresAt-Date.now())/1000);
      console.log('Remaining time: ', Math.floor((res.expiresAt-Date.now())/1000));
      setTimer(remainingTime);
    }
    return res;
  }  

  const verifyCode = async(mail, code) => {
    return await api.verifyCode(mail, code);
  }   
  
  const setNewPassword = async(mail, password) => {
    return await api.setNewPassword(mail, password);
  }

  const cancelLeave = async (leave) => {
    try {
      const res = await api.cancelLeave(leave.id, leave.leave_type, leave.status);
      fetchScheduledLeaves();
    } catch (err) {
      console.error('Cancel leave error:', err);
      throw err;
    }
  };

  const fetchManualClockIns = async () => {
    try {
      const res = await api.getManualClockIns();
      setPendingManualEntries(res);
      console.log("Manual Entries: ", res);
      fetchLogs();
    } catch (err) {
      console.error(err);
    }
  };

  // approve or reject a request
  const approveManualClockIn = async (id, status) => {
    try {
      await api.approveManualClockIn(id, status);
      fetchLogs();
      fetchManualClockIns();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,  
        status,
        logs,
        pendingLeaves,
        checkAuth,
        clockIn,
        clockOut,
        applyLeave,
        handleApproval,
        pendingManualEntries,
        approveManualClockIn,
        logout,
        scheduledLeaves,
        leaveHistory,
        holiday,
        leaveLimit,
        leaveTaken,
        optionalLimit,
        optionalTaken,
        leaveBalance,
        leaveTypes,
        shiftTypes,
        workingDays,
        lateClockIns,
        monthlyLeave,
        makeEntry,
        verifyMail,
        sendVerificationCode,
        verifyCode,
        setNewPassword,
        timer,
        setTimer,
        upcomingLeaves,
        cancelLeave,
        fetchAllData
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
