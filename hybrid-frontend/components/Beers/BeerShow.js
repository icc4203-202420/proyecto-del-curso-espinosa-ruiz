import React, { useState, useEffect, useReducer } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Slider } from 'react-native-elements';  // Slider para la calificación
import * as SecureStore from 'expo-secure-store';

const reviewValidationSchema = {
  text: value => value.length >= 15 || 'Review must contain at least 15 characters',
  rating: value => (value >= 1 && value <= 5) || 'Rating must be between 1 and 5',
};

const initialState = {
  loading: false,
  reviews: [],
  error: null,
  userReview: null,
};

// Reducer para manejar los estados de las reseñas
const reviewsReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'SUCCESS':
      return { ...state, loading: false, reviews: action.payload.reviews, userReview: action.payload.userReview };
    case 'ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const BeerShow = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const beerId = route.params.beerId;  // Obtener el ID de la cerveza desde los parámetros de la ruta
  const [beer, setBeer] = useState(null);
  const [rating, setRating] = useState(3);  // Estado del slider
  const [reviewText, setReviewText] = useState('');  // Estado del texto de la reseña
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [state, dispatch] = useReducer(reviewsReducer, initialState);

  // Obtener el usuario actual
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) throw new Error('No token found');

        const response = await fetch('http://192.168.100.107:3001/api/v1/current_user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setCurrentUser(data);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  // Obtener detalles de la cerveza
  useEffect(() => {
    const fetchBeerDetails = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) throw new Error('No token found');

        const response = await fetch(`http://192.168.100.107:3001/api/v1/beers/${beerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setBeer(data);
      } catch (error) {
        console.error('Error fetching beer details:', error);
      }
    };

    fetchBeerDetails();
  }, [beerId]);

  // Manejar las reseñas usando useReducer
  useEffect(() => {
    const fetchReviews = async () => {
      dispatch({ type: 'LOADING' });
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const response = await fetch(`http://192.168.100.107:3001/api/v1/beers/${beerId}/reviews`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        
        const userReview = data.reviews.find(review => review.user_id === currentUser.id);
        const otherReviews = data.reviews.filter(review => review.user_id !== currentUser.id);
        dispatch({
          type: 'SUCCESS',
          payload: {
            reviews: [userReview, ...otherReviews].filter(Boolean),
            userReview,
          },
        });
      } catch (error) {
        dispatch({ type: 'ERROR', payload: error.message });
      }
    };

    fetchReviews();
  }, [beerId]);

  const handleNewReview = async () => {
    // Validación
    if (!reviewValidationSchema.text(reviewText)) {
      Alert.alert('Error', 'Review must contain at least 15 characters');
      return;
    }
    if (!reviewValidationSchema.rating(rating)) {
      Alert.alert('Error', 'Rating must be between 1 and 5');
      return;
    }

    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(`http://192.168.100.107:3001/api/v1/beers/${beerId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          review: {
            text: reviewText,
            rating,
            beer_id: beerId,
            user_id: currentUser.id,
          },
        }),
      });

      if (response.ok) {
        setShowReviewForm(false);
        dispatch({ type: 'LOADING' });  // Refrescar las reseñas
      } else {
        console.error('Error al agregar reseña:', await response.text());
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  if (!beer || state.loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Detalles de la cerveza */}
      <View style={styles.header}>
        <Text style={styles.title}>{beer.name}</Text>
        <Text style={styles.subtitle}>Brewery: {beer.brand?.brewery?.name}</Text>
        <Text style={styles.subtitle}>Average Rating: {beer.avg_rating}/5</Text>
      </View>

      {/* Formulario de reseñas */}
      {showReviewForm && (
        <View style={styles.form}>
          <TextInput
            style={styles.textArea}
            placeholder="Write your review"
            value={reviewText}
            onChangeText={setReviewText}
            multiline
          />
          <Slider
            value={rating}
            onValueChange={setRating}
            minimumValue={1}
            maximumValue={5}
            step={0.1}
            thumbTintColor="#FFCC00"
            minimumTrackTintColor="#FFCC00"
            maximumTrackTintColor="#000"
          />
          <Button title="Submit Review" onPress={handleNewReview} />
          <Button title="Cancel" onPress={() => setShowReviewForm(false)} />
        </View>
      )}

      <Button title={showReviewForm ? 'Close Review Form' : 'Add a Review'} onPress={() => setShowReviewForm(!showReviewForm)} />

      {/* Lista de reseñas */}
      <FlatList
        data={state.reviews}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.reviewItem}>
            <Text style={styles.reviewerName}>{item.user ? `${item.user.first_name} ${item.user.last_name}` : 'Anonymous'}</Text>
            <Text>Rating: {item.rating}/5</Text>
            <Text>{item.text}</Text>
          </View>
        )}
        ListHeaderComponent={() => <Text style={styles.reviewHeader}>Reviews</Text>}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  form: {
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 16,
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
    paddingVertical: 12,
  },
  reviewerName: {
    fontWeight: 'bold',
  },
  reviewHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default BeerShow;
