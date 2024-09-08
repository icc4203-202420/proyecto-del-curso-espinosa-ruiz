import React, { useEffect, useState } from 'react';
import './BeerList.css';
import searchIcon from '../assets/search-icon.svg'; // Importa el ícono de búsqueda
import likeIcon from  '../assets/like-icon.svg'; 
import { Link, useNavigate } from 'react-router-dom';

function BeerList() {
  const [search, setSearch] = useState('');
  const [beers, setBeers] = useState([]);
  const [originalBeers, setOriginalBeers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('jwtToken'); // Obtener el token desde localStorage

    if (!token) {
      console.error('No token found, redirecting to login');
      navigate('/login'); // Redirigir al login si no hay token
      return;
    }

    fetch('http://localhost:3001/api/v1/beers', {
      headers: {
        'Authorization': `Bearer ${token}` // Incluir el token en las cabeceras
      }
    })
      .then(response => {
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized');
          }
          throw new Error('Error fetching beers');
        }
        return response.json();
      })
      .then(data => {
        setBeers(data.beers);
        setOriginalBeers(data.beers);
      })
      .catch(error => {
        console.error('Error fetching beers:', error);
        if (error.message === 'Unauthorized') {
          navigate('/login'); // Redirigir al login en caso de error 401
        }
      });
  }, [navigate]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!search.trim()) {
      setBeers(originalBeers);
      return;
    }

    const filteredBeers = originalBeers.filter(beer => beer.name.toLowerCase().includes(search.toLowerCase()));
    setBeers(filteredBeers);

    if (filteredBeers.length === 0) {
      console.log('No beers found with that name');
    }
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
                <h2 className="beer-name"><Link to={`/beers/${beer.id}`} >{beer.name}</Link></h2>
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
