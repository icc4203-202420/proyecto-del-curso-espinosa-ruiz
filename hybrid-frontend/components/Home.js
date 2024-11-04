import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';

const Home = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Home Screen!</Text>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('BeerList')}
        >
          <Text style={styles.buttonText}>Go to Beer List</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('UserSearch')}
        >
          <Text style={styles.buttonText}>Go to User Profile</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('BarList')}
        >
          <Text style={styles.buttonText}>Go to Bars</Text>
        </TouchableOpacity>
        </View>
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

export default Home;