import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as SecureStore from 'expo-secure-store';
import config from './config';
import { createConsumer } from '@rails/actioncable';
import { EventRegister } from 'react-native-event-listeners';
import { useNavigation } from '@react-navigation/native';
import { set } from 'react-hook-form';

global.addEventListener = EventRegister.addEventListener;
global.removeEventListener = EventRegister.removeEventListener;

const Feed = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [filteredFeed, setFilterFeed] = useState([]); 
  const [token, setToken] = useState(null);
  const [users, setUsers] = useState(null);
  const [beers, setBeers] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterType, setFilterType] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  const navigation = useNavigation();

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
    if (!token) return;

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/v1/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchBeers = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/v1/beers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setBeers(transformArrayToObject(data.beers));
    } catch (error) {
      console.error('Error fetching beers:', error);
    }
  };

  const fetchFeed = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/v1/feeds`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setFeedItems(data.feed);
      setFilterFeed(data.feed);
    } catch (error) {
      console.error('Error fetching feed:', error);
    }
  };

  const fetchOptions = async (type) => {
    if (!token) return;

    let url = '';
    if (type === 'beer') url = `${config.apiBaseUrl}/api/v1/beers`;
    if (type === 'event') url = `${config.apiBaseUrl}/api/v1/bars`;
    if (type === 'friend') url = `${config.apiBaseUrl}/api/v1/friends`;

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      setOptions(data.beers);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const filterFeed = async (id) => {
    console.log('Filtering feed:', filterType, id);
    const feedItemsfilter = feedItems.filter((item) => item.beer_id === id);
    console.log(feedItemsfilter);
    setFilterFeed(feedItemsfilter);
  };

  const fetchFilteredFeed = async (type, id) => {
    if (!token) return;
    console.log('Fetching filtered feed:', type, id);

    let url = '';
    if (type === 'beer') url = `${config.apiBaseUrl}/api/v1/beers/${id}`;
    if (type === 'event') url = `${config.apiBaseUrl}/api/v1/events/${id}`;
    if (type === 'friend') url= `${config.apiBaseUrl}/api/v1/friends/${id}`;

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      console.log(data)
      setFeedItems(data);
    } catch (error) {
      console.error('Error fetching filtered feed:', error);
    }
  };

  const openFilter = (type) => {
    setFilterType(type);
    fetchOptions(type);
    setModalVisible(true);
  };

  const applyFilter = () => {
    setModalVisible(false);
    if (selectedOption) {
      filterFeed(selectedOption);
    } else {
      fetchFeed();
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchBeers();
      fetchFeed();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      const cable = createConsumer(config.cableUrl);
      const channel = cable.subscriptions.create('FeedChannel', {
        received(data) {
          const formattedData = {
            id: data.id,
            text: data.text,
            rating: data.rating,
            user_id: data.user.id,
            beer_id: data.beer.id,
            created_at: data.created_at,
          };

          setFeedItems((prevItems) => [formattedData, ...prevItems]);
        },
      });

      return () => {
        channel.unsubscribe();
      };
    }
  }, [token]);

  const renderItem = ({ item }) => {
    if (!users || !beers) {
      return <Text>Cargando...</Text>;
    }

    if (item.beer_id && beers && users) {
      const user = users[item.user_id - 1];
      const beer = beers[item.beer_id];
      return (
        <TouchableOpacity
          style={styles.feedItem}
          onPress={() => navigation.navigate('BeerDetails', { beerId: item.beer_id })}
        >
          <View style={styles.feedItem}>
            <Text style={styles.userName}>
              {user ? `${user.first_name} ${user.last_name}` : `Usuario ID: ${item.user_id}`}
            </Text>
            <Text>
              Calificación: {item.rating} para la cerveza {beer ? beer.name : `ID: ${item.beer_id}`}
            </Text>
            <Text>{item.text}</Text>
          </View>
        </TouchableOpacity>
      );
    } else if (item.event_id && users) {
      const user = users[item.user_id];
      return (
        <TouchableOpacity
          style={styles.feedItem}
          onPress={() => navigation.navigate('EventsShow', { eventId: item.event_id })}
        >
          <View style={styles.feedItem}>
            <Text style={styles.userName}>
              {user ? `${user.first_name} ${user.last_name}` : `Usuario ID: ${item.user_id}`}
            </Text>
            <Text>Actividad en el evento ID {item.event_id}</Text>
            <Text>{item.description}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Feed de Actividades</Text>
        <TouchableOpacity onPress={() => openFilter('beer')}>
          <Text style={styles.filterButton}>Filtrar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredFeed}
        keyExtractor={(item, index) => `${item.id}_${index}`}
        renderItem={renderItem}
        style={styles.flatList} // Aplica el estilo aquí
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <Text>Selecciona una opción</Text>
          <FlatList
            data={Array.isArray(options) ? options : []} // Asegúrate de que options sea un arreglo
            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()} // Usa 'id' o índice
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setSelectedOption(item.id)}>
                <Text>{item.name || 'Sin Nombre'}</Text> 
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.applyButton} onPress={applyFilter}>
            <Text>Aplicar Filtro</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={styles.closeModal}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFDD', // Fondo principal
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Comic Sans MS',
    color: '#000',
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#006A71',
    color: '#fff',
    borderRadius: 25,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  feedItem: {
    padding: 16,
    borderRadius: 25,
    backgroundColor: '#73B0AB', // Fondo para los elementos del feed
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 16,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FFF',
    marginBottom: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  applyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FFCC00',
    borderRadius: 25,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000',
  },
  closeModal: {
    marginTop: 16,
    color: '#ff0077',
    fontWeight: 'bold',
  },
  flatList: {
    borderRadius: 25,
    backgroundColor: '#E5F5E5', // Fondo para la lista de feed
  },
});

export default Feed;