import React, { createContext, useState, useEffect } from 'react';
import axios from '../components/axioscreds';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/auth/check');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const update = async () => {
    await fetchUser();
  };

  const permission = user?.permission || '';
  
  return (
    <AuthContext.Provider value={{ user, permission, update }}>
      {children}
    </AuthContext.Provider>
  );
};