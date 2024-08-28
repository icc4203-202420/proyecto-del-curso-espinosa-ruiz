import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function BarEvents() {
  const { id } = useParams();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch(`/api/v1/bar/${id}/events`)
      .then(response => response.json())
      .then(data => setEvents(data.events))
      .catch(error => console.error('Error fetching events:', error));
  }, [id]);

  return (
    <div>
      <h2>Events at Bar {id}</h2>
      <ul>
        {events.map(event => (
          <li key={event.id}>{event.name} - {event.date}</li>
        ))}
      </ul>
    </div>
  );
}

export default BarEvents;
