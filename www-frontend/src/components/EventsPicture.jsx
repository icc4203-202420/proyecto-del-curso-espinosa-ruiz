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
  const [currentUser, setCurrentUser] = useState(null); 
  const formData = new FormData();

  // Simulando la búsqueda de usuarios desde una API o base de datos
  useEffect(() => {
    fetch('http://localhost:3001/api/v1/users') // Ajusta esta URL a tu API de usuarios
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error('Error fetching users:', error));
  }, []);


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(URL.createObjectURL(file));
    console.log(file);
  };
  
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  useEffect(() => {
    // Solicitar acceso a la cámara
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        let video = document.getElementById('video');
        video.srcObject = stream;
      })
      .catch(err => {
        console.error("Error accessing the camera", err);
      });
  }, []);
  
  const captureImage = () => {
    let canvas = document.getElementById('canvas');
    let context = canvas.getContext('2d');
    let video = document.getElementById('video');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Aquí puedes convertir la imagen del canvas a un formato que necesites
    let imageDataURL = canvas.toDataURL('png');
    
    // Por ejemplo, actualizar el estado con la imagen capturada
    canvas.toBlob(blob => {
      // Generar un nombre de archivo único
      const timestamp = new Date().toISOString().replace(/[:\-T.]/g, '');
      const randomId = Math.random().toString(36).substring(2, 15);
      const filename = `Captured-${timestamp}-${randomId}.png`;
  
      // Crear un objeto File a partir del Blob con el nombre de archivo único
      const file = new File([blob], filename, { type: "image/png", lastModified: new Date().getTime(), identity: false });
  
      setImage(URL.createObjectURL(file));
      console.log(file);
    }, 'image/png');
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
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput && fileInput.files[0]) {
      formData.append('picture', fileInput.files[0]);
    }
    formData.append('tagged_users', JSON.stringify(taggedUsers.map((user) => user.id)));
    formData.append('description', description);
    fetch(`http://localhost:3001/api/v1/events/${eventId}/upload_event_image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Event picture uploaded:', data);
      })
      .catch((error) => console.error('Error uploading event picture:', error));

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
          <div>
          <video id="video" width="300" height="300" autoPlay></video>
          <button onClick={captureImage}>Capture Image</button>
          <canvas id="canvas" width="300" height="300" style={{display: 'none'}}></canvas>
        </div>
        )}
            <input type="file" accept="image/*" capture="camera" data-direct-upload-url="<%= rails_direct_uploads_url %>" onChange={handleImageChange} className="upload-input" />

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
