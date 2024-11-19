import React, { useState, useEffect, useReducer } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, ActivityIndicator, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import config from '../config';

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
  const beerId = route.params.beerId;
  const [beer, setBeer] = useState(null);
  const [rating, setRating] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [state, dispatch] = useReducer(reviewsReducer, initialState);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) throw new Error('No token found');

        const response = await fetch(`${config.apiBaseUrl}/api/v1/current_user`, {
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

  useEffect(() => {
    const fetchBeerDetails = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) throw new Error('No token found');

        const response = await fetch(`${config.apiBaseUrl}/api/v1/beers/${beerId}`, {
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

  useEffect(() => {
    const fetchReviews = async () => {
      dispatch({ type: 'LOADING' });
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const response = await fetch(`${config.apiBaseUrl}/api/v1/beers/${beerId}/reviews`, {
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
  }, [beerId, currentUser]);

  const handleNewReview = async () => {
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
      const response = await fetch(`${config.apiBaseUrl}/api/v1/beers/${beerId}/reviews`, {
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
        dispatch({ type: 'LOADING' });
      } else {
        console.error('Error adding review:', await response.text());
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
      <View style={styles.header}>
        <Text style={styles.title}>{beer.name}</Text>
        <Text style={styles.subtitle}>Brewery: {beer.brand?.brewery?.name}</Text>
        <Text style={styles.subtitle}>Average Rating: {beer.avg_rating}/5</Text>
      </View>

      {showReviewForm && (
        <View style={styles.form}>
          <TextInput
            style={styles.textArea}
            placeholder="Write your review"
            value={reviewText}
            onChangeText={setReviewText}
            multiline
          />
          <Text style={styles.subtitle}>Select Rating:</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map(value => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.ratingButton,
                  rating === value && styles.ratingButtonSelected,
                ]}
                onPress={() => setRating(value)}
              >
                <Text style={styles.ratingText}>{value}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.button} onPress={handleNewReview}>
            <Text style={styles.buttonText}>Submit Review</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setShowReviewForm(false)}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={() => setShowReviewForm(!showReviewForm)}>
        <Text style={styles.buttonText}>{showReviewForm ? 'Close Review Form' : 'Add a Review'}</Text>
      </TouchableOpacity>

      <FlatList
        data={state.reviews}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.reviewItem}>
            <Text style={styles.reviewerName}>
              {item.user ? `${item.user.first_name} ${item.user.last_name}` : 'Anonymous'}
            </Text>
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
    backgroundColor: '#FFFFDD',
  },
  header: {
    marginBottom: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#E5F5E5',
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Comic Sans MS',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#000',
  },
  form: {
    marginBottom: 16,
    borderRadius: 25,
    backgroundColor: '#006A71',
    padding: 16,
  },
  textArea: {
    height: 100,
    borderRadius: 25,
    backgroundColor: '#006A71',
    color: '#FFF',
    padding: 10,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  ratingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#73B0AB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  ratingButtonSelected: {
    backgroundColor: '#FFCC00',
  },
  ratingText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewItem: {
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#73B0AB',
    padding: 16,
    marginBottom: 16,
  },
  reviewerName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#FFF',
  },
  reviewHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
    textAlign: 'center',
  },
  button: {
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#ff0077',
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BeerShow;