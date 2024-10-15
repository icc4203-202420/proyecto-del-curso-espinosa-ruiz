import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, AuthContext, useAuth } from './components/Auth/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import BeerList from './components/Beers/BeerList';  // Importa BeerList
import BeerShow from './components/Beers/BeerShow';  // Importa BeerShow
// import Navbar from './components/compo-assets.js/navbar';
import Home from './components/Home'; 

const Stack = createStackNavigator();

export default function App() {
  const isAuthenticated  = useAuth();

  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={Home} options={{title: 'Home'}}/>
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="BeerList" component={BeerList} options={{ title: 'Beer List' }} />
          <Stack.Screen name="BeerDetails" component={BeerShow} options={{ title: 'Beer Details' }} />

        </Stack.Navigator>
      </NavigationContainer>
      {/* {isAuthenticated && <Navbar />}  */}
    </AuthProvider>
  );
}
