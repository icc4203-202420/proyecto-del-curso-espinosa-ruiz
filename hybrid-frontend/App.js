import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './components/Auth/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import BeerList from './components/Beers/BeerList';  // Importa BeerList

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="BeerList" component={BeerList} options={{ title: 'Beer List' }} />
          <Stack.Screen name="BeerDetails" component={BeerShow} options={{ title: 'Beer Details' }} />

        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
