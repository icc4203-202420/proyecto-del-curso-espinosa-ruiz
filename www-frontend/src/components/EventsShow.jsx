import React, { useState, useEffect } from 'react';
import './EventsShow.css'; // Asegúrate de que los estilos están aquí.

function EventsShow() {
  const [event, setEvent] = useState(null);
  const [users, setUsers] = useState([]);
  const actualUrl = window.location.href;
  const eventId = actualUrl.split('/')[4];
  const token = localStorage.getItem('jwtToken');

  useEffect(() => {
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
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.error('Error checking in:', error);
      });
  }

  return (
    <div className="event-show">
      <h1 className="event-name">{event.name}</h1>
      <img className="event-image" src="/path/to/event-image.jpg" alt="Event" />
      <div className="attending-section">
        <label className="attending-label">
          <input type="checkbox" checked readOnly />
          Attending
        </label>
      </div>

      <div className="attendees">
        {event.attendances
          .filter((attendee) => attendee.checked_in)
          .map((attendee) => (
            <div className="attendee" key={attendee.id}>
              <span className="username">
                {usersById[attendee.user_id]
                  ? `${usersById[attendee.user_id].first_name} ${usersById[attendee.user_id].last_name}`
                  : 'Unknown'}
              </span>
              <input type="checkbox" checked className="checkmark" readOnly />
            </div>
          ))}
      </div>
    </div>
  );
}

export default EventsShow;
