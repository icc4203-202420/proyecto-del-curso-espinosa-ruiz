// src/components/Navbar.jsx
import React, { useState }  from 'react';
import { Link , useNavigate} from 'react-router-dom';
import { useAuth, AuthProvider } from '../components/AuthContext';
import './Navbar.css';
import menuIcon from '../assets/menu-icon.svg';



function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const {logout} = useAuth();
  const navigate = useNavigate();


  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout()
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
