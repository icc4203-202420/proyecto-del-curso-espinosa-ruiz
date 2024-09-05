// src/components/Navbar.jsx
import React, { useState, useEffect }  from 'react';
import { Link , useNavigate} from 'react-router-dom';
import { useAuth, AuthProvider } from '../components/AuthContext';
import './Navbar.css';
import menuIcon from '../assets/menu-icon.svg';



function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);



  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    fetch('http://localhost:3001/api/v1/current_user', {
      Authorization: localStorage.getItem('authToken') ? 'include' : 'same-origin', 
    })
      .then(response => response.json())
      .then(data => setCurrentUser(data))
      .catch(error => console.error('Error fetching user details:', error));
  }, []); 

  const handleLogout = () => {
    const response = fetch('http://localhost:3001/api/v1/logout', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          user:{
        email: currentUser.email,
        password: currentUser.password,
      }
      }),
    });
    toggleNavbar();
    navigate('/login');
  }

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
            {isAuthenticated ? (
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
