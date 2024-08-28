import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import menuIcon from '../assets/menu-icon.svg';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        onClick={toggleNavbar}
        className={`navbar-toggle ${isOpen ? 'hidden' : ''}`} // Añadimos la clase 'hidden' cuando el navbar está abierto
      >
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
            <Link to="/beers" onClick={toggleNavbar}>Beers</Link>
            <Link to="/bars" onClick={toggleNavbar}>Bars</Link>
            <Link to="/user-search" onClick={toggleNavbar}>Search Users</Link>
          </nav>
        </div>
      )}
    </>
  );
}

export default Navbar;
