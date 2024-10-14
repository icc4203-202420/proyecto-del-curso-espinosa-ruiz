import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slider } from 'react-native-elements';

const RatingSlider = ({ rating, setRating }) => {
  const handleSliderChange = (value) => {
    setRating(value); // Actualiza el valor del slider
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Rating: {rating.toFixed(1)}</Text> {/* Mostrar el valor actual */}
      <Slider
        value={rating}
        onValueChange={handleSliderChange}
        minimumValue={1}
        maximumValue={5}
        step={0.1}  // Permitir incrementos de 0.1 para aceptar decimales
        thumbTintColor="#FFCC00"  // Color del "thumb"
        minimumTrackTintColor="#FFCC00"  // Color de la barra en el rango seleccionado
        maximumTrackTintColor="#000"  // Color de la barra fuera del rango seleccionado
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

// Definir las marcas en valores enteros
const marks = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
];

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
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
    fontSize: 14,
    color: '#000',
  },
});

export default RatingSlider;
