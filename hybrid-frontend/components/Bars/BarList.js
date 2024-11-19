import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import config from '../config';

export default function BarList({ navigation }) {
  const [bars, setBars] = useState([]);
  const [search, setSearch] = useState('');
  const [originalBars, setOriginalBars] = useState([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const fetchBars = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) {
          Alert.alert('Error', 'No token found');
          return;
        }

        const response = await fetch(`${config.apiBaseUrl}/api/v1/bars`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized');
          }
          throw new Error('Error fetching bars');
        }

        const data = await response.json();
        if (data && data.bars) {
          setBars(data.bars);
          setOriginalBars(data.bars);
        } else {
          setBars([]);
        }
      } catch (error) {
        console.error('Error fetching bars:', error);
        setBars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBars();
  }, []);

  const handleSearch = () => {
    if (!search.trim()) {
      setBars(originalBars);
      return;
    }

    const filteredBars = originalBars.filter(bar =>
      bar.name.toLowerCase().includes(search.toLowerCase())
    );
    setBars(filteredBars);
  };

  const handleCheckIn = async (bar) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error('No token found');

      const response = await fetch(`${config.apiBaseUrl}/api/v1/bars/${bar.id}/checkin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: currentUser.id }),
      });

      if (response.ok) {
        const data = await response.json();
        notifyFriends(data.eventId);
      } else {
        console.error('Error checking in:', response.statusText);
      }
    } catch (error) {
      console.error('Error during check-in:', error);
    }
  };

  const notifyFriends = async (eventId) => {
    const message = {
      to: friendExpoPushToken,
      sound: 'default',
      title: 'Friend Check-In',
      body: `Your friend has checked into an event!`,
      data: { screen: 'EventDetails', eventId },
    };

    await fetch(`${config.apiBaseUrl}/api/v2/push/send`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bars</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Enter a bar name"
        />
        <Button title="Search" onPress={handleSearch} />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={bars}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.barCard} onPress={() => handleCheckIn(item)}>
              <View style={styles.barInfo}>
                <Text style={styles.barName}>{item.name}</Text>
                <Text style={styles.barLocation}>{item.location || 'Location not available'}</Text>
                <Text style={styles.barDescription}>{item.description || 'No description available'}</Text>
                <Button title="View Events" onPress={() => navigation.navigate('EventsShow', { eventId: item.id })} />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text>No bars available</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFDD', // Fondo principal
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Comic Sans MS', // Fuente personalizada
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 25,
    backgroundColor: '#006A71', // Fondo para los inputs
    paddingHorizontal: 15,
    color: '#FFF', // Texto blanco
  },
  searchButton: {
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ff0077',
    borderRadius: 25,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  barCard: {
    borderRadius: 25,
    backgroundColor: '#73B0AB', // Fondo para las tarjetas de bares
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#000',
  },
  barInfo: {
    flexDirection: 'column',
  },
  barName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF', // Texto blanco para contraste
    marginBottom: 8,
  },
  barLocation: {
    fontSize: 14,
    color: '#E0F4F4', // Texto claro para contraste
    marginBottom: 4,
  },
  barDescription: {
    fontSize: 12,
    color: '#E0F4F4',
  },
  button: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#ff0077',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyListText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
    marginTop: 20,
  },
});