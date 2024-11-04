import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { AuthContext, useAuth } from '../Auth/AuthContext';

function UserSearch() {
  const { userToken, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [eventSearch, setEventSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [friendshipCreated, setFriendshipCreated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Registro de token de notificaciones al iniciar
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) throw new Error('No token found');
        console.log(token);

        const response = await fetch('http://192.168.100.107:3001/api/v1/current_user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setCurrentUser(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching current user:', error);
        Alert.alert('Error', 'Session expired, please login again');
      }
    };
    fetchCurrentUser();
  }, [userToken]);

  const fetchUsers = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) throw new Error('No token found');

      const response = await fetch(`http://192.168.100.107:3001/api/v1/users?handle=${search}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error fetching users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateFriendship = async () => {
    if (selectedUser && currentUser) {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const response = await fetch(`http://192.168.100.107:3001/api/v1/users/${currentUser.id}/friendships`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            friendship: {
              friend_id: selectedUser.id,
              event_id: selectedEvent ? selectedEvent.id : null,
            },
          }),
        });

        if (!response.ok) throw new Error('Friendship creation failed');
        
        const data = await response.json();
        console.log(data);
        setFriendshipCreated(true);

        // Enviar notificación push al amigo agregado
        sendPushNotification(selectedUser.pushToken);
      } catch (error) {
        console.error('Error creating friendship:', error);
        Alert.alert('Error', 'Failed to create friendship');
      }
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <>
          <Text style={styles.title}>Search Users</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter handle"
            value={search}
            onChangeText={setSearch}
          />
          <Button title="Search" onPress={fetchUsers} />
          <FlatList
            data={users}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setSelectedUser(item)} style={styles.userCard}>
                <Text style={styles.userText}>{item.handle}</Text>
              </TouchableOpacity>
            )}
          />

          {selectedUser && (
            <View style={styles.userInfoCard}>
              <Text style={styles.userInfoText}>Selected User: {selectedUser.handle}</Text>
            </View>
          )}

          <Text style={styles.title}>Search Events</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter event name"
            value={eventSearch}
            onChangeText={setEventSearch}
          />
          <Button title="Search Events" onPress={() => {}} />
          <FlatList
            data={events}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setSelectedEvent(item)} style={styles.eventCard}>
                <Text style={styles.eventText}>{item.name || "Unnamed Event"}</Text>
              </TouchableOpacity>
            )}
          />

          {selectedEvent && (
            <View style={styles.userInfoCard}>
              <Text style={styles.userInfoText}>Selected Event: {selectedEvent.name}</Text>
            </View>
          )}

          {selectedUser && currentUser && (
            <Button title="Add Friend" onPress={handleCreateFriendship} />
          )}

          {friendshipCreated && (
            <Text style={styles.successMessage}>Friendship created successfully!</Text>
          )}
        </>
      )}
    </View>
  );
}

// Función para enviar la notificación push
async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'New Friend Added!',
    body: 'You have been added as a friend!',
    data: { screen: 'Home' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

// Función para registrar el token de notificaciones
async function registerForPushNotificationsAsync() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== 'granted') {
      Alert.alert('Failed to get push token for push notification!');
      return;
    }
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log(token);
  // Guarda el token en tu backend junto con el usuario
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  input: {
    height: 40,
    borderColor: '#CCC',
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 10,
    borderRadius: 25,
    backgroundColor: '#E5F5E5',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCard: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderColor: '#000',
    borderWidth: 1,
    marginBottom: 10,
  },
  userText: {
    color: '#000',
  },
  userInfoCard: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderColor: '#000',
    borderWidth: 1,
    marginTop: 20,
  },
  userInfoText: {
    fontSize: 16,
    color: '#000',
  },
  eventCard: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderColor: '#000',
    borderWidth: 1,
    marginBottom: 10,
  },
  eventText: {
    color: '#000',
  },
  successMessage: {
    color: 'green',
    marginTop: 10,
    fontWeight: 'bold',
  },
});

export default UserSearch;
