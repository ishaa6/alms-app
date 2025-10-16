// src/components/RefreshWrapper.js
import React, { useContext, useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { UserContext } from '../context/UserContext';

const RefreshWrapper = ({ children }) => {
  const { checkAuth } = useContext(UserContext);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await checkAuth(); // Triggers fetchAllData internally
    setRefreshing(false);
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {children}
    </ScrollView>
  );
};

export default RefreshWrapper;
