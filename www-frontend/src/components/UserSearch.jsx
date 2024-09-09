import React, { useState } from 'react';
import './SharedStyles.css'; // Importa el archivo CSS compartido
import './UserSearch.css'
import searchIcon from '../assets/search-icon.svg';

function UserSearch() {
  const [search, setSearch] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log(`Searching for user with handle: ${search}`);
  };

  return (
    <div className="container">
      <h1 className="title">Search Users</h1>
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <input 
            type="text" 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Enter user handle" 
            className="search-input"
          />
          <button type="submit" className="search-button">
            <img src={searchIcon} alt="Search" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserSearch;
