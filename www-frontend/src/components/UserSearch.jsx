import React, { useEffect, useState } from 'react';
import './UserSearch.css' // Importa el archivo CSS compartido
import searchIcon from '../assets/search-icon.svg';

const fetchUserById = async (id) => {
  return fetch(`http://localhost:3001/api/v1/users/${id}`)
    .then(response => response.json())
    .then(data => data.user)  
    .catch(error => console.error('Error fetching user:', error));
}

const UserSearch = () => {
  const [userId, setUserId] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setError('');
    setUserInfo(null);
    // Aquí asumimos que tienes una función `fetchUserById` que hace la solicitud a tu API
    try {
      const data = await fetchUserById(userId);
      setUserInfo(data);
    } catch (err) {
      setError('Usuario no encontrado');
    }
  };

  return (
    <div className='user-card'>
      <div>
      <h1 className='title'>Buscar usuario</h1>
      <input
        type="text"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="Introduce el ID del usuario"
      />
      <button onClick={handleSearch}>Buscar</button>
      {error && <div>{error}</div>}
      {userInfo && <div>{JSON.stringify(userInfo)}</div>}
      </div>
    
    {userInfo && (
      <div className='user-info-card'>
        <h2>Información del Usuario</h2>
        <p><strong>ID:</strong> {userInfo.id}</p>
        <p><strong>Nombre:</strong> {userInfo.name}</p>
        <p><strong>Email:</strong> {userInfo.email}</p>
      </div>
    )}
    </div>
  );
};

export default UserSearch;
