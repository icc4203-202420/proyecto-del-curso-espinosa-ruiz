import React, { useState, useEffect } from 'react';
import './BarList.css';
import searchIcon from '../assets/search-icon.svg';

function BarList() {
  const [bars, setBars] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/v1/bars')
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
      <ul>
        {bars.map(bar => (
          <li key={bar.id}>{bar.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default BarList;
