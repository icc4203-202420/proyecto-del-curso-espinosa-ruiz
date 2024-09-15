import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';


function EventsShow(){
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
          .catch((error) => console.error('Error fetching current user:', error));
      }, []);
      
      const usersById = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});
      console.log(JSON.stringify(usersById));
    
    useEffect(() => {
        fetch(`http://localhost:3001/api/v1/events/${eventId}`, {
            headers: {
              'Authorization': `Bearer ${token}`, 
            }
          })
        .then(response => {
            if (!response.ok) {
            throw new Error('Error fetching event');
            }
            return response.json();
        })
        .then(data => {
            setEvent(data.event);
        })
        .catch(error => {
            console.error('Error fetching event:', error);
        });
    }, [eventId]);
    
    if (!event) {
        return <p>Loading event...</p>;
    }


    function handleCheckIn(){
        fetch(`http://localhost:3001/api/v1/events/${eventId}/mark_assistance`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error checking in');
            }
            return response.json();
        })
        .then(data => {
            console.log('Check-in successful', data);
            window.location.reload(); // Esto recargará la página
        })
        .catch(error => {
            console.error('Error checking in:', error);
        });

    }
    

    
    return (
        <div className="event-show">
        <h2>{event.name}</h2>
        <p>{event.description}</p>
        <p>Date: {event.date}</p>
        <p>Description: {event.description}</p>
        {/* <Link to={`/events/${eventId}/edit`}>Edit</Link> */}
        <p></p>
        <button onClick={handleCheckIn}>Check-in</button>
        <div>
            <ul>
                <li>Attendees:</li>
                {event.attendances.filter(attendee => attendee.checked_in).map(attendee => (
                <li key={attendee.id}>{usersById[attendee.user_id] ? usersById[attendee.user_id].first_name : 'Unknown'} {usersById[attendee.user_id] ? usersById[attendee.user_id].last_name : 'Unknown'}</li>
                ))}
            </ul>
        </div>
        </div>
    );
    }


export default EventsShow;



