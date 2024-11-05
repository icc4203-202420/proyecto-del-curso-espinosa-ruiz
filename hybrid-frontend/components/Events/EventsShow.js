import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, FlatList, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { useRoute, useNavigation } from '@react-navigation/native';
import CheckInIcon from '../../assets/check-in-icon.svg';  
import AddEvent from '../../assets/add-event.png';
import { Linking } from 'react-native';
import { Video } from 'expo-av';

export default function EventsShow() {
  const [event, setEvent] = useState(null);
  const [users, setUsers] = useState([]);
  const [eventImages, setEventImages] = useState([]);
  const route = useRoute();
  const navigation = useNavigation();
  const [videoUrl, setVideoUrl] = useState(null);
  const { eventId } = route.params;

  useEffect(() => {
    const fetchUsers = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }

      fetch('http://192.168.100.107:3001/api/v1/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setUsers(data))
        .catch((error) => console.error('Error fetching users:', error));
    };

    const fetchEvent = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }

      fetch(`http://192.168.100.107:3001/api/v1/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) throw new Error('Error fetching event');
          return response.json();
        })
        .then((data) => setEvent(data.event))
        .catch((error) => console.error('Error fetching event:', error));
    };

    const fetchEventImages = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }

      fetch(`http://192.168.100.107:3001/api/v1/events/${eventId}/get_event_images`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => setEventImages(data.event_pictures || []))
        .catch((error) => console.error('Error fetching event images:', error));
    };

    fetchUsers();
    fetchEvent();
    fetchEventImages();
  }, [eventId]);

  const handleCheckIn = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    if (!token) {
      Alert.alert('Error', 'No token found');
      return;
    }

    fetch(`http://192.168.100.107:3001/api/v1/events/${eventId}/mark_assistance`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Error checking in');
        return response.json();
      })
      .then((data) => {
        Alert.alert('Check-in successful');
        sendCheckInNotification();
        navigation.replace('EventsShow', { eventId });
      })
      .catch((error) => console.error('Error checking in:', error));
  };

  const handleGenerateSummary = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }
      const response = await fetch(`http://192.168.100.107:3001/api/v1/events/${event.id}/generate_event_summary_video`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert("Resumen generado", "Se ha generado el video de resumen.");
        console.log("Video URL:", data.video_url);
        setVideoUrl(data.video_url);
      } else {
        Alert.alert("Error", "No se pudo generar el resumen.");

      }
    } catch (error) {
      console.error("Error al generar el resumen:", error);
    }
  };

  const sendCheckInNotification = async () => {
    const message = {
      to: "<FRIEND_EXPO_PUSH_TOKEN>",
      sound: 'default',
      title: 'Check-In Notification',
      body: 'Your friend has checked into an event!',
      data: { screen: 'EventsShow', eventId },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  };

  if (!event) return <Text>Loading event...</Text>;

  const eventDate = new Date(event.date); 

  const currentDate = new Date();

  const hasEventPassed = currentDate < eventDate;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eventName}>{event.name}</Text>

      <TouchableOpacity style={styles.addEventButton} onPress={() => navigation.navigate('EventPicture', { eventId })}>
        <Image source={AddEvent} style={styles.icon} />
      </TouchableOpacity>

      <View style={styles.eventImageContainer}>
        <Image source={{ uri: '/path/to/event-image.jpg' }} style={styles.eventImage} />
      </View>

      

      {hasEventPassed ? (
        
        <>
        <View style={styles.attendingSection}>
        <TouchableOpacity onPress={handleCheckIn} style={styles.attendingButton}>
          <Image source={CheckInIcon} style={styles.icon} />
        </TouchableOpacity>
      </View>
          <Text style={styles.attendeesTitle}>Attendees:</Text>
          <FlatList
            data={event.attendances.filter((attendee) => attendee.checked_in)}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.attendee}>
                <Text style={styles.username}>
                  {users.find((user) => user.id === item.user_id)?.first_name || 'Unknown'}
                </Text>
              </View>
            )}
          />
          <Text style={styles.galleryTitle}>Event Gallery</Text>
          <FlatList
            data={eventImages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.galleryImage}>
                <Text>Image {index + 1}</Text>
                <Image source={{ uri: item.url }} style={styles.image} />
              </View>
            )}
      />
        </>
        
      ) : (
        <>
        <Button
          title="Resumen"
          onPress={handleGenerateSummary} 
        />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Resumen del Evento</Text>
      {videoUrl ? (
        <Video
          source={{ uri: videoUrl }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="cover"
          shouldPlay
          style={{ width: 300, height: 200 }}
          useNativeControls
        />
      ) : (
        <Text>Presione resumen para continuar. El evento terminó el {eventDate.toLocaleDateString()}.</Text>
      )}
    </View>
        </>
      )}

      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fffcdc',
    alignItems: 'center',
  },
  eventName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  addEventButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  icon: {
    width: 40,
    height: 40,
  },
  eventImageContainer: {
    width: 337,
    height: 315,
    borderRadius: 25,
    backgroundColor: '#e5f5e5',
    marginBottom: 20,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  attendingSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  attendingButton: {
    padding: 10,
    backgroundColor: 'black',
  },
  attendeesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  attendee: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginVertical: 5,
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    color: '#000',
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  galleryImage: {
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 200,
    borderRadius: 10,
  },
});
