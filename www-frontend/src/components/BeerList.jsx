import React, { useState, useEffect } from 'react';

function BeerList() {
  const [beers, setBeers] = useState([]);

  useEffect(() => {
    fetch('/api/v1/beers')
      .then(response => response.json())
      .then(data => setBeers(data.beers))
      .catch(error => console.error('Error fetching beers:', error));
  }, []);

  return (
    <div>
      <h2>Beer List</h2>
      <ul>
        {beers.map(beer => (
          <li key={beer.id}>{beer.name} - {beer.style}</li>
        ))}
      </ul>
    </div>
  );
}

export default BeerList;
