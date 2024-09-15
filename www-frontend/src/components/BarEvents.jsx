import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './BarEvents.css';
import Divider from '../assets/divider.svg';
import likeIcon from '../assets/like-icon.svg'; 
import backIcon from '../assets/back-icon.svg';

function BarEvents() {
  const [events, setEvents] = useState([]);
  const [barName, setBarName] = useState('');
  const actualUrl = window.location.href;
  const barId = actualUrl.split('/')[4];

  useEffect(() => {
    const token = localStorage.getItem('jwtToken'); // Obtener el token desde localStorage

    if (!token) {
      console.error('No token found');
      return;
    }

    fetch(`http://localhost:3001/api/v1/bars/${barId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Incluir el token en la cabecera
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Unauthorized');
        }
        return response.json();
      })
      .then(data => {
        setBarName(data.bar.name);
      })
      .catch(error => console.error('Error fetching bar:', error));
  }, [barId]);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken'); // Obtener el token desde localStorage

    if (!token) {
      console.error('No token found');
      return;
    }

    fetch('http://localhost:3001/api/v1/events', {
      headers: {
        Authorization: `Bearer ${token}`, // Incluir el token en la cabecera
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Unauthorized');
        }
        return response.json();
      })
      .then(data => {
        // Filtrar eventos por barId después de cargarlos
        const filteredEvents = data.events.filter(event => event.bar_id === parseInt(barId, 10));
        setEvents(filteredEvents);
      })
      .catch(error => console.error('Error fetching events:', error));
  }, [barId]);

  return (
    <div className="bar-events">
      <div className="back-button-container">
        <Link to="/bars">
          <img src={backIcon} alt="Back" />
        </Link>
      </div>

      <h2 className="events-title">Future events at: {barName}</h2>
      <img src={Divider} alt="Divider" />
      <ul className="events-list">
        {events.map(event => (
          <li key={event.id} className="event-item">
            <div className="event-content">
              <div className="event-icon">🎤</div>
              <div>
                <h3 className="event-name">{event.name}</h3>
                <p className="event-date">{event.date}</p>
                <p className="event-description">{event.description}</p>
              </div>
            </div>
            <div className="event-actions">
              <a href={`http://localhost:3000/events/${event.id}`} className="event-link">INFO</a>
            </div>
            <img src={likeIcon} alt="Like" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BarEvents;
