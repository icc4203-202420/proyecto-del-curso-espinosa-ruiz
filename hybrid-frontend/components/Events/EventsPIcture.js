import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { useNavigation, useRoute } from '@react-navigation/native';
import config from '../config';

export default function EventPicture() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [users, setUsers] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params;

  useEffect(() => {
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

    fetchUsers();
  }, []);
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need permissions to access your photos');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
  
    // Utiliza result.assets[0].uri para obtener el URI de la imagen seleccionada
    if (!result.canceled && result.assets && result.assets.length > 0) {
      console.log("Image URI:", result.assets[0].uri); // Para verificar en la consola
      setImage(result.assets[0].uri);
    } else {
      console.log("Image selection was canceled or no URI found");
    }
  };

  const handleUserSearch = (text) => setUserSearch(text);


  const handleSubmit = async () => {
  const token = await SecureStore.getItemAsync('userToken');
  if (!token) {
    Alert.alert('Error', 'No token found');
    return;
  }

  const formData = new FormData();
  formData.append('description', description);
  formData.append('tagged_users', JSON.stringify(taggedUsers.map((user) => user.id)));

  if (image) {
    // Asegúrate de que la URI sea compatible
    const uriParts = image.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('picture', {
      uri: image,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    });
  } else {
    Alert.alert('Error', 'Please select an image to upload');
    return;
  }

  fetch(`${config.apiBaseUrl}/api/v1/events/${eventId}/upload_event_image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error uploading image');
      }
      return response.json();
    })
    .then((data) => {
      Alert.alert('Success', 'Event picture uploaded');
      sendTagNotifications();
      navigation.goBack();
    })
    .catch((error) => console.error('Error uploading event picture:', error));
};

  const sendTagNotifications = () => {
    taggedUsers.forEach(async (user) => {
      const message = {
        to: user.pushToken, // User push token
        sound: 'default',
        title: 'You have been tagged in a photo',
        body: `Check out the new event photo you were tagged in!`,
        data: { screen: 'EventPicture', eventId },
      };

      await fetch(`${config.apiBaseUrl}/api/v2/push/send`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    });
  };

  const filteredUsers = users.filter((user) =>
    user.handle.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleTagUser = (user) => {
    if (!taggedUsers.includes(user)) {
      setTaggedUsers([...taggedUsers, user]);
    }
    setUserSearch('');
  };

  return (
    <FlatList
      data={filteredUsers}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handleTagUser(item)} style={styles.userSuggestion}>
          <Text>{item.handle}</Text>
        </TouchableOpacity>
      )}
      ListHeaderComponent={() => (
        <View style={styles.container}>
          <Text style={styles.title}>Add Event Picture</Text>

          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <Text style={styles.placeholderText}>Tap to select image</Text>
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.descriptionInput}
            placeholder="Add a description"
            value={description}
            onChangeText={setDescription}
          />

          <TextInput
            style={styles.tagUsersInput}
            placeholder="Tag users by handle"
            value={userSearch}
            onChangeText={handleUserSearch}
          />
        </View>
      )}
      ListFooterComponent={() => (
        <View style={styles.container}>
          <View style={styles.taggedUsers}>
            {taggedUsers.map((user, index) => (
              <Text key={index} style={styles.taggedUser}>{user.handle}</Text>
            ))}
          </View>

          <Button title="Share Post" onPress={handleSubmit} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFDD', // Fondo principal
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Comic Sans MS', // Fuente personalizada
  },
  imagePicker: {
    width: 300,
    height: 300,
    backgroundColor: '#E5F5E5', // Fondo para la selección de imágenes
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000', // Borde negro
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderText: {
    color: '#666',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  descriptionInput: {
    width: '80%',
    height: 60,
    marginVertical: 20,
    padding: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#73B0AB', // Fondo para la descripción
    color: '#FFF', // Texto blanco
  },
  tagUsersInput: {
    width: '80%',
    height: 60,
    padding: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#73B0AB', // Fondo para etiquetar usuarios
    color: '#FFF', // Texto blanco
    marginBottom: 20,
  },
  userSuggestion: {
    padding: 10,
    backgroundColor: '#73B0AB', // Fondo para sugerencias de usuarios
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 10,
  },
  taggedUsers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  taggedUser: {
    backgroundColor: '#73B0AB', // Fondo para usuarios etiquetados
    padding: 10,
    borderRadius: 25,
    margin: 5,
    color: '#FFF', // Texto blanco
  },
});