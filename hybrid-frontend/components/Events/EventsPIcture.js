import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { useNavigation, useRoute } from '@react-navigation/native';

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

      fetch('http://192.168.100.107:3001/api/v1/users', {
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
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.uri);
    }
  };

  const handleTagUser = (user) => {
    if (!taggedUsers.includes(user)) {
      setTaggedUsers([...taggedUsers, user]);
    }
    setUserSearch('');
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
      const uriParts = image.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('picture', {
        uri: image,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    fetch(`http://192.168.100.107:3001/api/v1/events/${eventId}/upload_event_image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    })
      .then((response) => response.json())
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

      await fetch('https://exp.host/--/api/v2/push/send', {
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

  return (
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

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleTagUser(item)} style={styles.userSuggestion}>
            <Text>{item.handle}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.taggedUsers}>
        {taggedUsers.map((user, index) => (
          <Text key={index} style={styles.taggedUser}>{user.handle}</Text>
        ))}
      </View>

      <Button title="Share Post" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fcf7e5',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#000',
    marginBottom: 20,
  },
  imagePicker: {
    width: 300,
    height: 300,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 20,
  },
  placeholderText: {
    color: '#666',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  descriptionInput: {
    width: '80%',
    height: 60,
    marginVertical: 20,
    padding: 10,
    borderRadius: 15,
    borderColor: '#00a0a0',
    borderWidth: 2,
    backgroundColor: '#9fcfcf',
    color: '#000',
  },
  tagUsersInput: {
    width: '80%',
    padding: 10,
    borderRadius: 20,
    borderColor: '#00a0a0',
    borderWidth: 2,
    backgroundColor: '#9fcfcf',
    color: '#000',
  },
  userSuggestion: {
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  taggedUsers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  taggedUser: {
    backgroundColor: '#9fcfcf',
    padding: 10,
    borderRadius: 20,
    margin: 5,
  },
});
