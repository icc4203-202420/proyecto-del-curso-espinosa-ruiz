import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

// Definir las marcas en valores enteros
const marks = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
];

function valuetext(value) {
  return `${value}`;
}

export default function RatingSlider({ rating, setRating }) {
  const handleSliderChange = (event, newValue) => {
    setRating(newValue); // Actualiza el valor del slider
  };

  return (
    <Box sx={{ width: 300 }}>
      <Slider
        aria-label="Rating"
        value={rating}
        onChange={handleSliderChange}
        getAriaValueText={valuetext}
        step={0.1} // Permitir incrementos de 0.1 para aceptar decimales
        marks={marks} // Marcas en números enteros
        min={1}
        max={5}
        valueLabelDisplay="on" // Mostrar el valor actual
      />
    </Box>
  );
}
