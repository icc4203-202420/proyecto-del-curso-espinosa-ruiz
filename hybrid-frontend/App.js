import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { AuthProvider, AuthContext, useAuth } from './components/Auth/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import BeerList from './components/Beers/BeerList';
import BeerShow from './components/Beers/BeerShow';
import Navbar from './components/Navbar';
import Home from './components/Home';
import UserSearch from './components/Users/UserSearch';
import BarList from './components/Bars/BarList';
import BarEvents from './components/Bars/BarEvents';
import EventsShow from './components/Events/EventsShow';
import EventPicture from './components/Events/EventsPIcture'; 
import Feed from './components/Feed';

const Stack = createStackNavigator();

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#73B0AB" />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName="Login">
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Home" component={Home} options={{ title: 'Home' }} />
          <Stack.Screen name="BeerList" component={BeerList} options={{ title: 'Beer List' }} />
          <Stack.Screen name="BeerDetails" component={BeerShow} options={{ title: 'Beer Details' }} />
          <Stack.Screen name="UserSearch" component={UserSearch} options={{ title: 'UserProfile' }} />
          <Stack.Screen name="BarList" component={BarList} options={{ title: 'Bars' }} />
          <Stack.Screen name="BarEvents" component={BarEvents} options={{ title: 'Bar Events' }} />
          <Stack.Screen name="EventsShow" component={EventsShow} options={{ title: 'Event Details' }} />
          <Stack.Screen name="EventPicture" component={EventPicture} options={{ title: 'Add Event Picture' }} />
          <Stack.Screen name="Feed" component={Feed} options={{ title: 'Feed' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={Register} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
});
