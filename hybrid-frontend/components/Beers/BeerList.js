import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import config from '../config';

export default function BeerList() {
  const [search, setSearch] = useState('');
  const [beers, setBeers] = useState([]);
  const [originalBeers, setOriginalBeers] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchBeers = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken'); 

        if (!token) {
          Alert.alert('No token found', 'Redirecting to login');
          navigation.navigate('Login');
          return;
        }

        const response = await fetch(`${config.apiBaseUrl}/api/v1/beers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
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
          navigation.navigate('Login');
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
    <TouchableOpacity
      style={styles.beerItem}
      onPress={() => navigation.navigate('BeerDetails', { beerId: item.id })}
    >
      <View style={styles.beerCard}>
        <Image
          style={styles.beerImage}
          source={{ uri: item.image_url || 'https://via.placeholder.com/100' }}
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
      <Text style={styles.title}>Beer List</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Enter a beer name"
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
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
    backgroundColor: '#FFFFDD',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Comic Sans MS',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 25,
    backgroundColor: '#006A71',
    color: '#FFF', // Texto blanco para el input
    paddingHorizontal: 15,
  },
  searchButton: {
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ff0077',
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  beerItem: {
    marginBottom: 16,
  },
  beerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#73B0AB',
    padding: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  beerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  beerInfo: {
    flex: 1,
  },
  beerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF', // Texto blanco para destacar
  },
  beerManufacturer: {
    fontSize: 14,
    color: '#E0F4F4', // Texto en tono claro para contraste
  },
  beerDescription: {
    fontSize: 12,
    color: '#E0F4F4',
  },
});
 