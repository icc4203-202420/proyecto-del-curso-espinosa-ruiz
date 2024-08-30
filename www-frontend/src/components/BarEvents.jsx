import React from 'react';
import { Link } from 'react-router-dom';
import './BarEvents.css';
import Divider from '../assets/divider.svg';
import likeIcon from  '../assets/like-icon.svg'; 
import { useEffect, useState } from 'react';

function BarEvents() {
  const [events, setEvents] = useState([]);
  const [barName, setbarName] = useState([]);
  const actualUrl = window.location.href;
  const barId = actualUrl.split('/')[4];


  useEffect(() => {
    fetch(`http://localhost:3001/api/v1/bars/${barId}`)
      .then(response => response.json())
      .then(data => {
        setbarName(data.bar.name);
      })
      .catch(error => console.error('Error fetching bar:', error));
  }, [barId]);

  useEffect(() => {
    fetch('http://localhost:3001/api/v1/events')
      .then(response => response.json())
      .then(data => {
        // Filtrar eventos por barId después de cargarlos
        const filteredEvents = data.events.filter(event => event.bar_id == barId);
        setEvents(filteredEvents);
      })
      .catch(error => console.error('Error fetching events:', error));
  }, [barId]);


  return (
    <div className="bar-events">
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
              <a href="#menu" className="event-link">CARTA</a>
              <a href="#info" className="event-link">INFO</a>
            </div>
            <img src={likeIcon} alt="Like" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BarEvents;
