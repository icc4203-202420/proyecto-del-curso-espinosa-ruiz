import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Navbar = () => {
  return (
    <View style={styles.container}>
      <Icon name="home" size={30} color="#73B0AB" />
      <Icon name="beer" size={30} color="#73B0AB" />
      <Icon name="user" size={30} color="#73B0AB" />
      <Icon name="glass" size={30} color="#73B0AB" />
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