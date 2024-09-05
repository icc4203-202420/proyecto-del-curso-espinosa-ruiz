import React, { useState } from 'react';
import './Register.css'; // Asegúrate de que la ruta sea correcta
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate(); 
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [last_name, setLastName] = useState('');
  const [first_name, setFirstName] = useState('');
  const [age, setAge] = useState('');

  const handleBack = () => {
    navigate(-1); // Esto llevará al usuario a la página anterior
    // O puedes usar navigate('/ruta-especifica') para llevar al usuario a una ruta específica
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3001/api/v1/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user: {
                handle: username,
                email: email,
                password: password,
                last_name: last_name,
                first_name: first_name,
                age: age,
                address_attributes:{
                    line1: "Calle Falsa 123",
                    city: "Santiago",
                    country_id: 2
                }
        }
        }),
      });
  
      if (!response.ok) {
        throw new Error('Algo salió mal con la solicitud');
      }
  
      const data = await response.json();
      console.log('Usuario registrado con éxito:', data);

      navigate('/login')
      
      // Aquí podrías redirigir al usuario o limpiar el formulario
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="Handle"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="first_name">first_name:</label>
          <input
            type="text"
            id="first_name"
            value={first_name}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="last_name">last_name:</label>
          <input
            type="text"
            id="last_name"
            value={last_name}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div>
        <label htmlFor="age">Age:</label>
          <input
            type="text"
            id="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div>
        <button type="submit">Register</button>
        </div>
        <div>
            <button type='button' onClick={handleBack}>Back</button>
        </div>
      </form>
    </div>
  );
}

export default Register;