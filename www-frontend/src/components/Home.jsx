import React, { useEffect, useState } from 'react';
import './SharedStyles.css';

function Home() {
  const [currentUser, setCurrentUser] = useState(null);

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

  return (
    <div>
      <h1 className='title'>Welcome to Beer App, {currentUser?.handle}</h1>
    </div>
  );
}

export default Home;
