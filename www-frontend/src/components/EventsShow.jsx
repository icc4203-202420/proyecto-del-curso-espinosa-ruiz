import React, { useState, useEffect } from 'react';
import './EventsShow.css'; // Asegúrate de que el archivo CSS exista
import CheckInIcon from '../assets/b. Selected.svg';  // Asegúrate de que esta ruta sea correcta
import AddEvent from '../assets/masevento.svg'; // Botón para crear post
import { useNavigate } from 'react-router-dom'; // Actualización: usamos useNavigate en lugar de useHistory

function EventsShow() {
  const [event, setEvent] = useState(null);
  const [users, setUsers] = useState([]);
  const actualUrl = window.location.href;
  const eventId = actualUrl.split('/')[4];
  const token = localStorage.getItem('jwtToken');
  const [eventImage, setEventImage] = useState([]);
  const navigate = useNavigate();

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

  useEffect(() => {
    fetch(`http://localhost:3001/api/v1/events/${eventId}/get_event_images`, {
      headers: {
        Authorization: `Bearer ${token}`,
        method: 'GET',
      },
    })
      .then((response) => response.json())
      .then(data => {
        // Actualiza el estado con las URLs de las imágenes
        const imageUrls = data.event_pictures;
        setEventImage(imageUrls);
      })
      .catch((error) => console.error('Error fetching event images:', error));
      
  }, [eventId, token]);
console.log(JSON.stringify(eventImage));


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

  // Función para redirigir al componente de creación de post
  function handleAddEventPicture() {
    navigate(`/events/${eventId}/add-picture`); 
  }

  return (
    <div className="event-show">
      <h1 className="event-name">{event.name}</h1>

      {/* Botón para añadir evento (crear post) */}
      <button className="add-event-button" onClick={handleAddEventPicture}>
        <img src={AddEvent} alt="Add Event" />
      </button>

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

      {/* Galería de imágenes */}
      <div className="event-gallery">

        <h3>Event Gallery</h3>
        <div className="gallery-container">
          {eventImage && eventImage.length > 0 ? (
            eventImage.map((url, index) => (
              <div className="gallery-image" key={index}>
                <h3>Image {index + 1}</h3>
                <h4>Posted by {usersById[url.user_id].first_name} {usersById[url.user_id].last_name}</h4>
                <img key={index} src={url.url} alt={`Event Picture ${index + 1}`} />
                <p>{url.description}</p>
                <p>Tagged users: </p>
                {(url.tagged_users || []).map((taggedUser) => (
                  <span key={taggedUser.id} className="tagged-user">
                    {usersById[taggedUser].first_name} {usersById[taggedUser].last_name}
                  </span>
                
                ))}
              </div>
            ))
          ) : (
            <p>No images available for this event.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventsShow;
