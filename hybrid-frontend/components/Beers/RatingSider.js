import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

const RatingSlider = ({ rating = 3, setRating = () => {} }) => {
  const handleSliderChange = (value) => {
    setRating(value); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Rating: {rating.toFixed(1)}</Text> 
      <Slider
        value={rating}
        onValueChange={handleSliderChange}
        minimumValue={1}
        maximumValue={5}
        step={0.1}  
        thumbTintColor="#FFCC00"  
        minimumTrackTintColor="#FFCC00" 
        maximumTrackTintColor="#000"  
      />
      {/* Mostrar las marcas */}
      <View style={styles.marksContainer}>
        {marks.map((mark) => (
          <Text key={mark.value} style={styles.markLabel}>{mark.label}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  marksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  markLabel: {
    fontSize: 12,
    color: '#666',
  },
});

export default RatingSlider;