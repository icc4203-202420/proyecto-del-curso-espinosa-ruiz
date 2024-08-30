import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './BarList.css';
import searchIcon from '../assets/search-icon.svg';

function BarList() {
  const [bars, setBars] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/api/v1/bars')
      .then(response => response.json())
      .then(data => setBars(data.bars))
      .catch(error => console.error('Error fetching bars:', error));
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
        {bars.map(bar => (
          <li key={bar.id} className="bar-item">
            <div className="bar-card">
              <div className="bar-image-placeholder"></div>
              <div className="bar-info">
                <h2 className="bar-name">{bar.name}</h2>
                <p className="bar-location">{bar.location || 'Location not available'}</p>
                <p className="bar-description">{bar.description || 'No description available'}</p>
              </div>
              <Link to={`/bars/${bar.id}/events`} className="events-button">
                View Events
              </Link>

            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BarList;
