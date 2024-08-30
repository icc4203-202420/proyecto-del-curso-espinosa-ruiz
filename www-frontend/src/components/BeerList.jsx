import React, { useEffect, useState } from 'react';
import './BeerList.css';
import searchIcon from '../assets/search-icon.svg'; // Importa el ícono de búsqueda
import likeIcon from  '../assets/like-icon.svg'; 

function BeerList() {
  const [search, setSearch] = useState('');
  const [beers, setBeers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/v1/beers')
      .then(response => response.json())
      .then(data => setBeers(data.beers))
      .catch(error => console.error('Error fetching beers:', error));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log(`Searching for beer with name: ${search}`);
  };

  return (
    <div className="container">
      <h1 className="title">Beers</h1>
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Enter a beer name" 
            className="search-input"
          />
          <button type="submit" className="search-button">
            <img src={searchIcon} alt="Search" />
          </button>
        </form>
      </div>
      <ul className="beer-list">
        {beers.map(beer => (
          <li key={beer.id} className="beer-item">
            <div className="beer-card">
              <div className="beer-image-placeholder">
                {/* Aquí puedes agregar la imagen de la cerveza */}
              </div>
              <div className="beer-info">
                <h2 className="beer-name">{beer.name}</h2>
                <p className="beer-manufacturer">{beer.manufacturer}</p>
                <p className="beer-description">{beer.description}</p>
              </div>
              <div className="beer-heart-placeholder">
              <img src={likeIcon} alt="Like" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BeerList;
