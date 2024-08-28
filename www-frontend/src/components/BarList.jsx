import React, { useState, useEffect } from 'react';

function BarList() {
  const [bars, setBars] = useState([]);

  useEffect(() => {
    fetch('/api/v1/bars')
      .then(response => response.json())
      .then(data => setBars(data.bars))
      .catch(error => console.error('Error fetching bars:', error));
  }, []);

  return (
    <div>
      <h2>Bar List</h2>
      <ul>
        {bars.map(bar => (
          <li key={bar.id}>{bar.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default BarList;
