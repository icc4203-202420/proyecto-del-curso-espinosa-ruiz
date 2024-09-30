import React, { useState, useEffect } from 'react';
import './EventsPicture.css';
import { useNavigate, useParams } from 'react-router-dom'; 

function EventPicture() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const { id: eventId } = useParams();
  const [currentUser, setCurrentUser] = useState(null); 
  const formData = new FormData();

  useEffect(() => {
    fetch('http://localhost:3001/api/v1/users') 
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
    
    let imageDataURL = canvas.toDataURL('png');

    canvas.toBlob(blob => {
    
      const timestamp = new Date().toISOString().replace(/[:\-T.]/g, '');
      const randomId = Math.random().toString(36).substring(2, 15);
      const filename = `Captured-${timestamp}-${randomId}.png`;
  
    
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
    setUserSearch('');
  };


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

      <div className="tag-users">
        <input
          type="text"
          className="tag-users-input"
          placeholder="Tag users"
          value={userSearch}
          onChange={handleUserSearch}
        />

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
