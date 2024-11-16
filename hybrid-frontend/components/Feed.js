// Feed.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { createConsumer } from '@rails/actioncable';

const Feed = () => {
  const [feedItems, setFeedItems] = useState([]);

  // Función para cargar el feed inicial
  const fetchInitialFeed = async () => {
    try {
      const response = await fetch('https://exp.host/--/api/v1/feeds'); // Cambia la URL según corresponda
      const data = await response.json();
      setFeedItems(data);
    } catch (error) {
      console.error("Error al cargar el Feed inicial:", error);
    }
  };

  useEffect(() => {
    // Llamar a la API para obtener el feed inicial
    fetchInitialFeed();

    // Crear el consumidor y suscribirse al canal FeedChannel para actualizaciones en tiempo real
    const consumer = createConsumer();
    const subscription = consumer.subscriptions.create("FeedChannel", {
      received(data) {
        // Agregar la nueva publicación al principio del estado del Feed
        setFeedItems((prevItems) => [data, ...prevItems]);
      }
    });

    // Limpiar la suscripción cuando el componente se desmonte
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Renderizar cada elemento del Feed
  const renderItem = ({ item }) => {
    const { user, rating, beer, description, event } = item.data;

    if (item.type === 'review') {
      return (
        <View style={styles.feedItem}>
          <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
          <Text>Calificación: {rating} para la cerveza {beer.name}</Text>
          <Text>{item.data.text}</Text>
        </View>
      );
    } else if (item.type === 'event_picture') {
      return (
        <View style={styles.feedItem}>
          <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
          <Text>Publicó una foto en el evento {event.name}</Text>
          <Text>{description}</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Feed de Actividades</Text>
      <FlatList
        data={feedItems}
        keyExtractor={(item, index) => index.toString()}
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
