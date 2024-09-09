// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Al cargar la aplicación, verificamos si hay un token en localStorage
  useEffect(() => {
    const token = localStorage.getItem('jwtToken'); // Usa la misma clave en toda la app
    if (token) {
      setIsAuthenticated(true); // Si hay token, el usuario está autenticado
    } else {
      setIsAuthenticated(false); // Si no hay token, el usuario no está autenticado
    }
  }, []); // Esto se ejecuta solo una vez al cargar el componente

  const login = (token) => {
    localStorage.setItem("jwtToken", token); // Guarda el token en localStorage
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("jwtToken"); // Elimina el token de localStorage
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
