import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

// Crear el contexto de autenticación
const AuthContext = createContext(null);

// Hook personalizado para usar el contexto de autenticación
export function useAuth() {
  return useContext(AuthContext);
}

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Función para cargar el token desde SecureStore al iniciar la aplicación
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('userToken');
        if (storedToken) {
          setToken(storedToken);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading token from SecureStore', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  // Función de inicio de sesión
  const login = async (userToken) => {
    try {
      await SecureStore.setItemAsync('userToken', userToken); // Almacena el token en SecureStore
      setToken(userToken);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error saving token to SecureStore', error);
    }
  };

  // Función de cierre de sesión
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken'); // Elimina el token de SecureStore
      setToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error removing token from SecureStore', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
