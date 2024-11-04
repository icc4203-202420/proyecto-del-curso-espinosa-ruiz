import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './AuthContext';
import { Formik } from 'formik';
import * as yup from 'yup';
import * as SecureStore from 'expo-secure-store';

// Esquema de validación con Yup
const validationSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  username: yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Confirm password is required'),
});

function Register() {
  const navigation = useNavigation();
  const { login } = useAuth();

  const handleSubmit = async (values) => {
    try {
      const response = await fetch('http://192.168.100.107:3001/api/v1/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            handle: values.username,
            email: values.email,
            password: values.password,
            password_confirmation: values.confirmPassword,
            last_name: values.lastName,
            first_name: values.firstName,
            address_attributes: {
              line1: values.addressLine1,
              line2: values.addressLine2,
              city: values.city,
            },
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error en el registro: ${errorData.status.message}`);
      }

      const responseData = await response.json();

      if (responseData && responseData.token) {
        const token = responseData.token;
        
        // Guarda el token en SecureStore para autenticación persistente
        await SecureStore.setItemAsync('userToken', token);
        
        // Llama a la función login para actualizar el contexto de autenticación
        login(token);
        
        // Navega a la pantalla de inicio
        navigation.navigate('Home');
      } else {
        throw new Error('Token no encontrado en la respuesta');
      }
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      Alert.alert('Error', `Error al registrar el usuario: ${error.message}`);
    }
  };

  return (
    <Formik
      initialValues={{
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <Text style={styles.title}>Pleasure to meet you!</Text>
            <Text style={styles.title}>Tell me about yourself</Text>

            <TextInput
              style={styles.input}
              placeholder="First Name"
              onChangeText={handleChange('firstName')}
              onBlur={handleBlur('firstName')}
              value={values.firstName}
            />
            {errors.firstName && <Text style={styles.error}>{errors.firstName}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Last Name"
              onChangeText={handleChange('lastName')}
              onBlur={handleBlur('lastName')}
              value={values.lastName}
            />
            {errors.lastName && <Text style={styles.error}>{errors.lastName}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Email"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              keyboardType="email-address"
            />
            {errors.email && <Text style={styles.error}>{errors.email}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Username"
              onChangeText={handleChange('username')}
              onBlur={handleBlur('username')}
              value={values.username}
            />
            {errors.username && <Text style={styles.error}>{errors.username}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
            />
            {errors.password && <Text style={styles.error}>{errors.password}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              value={values.confirmPassword}
            />
            {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}

            <Text style={styles.addressInfo}>Address information (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Line 1"
              onChangeText={handleChange('addressLine1')}
              value={values.addressLine1}
            />
            <TextInput
              style={styles.input}
              placeholder="Line 2"
              onChangeText={handleChange('addressLine2')}
              value={values.addressLine2}
            />
            <TextInput
              style={styles.input}
              placeholder="City"
              onChangeText={handleChange('city')}
              value={values.city}
            />

            <Button title="Sign Up" onPress={handleSubmit} />
          </View>
        </ScrollView>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1, // Esto permite que el ScrollView ocupe todo el espacio disponible
    justifyContent: 'center',
  },
  container: {
    padding: 20,
    backgroundColor: '#FFFFDD',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Irish Grover',
  },
  input: {
    height: 50,
    borderRadius: 30,
    backgroundColor: '#73B0AB',
    padding: 15,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    paddingVertical: 15,
    backgroundColor: '#ff0077',
    color: 'white',
    borderRadius: 30,
    width: '80%',
    fontSize: 18,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  addressInfo: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 5,
    width: '100%',
  },
});

export default Register;
