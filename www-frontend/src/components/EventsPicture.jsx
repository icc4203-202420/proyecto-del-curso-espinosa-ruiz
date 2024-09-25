import React, { useState, useEffect } from 'react';
import './EventsPicture.css'; // Importa el archivo CSS
import { useNavigate, useParams } from 'react-router-dom'; // Importamos useNavigate y useParams para manejar la navegación y obtener el ID del evento

function EventPicture() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate(); // Hook para navegar
  const { id: eventId } = useParams(); // Obtener el ID del evento desde los parámetros de la URL

  // Simulando la búsqueda de usuarios desde una API o base de datos
  useEffect(() => {
    fetch('http://localhost:3001/api/v1/users') // Ajusta esta URL a tu API de usuarios
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error('Error fetching users:', error));
  }, []);

  const handleImageChange = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleUserSearch = (e) => {
    setUserSearch(e.target.value);
  };

  const handleTagUser = (user) => {
    if (!taggedUsers.includes(user)) {
      setTaggedUsers([...taggedUsers, user]);
    }
    setUserSearch(''); // Limpia el campo de búsqueda
  };

  // Redirigir al evento original al hacer clic en "Share post"
  const handleSubmit = (e) => {
    e.preventDefault();
    // Redirigir al evento original
    navigate(`/events/${eventId}`);
  };

  // Filtrar usuarios por lo que el usuario está escribiendo en el campo de búsqueda
  const filteredUsers = users.filter((user) =>
    user.handle.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="event-picture-container">
      <h1 className="title">Events</h1>
      <div className="picture-space">
        {image ? (
          <img src={image} alt="Uploaded" className="uploaded-image" />
        ) : (
          <div className="placeholder-text">picture space</div>
        )}
        <input type="file" onChange={handleImageChange} className="upload-input" />
      </div>

      <textarea
        className="description-input"
        placeholder="add photo description description"
        value={description}
        onChange={handleDescriptionChange}
      />

      {/* Campo de búsqueda para etiquetar usuarios */}
      <div className="tag-users">
        <input
          type="text"
          className="tag-users-input"
          placeholder="Tag users"
          value={userSearch}
          onChange={handleUserSearch}
        />

        {/* Mostrar sugerencias solo si hay algo en el campo de búsqueda y hay coincidencias */}
        {userSearch && filteredUsers.length > 0 && (
          <ul className="user-suggestions">
            {filteredUsers.map((user) => (
              <li key={user.id} onClick={() => handleTagUser(user)}>
                {user.handle}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Muestra los usuarios etiquetados */}
      <div className="tagged-users">
        {taggedUsers.map((user, index) => (
          <span key={index} className="tagged-user">
            {user.handle}
          </span>
        ))}
      </div>

      <button className="share-post-button" onClick={handleSubmit}>
        Share post
      </button>
    </div>
  );
}

export default EventPicture;
