import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';

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

        const response = await fetch('http://192.168.100.107:3001/api/v1/bars', {
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

      const response = await fetch(`http://192.168.100.107:3001/api/v1/bars/${bar.id}/checkin`, {
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

    await fetch('https://exp.host/--/api/v2/push/send', {
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
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
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
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  barCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    marginBottom: 20,
  },
  barInfo: {
    marginLeft: 10,
  },
  barName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  barLocation: {
    fontSize: 14,
    color: '#888',
  },
  barDescription: {
    fontSize: 12,
    color: '#AAA',
  },
});
