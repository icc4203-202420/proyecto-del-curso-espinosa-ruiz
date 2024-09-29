import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, Button } from '@mui/material';
import './SharedStyles.css';
import './UserSearch.css';

function UserSearch() {
  const [search, setSearch] = useState('');   // Texto de búsqueda para usuarios
  const [eventSearch, setEventSearch] = useState(''); // Texto de búsqueda para eventos
  const [users, setUsers] = useState([]);     // Usuarios encontrados
  const [events, setEvents] = useState([]);   // Eventos encontrados
  const [selectedUser, setSelectedUser] = useState(null); // Usuario seleccionado
  const [selectedEvent, setSelectedEvent] = useState(null); // Evento seleccionado
  const [currentUser, setCurrentUser] = useState(null);   // Usuario actual
  const [friendshipCreated, setFriendshipCreated] = useState(false); // Controla si se creó la amistad

  // Obtener current_user al montar el componente
  useEffect(() => {
    const token = localStorage.getItem('jwtToken'); // Obtener el token desde localStorage

    if (!token) {
      console.error('No token found');
      return;
    }

    // Solicitud para obtener el current_user
    fetch('http://localhost:3001/api/v1/current_user', {
      headers: {
        'Authorization': `Bearer ${token}`, // Incluir el token en el encabezado
      }
    })
      .then(response => {
        if (response.status === 401) {
          throw new Error('Unauthorized - You need to sign in');
        }
        return response.json();
      })
      .then(data => {
        setCurrentUser(data);
        console.log("Current user:", data); // Verifica que los datos del usuario actual sean correctos
      })
      .catch(error => {
        console.error('Error fetching current user:', error);
      });
  }, []);

  // Obtener usuarios cuando la búsqueda tiene al menos 3 caracteres
  useEffect(() => {
    const token = localStorage.getItem('jwtToken'); // Obtener el token desde localStorage

    if (!token) {
      console.error('No token found');
      return;
    }

    if (search.length >= 3) {
      fetch('http://localhost:3001/api/v1/users', {
        headers: {
          'Authorization': `Bearer ${token}`, // Incluir el token en el encabezado
        }
      })
        .then(response => {
          if (response.status === 401) {
            throw new Error('Unauthorized - You need to sign in');
          }
          return response.json();
        })
        .then(data => setUsers(data)) // Asegúrate de asignar correctamente los usuarios
        .catch(error => console.error('Error fetching users:', error));
    }
  }, [search]);

  // Obtener eventos cuando la búsqueda tiene al menos 3 caracteres
  useEffect(() => {
    const token = localStorage.getItem('jwtToken'); // Obtener el token desde localStorage

    if (!token) {
      console.error('No token found');
      return;
    }

    if (eventSearch.length >= 3) {
      fetch('http://localhost:3001/api/v1/events', {
        headers: {
          'Authorization': `Bearer ${token}`, // Incluir el token en el encabezado
        }
      })
      .then(response => {
        if (response.status === 401) {
          throw new Error('Unauthorized - You need to sign in');
        }
        return response.json();
      })
      .then(data => {
        console.log('Eventos recibidos:', data); // Mostrar la respuesta de la API en la consola
        setEvents(data.events || []);  // Asegúrate de que `data.events` sea un array
      })
      .catch(error => console.error('Error fetching events:', error));
    }
  }, [eventSearch]);

  // Función para crear la amistad
  const handleCreateFriendship = () => {
    const token = localStorage.getItem('jwtToken'); // Obtener el token desde localStorage

    if (!token) {
      console.error('No token found');
      return;
    }

    if (selectedUser && currentUser) {
      fetch(`http://localhost:3001/api/v1/users/${currentUser.id}/friendships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Incluir el token en el encabezado
        },
        body: JSON.stringify({
          friendship: {
            friend_id: selectedUser.id,  // Enviar el friend_id dentro del objeto friendship
            event_id: selectedEvent ? selectedEvent.id : null  // Enviar el event_id seleccionado
          }
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Friendship creation failed: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);  // Verificar si el mensaje de éxito se recibe aquí
          setFriendshipCreated(true);  // Actualiza el estado de amistad creada
        })
        .catch((error) => console.error('Error creating friendship:', error));
    }
  };

  return (
    <div className="container">
      <h1 className="title">Search Users</h1>

      {/* Autocomplete para seleccionar usuarios */}
      <Autocomplete
        options={Array.isArray(users) ? users : []}  // Asegúrate de pasar un array como options
        getOptionLabel={(user) => user.handle || ""}  // Campo que se muestra
        inputValue={search}  // Vincular el inputValue a la búsqueda
        onInputChange={(event, newInputValue) => {
          console.log('User search input:', newInputValue);
          setSearch(newInputValue);
        }}  // Actualiza el valor de búsqueda
        onChange={(event, newUser) => {
          console.log('Usuario seleccionado:', newUser);
          setSelectedUser(newUser);
        }}  // Maneja la selección de usuario
        renderInput={(params) => (
          <TextField {...params} label="Search Users" variant="outlined" />
        )}
      />

      {/* Mostrar usuario seleccionado */}
      {selectedUser && (
        <div className="selected-user">
          <h3>User Selected: {selectedUser.handle}</h3>
        </div>
      )}

      <h1 className="title">Search Events</h1>

      {/* Autocomplete para seleccionar eventos */}
      <Autocomplete
        options={Array.isArray(events) ? events : []}  // Asegúrate de pasar un array como options
        getOptionLabel={(event) => event.name ? event.name : "Unnamed Event"}  // Mostrar `name` en lugar de `title`
        inputValue={eventSearch}  // Vincular el inputValue a la búsqueda
        onInputChange={(event, newInputValue) => {
          console.log('Event search input:', newInputValue);
          setEventSearch(newInputValue);
        }}  // Actualiza el valor de búsqueda de eventos
        onChange={(event, newEvent) => {
          console.log('Evento seleccionado:', newEvent);
          setSelectedEvent(newEvent);
        }}  // Maneja la selección de evento
        renderInput={(params) => (
          <TextField {...params} label="Search Events" variant="outlined" />
        )}
      />

      {/* Mostrar evento seleccionado */}
      {selectedEvent && (
        <div className="selected-event">
          <h3>Event Selected: {selectedEvent.name}</h3> {/* Mostrar el nombre del evento seleccionado */}
        </div>
      )}

      {/* Botón para crear la amistad */}
      {selectedUser && currentUser && (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleCreateFriendship} 
          className="create-friendship-button"
        >
          Add Friend
        </Button>
      )}

      {/* Mostrar confirmación de amistad creada */}
      {friendshipCreated && (
        <div className="friendship-confirmation">
          <p>Friendship created successfully!</p>
        </div>
      )}
    </div>
  );
}

export default UserSearch;
