import React, { useEffect, useState } from 'react';
import {APIProvider, AdvancedMarker, Pin, Map, MapControl} from '@vis.gl/react-google-maps';

import './SharedStyles.css';

function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [bars, setBars] = useState([]); 

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
  console.log(JSON.stringify(bars));

  
  return (
    <div>
      <h1 className='title'>Welcome to Beer App, {currentUser?.handle}</h1>
      <APIProvider apiKey={'AIzaSyCSurJdzxphPzLeVH_vbJg3u_WlDXKlxrI'}>
      <Map
        zoom={1}
        center={{ lat: -17.61345692092152, lng:28.971957221315847}}
        mapId={'7ef791e0ee46cce9'}
        style={{ width: '50vw', height: '50vh', border: '50' }}
        // Propiedades para habilitar la interacción del usuario
        zoomControl={true}
        mapTypeControl={true}
        scaleControl={true}
        streetViewControl={true}
        rotateControl={true}
        gestureHandling="auto" // Permite la interacción con gestos del mouse y táctiles
      >
        {bars.map(bar => (
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
