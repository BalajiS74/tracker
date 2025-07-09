import React, { createContext, useState } from 'react';

// Create the context
export const AuthContext = createContext();

// AuthProvider wraps your entire app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);  // holds user object or null

  const login = (userData) => {
    setUser(userData); // example: { name, email, token }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
