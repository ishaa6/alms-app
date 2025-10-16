import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://192.168.1.8:3000/api'; // Change to your actual IP

// Generic request wrapper with token handling
const request = async (url, options = {}) => {
  try {
    const token = await AsyncStorage.getItem('token');

    const res = await fetch(API_BASE + url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      
    });

    const text = await res.text();
    let json;

    try {
      json = JSON.parse(text);
    } catch (err) {
      console.error('Non-JSON response:', text); // ← This will show HTML
      throw new Error('API returned non-JSON');
    }

    // Optional: Log for debugging
    console.log(`API Request: ${url}`, options);
    console.log(`API Response: ${url}`, json);

    return json;
  } catch (e) {
    console.error('API request error:', e);
    throw e;
  }
};

// Login function: store token
const login = async (email, password) => {
  const res = await request('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (res.token) {
    await AsyncStorage.setItem('token', res.token);
  }

  return res;
};

// Signup function: store token after successful registration
const signup = async (name, email, password, role) => {
  const res = await request('/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  });

  if (res.token) {
    await AsyncStorage.setItem('token', res.token);
  }

  return res;
};

// Logout function: clear token
const logout = async () => {
  await AsyncStorage.removeItem('token');
};


// Fetch user profile
const getUserProfile = async () => {
  return await request('/users/profile');
};

// Update user profile
const updateUserProfile = async (updatedData) => {
  return await request('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(updatedData),
  });
};


// Fetch Attendance Summary
const getAttendanceSummary = async () => {
   return await request('/annualsummary');
}

const getAttendanceByDate = async (date) => {
  return await request(`/attendance/${date}`);  
}


const saveExpoToken = async (userId, expoPushToken) => {
  return await request('/user/token', {
    method: 'POST',
    body: JSON.stringify({ userId, token: expoPushToken }),
  });
};



export default {
  // Auth
  login,
  logout,
  signup,

  // Protected APIs
  getUser: () => request('/me'),
  getLogs: () => request('/logs'),
  getPendingLeaves: () => request('/leaves/pending'),
  getManualClockIns: () => request('/manual/clockIn'),
  getScheduledLeaves: () => request('/leaves/scheduled'),
  getLeaveHistory: () => request('/leaves/history'),
  getHolidays: () => request('/leaves/holiday'),
  getLeaveLimits: () => request('/leaves/limits'),
  getLeaveTypes: () => request('/leaves/types'),
  getShiftTypes: () => request('/shift/types'),
  getUpcomingLeaves: () => request('/leaves/upcoming'),
  getWorkingDays: (companyId) => request(`/working-days/${companyId}`),
  getLateClockIns: () => request('/late-clock-ins'),
  getMonthlyLeaves: () => request('/monthly-leaves'),
  getMonthlyOverview: (month, year) => request(`/leaves/monthlyOverview?month=${month}&year=${year}`),
  clockIn: (data) => 
    request('/clock-in', { 
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },      
  }),
  clockOut: () => request('/clock-out', { method: 'POST' }),
  getStatus: () => request('/clocked-status'),
  applyLeave: (leaveType, from_date, to_date, reason) =>
    request('/leave', {
      method: 'POST',
      body: JSON.stringify({ leaveType, from_date, to_date, reason }),
    }),
  makeEntry: (shiftType, date, reason, inTime, outTime, location, ip, coordinates) =>
    request('/entry', {
      method: 'POST',
      body: JSON.stringify({ shiftType, date, reason, inTime, outTime, location, ip, coordinates }),
    }),
  handleApproval: (id, decision) =>
    request(`/leave/${id}/${decision}`, { method: 'POST' }
    ),
  approveManualClockIn: (id, status) => 
    request(`/clock-in/${id}/${status}`, {method: 'POST'}),
  checkEmailExists: (mail) => 
    request('/check-email', {
      method: 'POST',
      body: JSON.stringify({mail}),
    }),
  sendVerificationCode: (email) => 
    request('/send-verification-code', {
      method: 'POST',
      body: JSON.stringify({email}),
    }), 
  verifyCode: (email, code) => 
    request('/verify-code', {
      method: 'POST',
      body: JSON.stringify({email, code}),
    }),
  setNewPassword: (email, password) =>
    request('/set-password', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    cancelLeave: (id, leave_type, status) => 
      request('/leaves/cancel', {
        method: 'POST',
        body: JSON.stringify({id, leave_type, status})
      }),
    getUserProfile,
    updateUserProfile,
    getAttendanceSummary,
    getAttendanceByDate,
    saveExpoToken      
};


