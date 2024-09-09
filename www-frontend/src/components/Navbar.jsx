import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext'; // Asegúrate de que useAuth funcione correctamente
import './Navbar.css';
import menuIcon from '../assets/menu-icon.svg';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const token = localStorage.getItem('jwtToken'); // Usa la misma clave para el token
    if (token) {
      fetch('http://localhost:3001/api/v1/current_user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(data => setCurrentUser(data))
        .catch(error => console.error('Error fetching user details:', error));
    } else {
      setCurrentUser(null); // Si no hay token, no hay usuario
    }
  }, [isAuthenticated]); // Escucha el cambio en isAuthenticated

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/logout', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`, // Usa la clave correcta
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        logout(); // Este método debe estar en tu AuthContext
        navigate('/login');
      } else {
        console.error('Error en el logout:', await response.json());
        console.log(localStorage.getItem('jwtToken'));
      }
    } catch (error) {
      console.error('Error al intentar cerrar sesión:', error);
    }
  };

  return (
    <>
      <button onClick={toggleNavbar} className={`navbar-toggle ${isOpen ? 'hidden' : ''}`}>
        <img src={menuIcon} alt="Menu" />
      </button>
      {isOpen && (
        <div className="navbar-container">
          <div className="menu-header">
            <h2>Menu</h2>
            <button onClick={toggleNavbar} className="close-navbar">
              <img src={menuIcon} alt="Close Menu" />
            </button>
          </div>
          <nav className="navbar">
            <Link to="/" onClick={toggleNavbar}>Home</Link>
            {isAuthenticated? (
              <>
                <Link to="/user-search" onClick={toggleNavbar}>Search Users</Link>
                <Link to="/beers" onClick={toggleNavbar}>Beers</Link>
                <Link to="/bars" onClick={toggleNavbar}>Bars</Link>
                <button onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={toggleNavbar}>Login</Link>
                <Link to="/register" onClick={toggleNavbar}>Register</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}

export default Navbar;
