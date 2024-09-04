// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);



  // Aquí puedes agregar lógica para verificar la autenticación, como revisar localStorage

  const login = (token) => {
    localStorage.setItem("authToken", token); // Guarda el token en localStorage
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("authToken"); // Elimina el token de localStorage
    setIsAuthenticated(false);
  };
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};