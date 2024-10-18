import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Para la navegación
import { useAuth } from './AuthContext'; // Suponiendo que tu contexto de autenticación sigue igual
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation(); // Para la navegación en React Native
  const { login } = useAuth();

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${config.BaseIP}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            email: email,
            password: password,
          }
        }),
      });
  
      if (!response.ok) {
        throw new Error('Error en el inicio de sesión');
      }
  
      const data = await response.json();
      console.log('Inicio de sesión exitoso. Datos de respuesta:', data);
      await AsyncStorage.setItem('jwtToken', data.status.token);
      const token = data.status.token;
      if (token) {
        // Puedes usar AsyncStorage en lugar de localStorage para persistencia en React Native
        login(token);
        navigation.navigate('Home'); // Navega a la pantalla de inicio
      } else {
        throw new Error('Token no encontrado en la respuesta');
      }
  
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      Alert.alert('Error', 'Error al iniciar sesión');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <View style={styles.inputContainer}>
        <Text>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text>Password:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>
      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      backgroundColor: '#FFFFDD', // Color de fondo del contenedor principal
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
      fontFamily: 'Comic Sans MS', // Fuente personalizada, aunque en React Native debes asegurarte de tenerla disponible
    },
    inputContainer: {
      marginBottom: 15,
      width: '100%',
    },
    input: {
      height: 50,
      padding: 15,
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 30,
      backgroundColor: '#73B0AB', 
      color: '#fff',
      fontSize: 16,
      textAlign: 'center',
    },
    button: {
      paddingVertical: 15,
      backgroundColor: '#ff0077',
      borderRadius: 30,
      width: '80%',
      alignSelf: 'center',
      marginTop: 20,
    },
    buttonText: {
      color: 'white',
      fontSize: 18,
      textAlign: 'center',
    },
    link: {
      marginTop: 20,
      color: '#ff0077',
      fontSize: 14,
      textAlign: 'center',
    },
  });
  

export default Login;
