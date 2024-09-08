import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './BarList.css';
import searchIcon from '../assets/search-icon.svg';

function BarList() {
  const [bars, setBars] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('jwtToken'); // Obtener el token del localStorage

    if (!token) {
      console.error('No token found');
      return;
    }

    console.log('Using token:', token); // Verifica si el token está siendo obtenido correctamente

    fetch('http://localhost:3001/api/v1/bars', {
      headers: {
        'Authorization': `Bearer ${token}`, // Incluir el token en la cabecera
      }
    })
      .then(response => {
        console.log('Response status:', response.status); // Verifica el estado de la respuesta
        if (response.status === 401) {
          throw new Error('Unauthorized'); // Maneja la falta de autorización
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched data:', data); // Verifica los datos devueltos
        if (data && data.bars) {
          setBars(data.bars);
        } else {
          setBars([]);
        }
      })
      .catch(error => {
        console.error('Error fetching bars:', error);
        setBars([]);
      });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log(`Searching for bar with name: ${search}`);
  };

  return (
    <div className="container">
      <h1 className="title">Bars</h1>
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Enter a bar name" 
            className="search-input"
          />
          <button type="submit" className="search-button">
            <img src={searchIcon} alt="Search" />
          </button>
        </form>
      </div>
      <ul className="bar-list">
        {bars && bars.length > 0 ? (
          bars.map(bar => (
            <li key={bar.id} className="bar-item">
              <div className="bar-card">
                <div className="bar-image-placeholder"></div>
                <div className="bar-info">
                  <h2 className="bar-name">{bar.name}</h2>
                  <p className="bar-location">{bar.location || 'Location not available'}</p>
                  <p className="bar-description">{bar.description || 'No description available'}</p>
                </div>
                <Link to={`/bars/${bar.id}/events#info`} className="events-button">
                  View Events
                </Link>
              </div>
            </li>
          ))
        ) : (
          <p>No bars available</p>
        )}
      </ul>
    </div>
  );
}

export default BarList;
    