import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar'; 
import Home from './components/Home';
import BeerList from './components/BeerList';
import BarList from './components/BarList';
import BarEvents from './components/BarEvents';
import UserSearch from './components/UserSearch';
import BeerShow from './components/BeerShow';
import Login from './components/Login';
import Register from './components/Register';
import EventsShow from './components/EventsShow';
import EventPicture from './components/EventsPicture'; // Importa tu componente para subir fotos
import { AuthProvider } from './components/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />  {/* Navbar is included here, so it appears on all pages */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/beers" element={<BeerList />} />
          <Route path="/beers/:id" element={<BeerShow />} />
          <Route path="/bars" element={<BarList />} />
          <Route path="/bars/:id/events" element={<BarEvents />} />
          <Route path="/user-search" element={<UserSearch />} />
          <Route path="/events/:id" element={<EventsShow />} />
          
          {/* Ruta para subir fotos al evento */}
          <Route path="/events/:id/add-picture" element={<EventPicture />} /> 

          <Route path="*" element={<div><h1>Page Not Found</h1></div>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
