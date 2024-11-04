import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import Divider from '../../assets/divider.svg';
import likeIcon from '../../assets/like-icon.svg';
import backIcon from '../../assets/back-icon.svg';

export default function BarEvents() {
  const [events, setEvents] = useState([]);
  const [barName, setBarName] = useState('');
  const route = useRoute();
  const navigation = useNavigation();
  const { barId } = route.params;

  useEffect(() => {
    const fetchBarData = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }

      fetch(`http://192.168.100.107/api/v1/bars/${barId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => {
          if (!response.ok) throw new Error('Unauthorized');
          return response.json();
        })
        .then(data => {
          setBarName(data.bar.name);
        })
        .catch(error => console.error('Error fetching bar:', error));
    };

    fetchBarData();
  }, [barId]);

  useEffect(() => {
    const fetchEvents = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }

      fetch('http://192.168.100.107/api/v1/events', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => {
          if (!response.ok) throw new Error('Unauthorized');
          return response.json();
        })
        .then(data => {
          const filteredEvents = data.events.filter(event => event.bar_id === parseInt(barId, 10));
          setEvents(filteredEvents);
        })
        .catch(error => console.error('Error fetching events:', error));
    };

    fetchEvents();
  }, [barId]);

  const renderEventItem = ({ item }) => (
    <View style={styles.eventItem}>
      <View style={styles.eventContent}>
        <Text style={styles.eventIcon}>🎤</Text>
        <View>
          <Text style={styles.eventName}>{item.name}</Text>
          <Text style={styles.eventDate}>{item.date}</Text>
          <Text style={styles.eventDescription}>{item.description}</Text>
        </View>
      </View>
      <View style={styles.eventActions}>
        <TouchableOpacity onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}>
          <Text style={styles.eventLink}>INFO</Text>
        </TouchableOpacity>
        <Image source={likeIcon} style={styles.likeIcon} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={backIcon} style={styles.backIcon} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Future events at: {barName}</Text>
      <Image source={Divider} style={styles.divider} />
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text>No events available</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff6e5',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 2,
    marginBottom: 20,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  eventsList: {
    width: '100%',
  },
  eventItem: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  eventName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  eventDate: {
    fontSize: 16,
    color: '#999',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
  },
  eventActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventLink: {
    color: '#6b3fb7',
    fontSize: 14,
    marginRight: 10,
  },
  likeIcon: {
    width: 24,
    height: 24,
  },
});
