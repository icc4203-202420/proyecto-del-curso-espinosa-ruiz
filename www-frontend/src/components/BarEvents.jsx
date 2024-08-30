import React from 'react';
import { Link } from 'react-router-dom';
import './BarEvents.css';
import Divider from '../assets/divider.svg';
import likeIcon from  '../assets/like-icon.svg'; 

function BarEvents({ barName }) {
  // Datos de ejemplo para los eventos
  const events = [
    {
      id: 1,
      name: 'Live Music Night',
      date: '2024-09-01',
      description: 'Join us for an amazing live music night!',
    },
    {
      id: 2,
      name: 'Karaoke Friday',
      date: '2024-09-08',
      description: 'Show off your singing talent at our karaoke event!',
    },
    {
      id: 3,
      name: 'Comedy Show',
      date: '2024-09-15',
      description: 'Get ready for a night full of laughter with our comedy show!',
    },
  ];

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
