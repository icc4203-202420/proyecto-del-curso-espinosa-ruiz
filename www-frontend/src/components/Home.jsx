import React, { useEffect, useState } from 'react';
import { APIProvider, AdvancedMarker, Pin, Map } from '@vis.gl/react-google-maps';
import './SharedStyles.css';
import searchIcon from '../assets/search-icon.svg'; // Asegúrate de tener el ícono importado

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
    <div className="container">
      <h1 className='title'>Welcome to Beer App {currentUser?.handle}</h1>

      <div className="search-container">
        <form className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Search bars..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-button">
            <img src={searchIcon} alt="Search" />
          </button>
        </form>
      </div>

      {/* Espacio adicional entre la barra de búsqueda y el mapa */}
      <div className="map-wrapper">
        <APIProvider apiKey={'AIzaSyCSurJdzxphPzLeVH_vbJg3u_WlDXKlxrI'}>
          <Map
            zoom={13}
            center={currentUserLocation}
            mapId={'7ef791e0ee46cce9'}
            style={{
              width: '398px',
              height: '392px',
              borderRadius: '100px',
              background: `url('<path-to-image>') lightgray 50% / cover no-repeat`,
              overflow: 'hidden', // Mantiene los bordes redondeados
              margin: '0 auto', // Centramos el mapa
            }}
            zoomControl={true}
            mapTypeControl={true}
            scaleControl={true}
            streetViewControl={true}
            rotateControl={true}
            gestureHandling="auto"
          >
            <AdvancedMarker position={currentUserLocation}>
              <Pin background={'#0000FF'} glyphColor={'#000'} borderColor={'#000'} />
            </AdvancedMarker>
            {filteredBars.map(bar => (
              <AdvancedMarker key={bar.id} position={{ lat: bar.latitude, lng: bar.longitude }}>
                <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
              </AdvancedMarker>
            ))}
          </Map>
        </APIProvider>
      </div>
    </div>
  );
}

export default Home;
