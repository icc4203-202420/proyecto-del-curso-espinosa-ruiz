import React, { useState, useEffect } from 'react';
import './EventsShow.css'; // Asegúrate de que el archivo CSS existe
import CheckInIcon from '../assets/b. Selected.svg';  // Asegúrate de que esta ruta sea correcta

function EventsShow() {
  const [event, setEvent] = useState(null);
  const [users, setUsers] = useState([]);
  const actualUrl = window.location.href;
  const eventId = actualUrl.split('/')[4];
  const token = localStorage.getItem('jwtToken');

  useEffect(() => {
    // Obtener todos los usuarios
    fetch('http://localhost:3001/api/v1/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error('Error fetching users:', error));
  }, [token]);

  const usersById = users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {});

  useEffect(() => {
    // Obtener los detalles del evento
    fetch(`http://localhost:3001/api/v1/events/${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error fetching event');
        }
        return response.json();
      })
      .then((data) => setEvent(data.event))
      .catch((error) => console.error('Error fetching event:', error));
  }, [eventId, token]);

  if (!event) {
    return <p>Loading event...</p>;
  }

  // Función para marcar asistencia
  function handleCheckIn() {
    fetch(`http://localhost:3001/api/v1/events/${eventId}/mark_assistance`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error checking in');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Check-in successful', data);
        window.location.reload(); // Esto recargará la página
      })
      .catch((error) => {
        console.error('Error checking in:', error);
      });
  }

  return (
    <div className="event-show">
      <h1 className="event-name">{event.name}</h1>

      {/* Contenedor de la imagen del evento */}
      <div className="event-image-container">
        <img className="event-image" src="/path/to/event-image.jpg" alt="Event" />
      </div>

      {/* Lista de asistentes que han hecho check-in */}
      <div className="attendees">
        <h3>Attendees:</h3>
        {event.attendances
          .filter((attendee) => attendee.checked_in)
          .map((attendee) => (
            <div className="attendee" key={attendee.id}>
              <span className="username">
                {usersById[attendee.user_id]
                  ? `${usersById[attendee.user_id].first_name} ${usersById[attendee.user_id].last_name}`
                  : 'Unknown'}
              </span>
              <input
                type="checkbox"
                checked={true} // Los usuarios que aparecen aquí ya han hecho check-in
                className="checkmark"
                readOnly
              />
            </div>
          ))}
      </div>

      {/* Botón de asistencia */}
      <div className="attending-section">
        <button className="attending-button" onClick={handleCheckIn}>
          <img src={CheckInIcon} alt="Check-in" />
        </button>
      </div>
    </div>
  );    
}

export default EventsShow;
