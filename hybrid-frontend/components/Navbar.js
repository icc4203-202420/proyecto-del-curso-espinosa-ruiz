import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const Navbar = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Icon name="home" size={30} color="#73B0AB" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('BeerList')}>
        <Icon name="beer" size={30} color="#73B0AB" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('UserSearch')}>
        <Icon name="user" size={30} color="#73B0AB" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('BarList')}>
        <Icon name="glass" size={30} color="#73B0AB" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Feed')}>
        <Icon name="comments" size={30} color="#73B0AB" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
});

export default Navbar;
