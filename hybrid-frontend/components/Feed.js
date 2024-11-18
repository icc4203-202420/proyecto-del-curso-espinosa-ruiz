import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import config from './config';

const Feed = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [token, setToken] = useState(null);
  const [users, setUsers] = useState(null);
  const [beers, setBeers] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const userToken = await SecureStore.getItemAsync('userToken');
      setToken(userToken);
    };
    fetchToken();
  }, []);

  const transformArrayToObject = (array, key = 'id') =>
    array.reduce((acc, item) => {
      acc[item[key]] = item;
      return acc;
    }, {});

    const fetchUsers = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }

      fetch(`${config.apiBaseUrl}/api/v1/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setUsers(data))
        .catch((error) => console.error('Error fetching users:', error));
    };

  const fetchBeers = async () => {
    if (!token) {
      console.error("Token not available");
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/v1/beers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        setBeers(transformArrayToObject(data.beers));
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError);
        console.error("Response text:", text);
      }
    } catch (error) {
      console.error("Error fetching beers:", error);
    }
  };

  const fetchInitialFeed = async () => {
    if (!token) {
      console.error("Token not available");
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/v1/feeds`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        setFeedItems(data.feed);
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError);
        console.error("Response text:", text);
      }
    } catch (error) {
      console.error("Error fetching feed:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchInitialFeed();
      fetchUsers();
      fetchBeers();
      const connectWebSocket = () => {
        const ws = new WebSocket(`ws://10.33.0.139:3001/cable?token=${token}`);
  
        ws.onopen = () => {
          console.log('WebSocket connection opened');
          const subscribeMessage = {
            command: 'subscribe',
            identifier: JSON.stringify({ channel: 'FeedChannel' }),
          };
          ws.send(JSON.stringify(subscribeMessage));
        };
  
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'welcome' || data.type === 'ping' || data.type === 'confirm_subscription') {
            return;
          }
  
          if (data.message) {
            console.log('Received new feed item:', data.message);
            setFeedItems((prevItems) => [data.message, ...prevItems]);
          }
        };
  
        ws.onerror = (error) => {
          console.error('WebSocket error:', error.message);
        };
  
        ws.onclose = (event) => {
          console.log(`WebSocket closed: ${event.code}, ${event.reason}`);
          setTimeout(connectWebSocket, 3000); 
        };
  
        return ws;
      };
  
      const ws = connectWebSocket();
  
      return () => ws.close();
    }
  }, [token]);

  const renderItem = ({ item }) => {
    if (item.beer_id && beers && users) {
      const user = users[item.user_id-1];
      const beer = beers[item.beer_id];
      return (
        <View style={styles.feedItem}>
          <Text style={styles.userName}>
            {user ? `${user.first_name} ${user.last_name}` : `Usuario ID: ${item.user_id}`}
          </Text>
          <Text>
            Calificación: {item.rating} para la cerveza {beer ? beer.name : `ID: ${item.beer_id}`}
          </Text>
          <Text>{item.text}</Text>
        </View>
      );
    } else if (item.event_id && users) {
      const user = users[item.user_id];
      return (
        <View style={styles.feedItem}>
          <Text style={styles.userName}>
            {user ? `${user.first_name} ${user.last_name}` : `Usuario ID: ${item.user_id}`}
          </Text>
          <Text>Actividad en el evento ID {item.event_id}</Text>
          <Text>{item.description}</Text>
        </View>
      );
    }

    return null; // No renderizar si no es válido
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Feed de Actividades</Text>
      <FlatList
        data={feedItems}
        keyExtractor={(item, index) => `${item.id}_${item.user_id}_${index}` /* Garantizar unicidad */}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  feedItem: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
});

export default Feed;