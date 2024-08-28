import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar'; 
import Home from './components/Home';
import BeerList from './components/BeerList';
import BarList from './components/BarList';
import BarEvents from './components/BarEvents';
import UserSearch from './components/UserSearch';

function App() {
  return (
    <Router>
      <Navbar />  {/* Navbar is included here, so it appears on all pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/beers" element={<BeerList />} />
        <Route path="/bars" element={<BarList />} />
        <Route path="/bars/:id/events" element={<BarEvents />} />
        <Route path="/user-search" element={<UserSearch />} />
        <Route path="*" element={<div><h1>Page Not Found</h1></div>} />
      </Routes>
    </Router>
  );
}

export default App;
