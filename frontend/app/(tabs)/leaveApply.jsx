import React, { useContext } from 'react';
import LeaveApplyManager from '../../src/screens/LeaveApplyManager';
import LeaveApplyEmp from '../../src/screens/LeaveApplyEmp';
import { UserContext } from '../../src/context/UserContext';

export default function LeaveApply() {
  const {user} = useContext(UserContext);

  return (
    <>
      {user?.role === 'manager' ? (
        <LeaveApplyManager />
      ) : (
        <LeaveApplyEmp />
      )}
    </>
  );
}
