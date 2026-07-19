import React, { createContext, useState } from 'react';
import axios from '../components/axioscreds';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [appointments, setAppointments] = useState(null);
  const [diagnosisForms, setDiagnosisForms] = useState(null);
  const [staffList, setStaffList] = useState(null);
  const [userList, setUserList] = useState(null);

  const getAppointments = async (force = false) => {
    if (!appointments || force) {
      const res = await axios.get('/appointment/all');
      setAppointments(res.data);
      return res.data;
    }
    return appointments;
  };

  const getDiagnosisForms = async (force = false) => {
    if (!diagnosisForms || force) {
      const res = await axios.get('/forms/all');
      setDiagnosisForms(res.data);
      return res.data;
    }
    return diagnosisForms;
  };

  const getStaffList = async (force = false) => {
    if (!staffList || force) {
      const res = await axios.get('/staff/all');
      setStaffList(res.data);
      return res.data;
    }
    return staffList;
  };

  const getUserList = async (force = false) => {
    if (!userList || force) {
      const res = await axios.get('/user/all');
      setUserList(res.data);
      return res.data;
    }
    return userList;
  };

  const invalidateAppointments = () => setAppointments(null);
  const invalidateDiagnosisForms = () => setDiagnosisForms(null);
  const invalidateStaffList = () => setStaffList(null);
  const invalidateUserList = () => setUserList(null);

  return (
    <DataContext.Provider value={{
      getAppointments,
      getDiagnosisForms,
      getStaffList,
      getUserList,
      invalidateAppointments,
      invalidateDiagnosisForms,
      invalidateStaffList,
      invalidateUserList
    }}>
      {children}
    </DataContext.Provider>
  );
};
