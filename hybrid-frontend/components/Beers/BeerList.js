import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

export default function BeerList() {
  const [search, setSearch] = useState('');
  const [beers, setBeers] = useState([]);
  const [originalBeers, setOriginalBeers] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchBeers = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken'); // Obtener el token desde SecureStore

        if (!token) {
          Alert.alert('No token found', 'Redirecting to login');
          navigation.navigate('Login'); // Redirigir al login si no hay token
          return;
        }

        const response = await fetch('http://192.168.100.107:3001/api/v1/beers', {
          headers: {
            'Authorization': `Bearer ${token}`, // Incluir el token en las cabeceras
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized');
          }
          throw new Error('Error fetching beers');
        }

        const data = await response.json();
        setBeers(data.beers);
        setOriginalBeers(data.beers);
      } catch (error) {
        console.error('Error fetching beers:', error);
        if (error.message === 'Unauthorized') {
          navigation.navigate('Login'); // Redirigir al login en caso de error 401
        }
      }
    };

    fetchBeers();
  }, [navigation]);

  const handleSearch = () => {
    if (!search.trim()) {
      setBeers(originalBeers);
      return;
    }

    const filteredBeers = originalBeers.filter(beer =>
      beer.name.toLowerCase().includes(search.toLowerCase())
    );
    setBeers(filteredBeers);

    if (filteredBeers.length === 0) {
      console.log('No beers found with that name');
    }
  };

  const renderBeer = ({ item }) => (
    <TouchableOpacity style={styles.beerItem} onPress={() => navigation.navigate('BeerDetails', { beerId: item.id })}>
      <View style={styles.beerCard}>
        <Image
          style={styles.beerImage}
          source={{ uri: item.image_url || 'https://via.placeholder.com/100' }} // Muestra imagen de la cerveza o un placeholder
        />
        <View style={styles.beerInfo}>
          <Text style={styles.beerName}>{item.name}</Text>
          <Text style={styles.beerManufacturer}>{item.manufacturer}</Text>
          <Text style={styles.beerDescription}>{item.description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Beers</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Enter a beer name"
        />
        <Button title="Search" onPress={handleSearch} />
      </View>
      <FlatList
        data={beers}
        renderItem={renderBeer}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  beerItem: {
    marginBottom: 16,
  },
  beerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  beerImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 16,
  },
  beerInfo: {
    flex: 1,
  },
  beerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  beerManufacturer: {
    fontSize: 14,
    color: 'gray',
  },
  beerDescription: {
    fontSize: 12,
    color: 'gray',
  },
});
