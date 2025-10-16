import React, { createContext, useState } from 'react';

export const LeaveFilterContext = createContext();

export const LeaveFilterProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [leaveStatus, setLeaveStatus] = useState(null);
  const [trigger, setTrigger] = useState(0); // changes to trigger refetch

  const triggerRefetch = () => setTrigger(prev => prev + 1);

  return (
    <LeaveFilterContext.Provider value={{
      searchQuery,
      selectedDate,
      leaveStatus,
      setLeaveStatus,
      setSearchQuery,
      setSelectedDate,
      triggerRefetch,
      trigger
    }}>
      {children}
    </LeaveFilterContext.Provider>
  );
};
