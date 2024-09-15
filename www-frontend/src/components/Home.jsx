import React, { useEffect, useState } from 'react';
import {APIProvider, AdvancedMarker, Pin, Map, MapControl} from '@vis.gl/react-google-maps';

import './SharedStyles.css';

function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [bars, setBars] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserLocation, setCurrentUserLocation] = useState({ lat: 0, lng: 0 });


  useEffect(() => {
    fetch('http://localhost:3001/api/v1/current_user', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` 
      }
    })
    .then(response => response.json())
    .then(data => setCurrentUser(data))
    .catch(error => console.error('Error fetching current user:', error));
  }, []);

  useEffect(() => {
    fetch('http://localhost:3001/api/v1/bars', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` 
      }
    })
    .then(response => response.json())
    .then(data => setBars(data.bars))
    .catch(error => console.error('Error fetching bars:', error));
  }, []);

  const filteredBars = bars.filter(bar => 
    bar.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  useEffect(() => {
    // Solicitar la ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          console.error("Permission denied or error obtaining location");
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  
  return (
    <div>
      <div>
      <h1 className='title'>Welcome to Beer App {currentUser?.handle}</h1>
      <input
          type="text"
          placeholder="Search bars..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <APIProvider apiKey={'AIzaSyCSurJdzxphPzLeVH_vbJg3u_WlDXKlxrI'}>
      <Map
        zoom={13}
        center={currentUserLocation}
        mapId={'7ef791e0ee46cce9'}
        style={{ width: '25vw', height: '60vh', borderWidth: '2px', // Ancho del borde
          borderStyle: 'solid', // Estilo del borde
          borderColor: '#000000', 
          borderRadius: '25px',
        overflow: 'hidden' }} // Propiedades de estilo del mapa
        // Propiedades para habilitar la interacción del usuario
        zoomControl={true}
        mapTypeControl={true} 
        scaleControl={true}
        streetViewControl={true}
        rotateControl={true}
        gestureHandling="auto" // Permite la interacción con gestos del mouse y táctiles
      >
        <AdvancedMarker position={currentUserLocation}>
            <Pin background={'#0000FF'} glyphColor={'#000'} borderColor={'#000'} />
        </AdvancedMarker>
        {filteredBars.map(bar => (
        <AdvancedMarker position={{ lat: bar.latitude, lng:bar.longitude}}>
            <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
        </AdvancedMarker>
        ))}
      </Map>
      </APIProvider>
    </div>
  );
}

export default Home;
