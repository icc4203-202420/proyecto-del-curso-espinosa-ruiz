import React, { useState } from 'react';
import './Register.css'; // Asegúrate de que la ruta sea correcta
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validación de contraseñas
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Validación de campos vacíos
    if (!username || !email || !password || !confirmPassword || !firstName || !lastName) {
      alert('Por favor completa todos los campos');
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
            password_confirmation: confirmPassword,
            last_name: lastName,
            first_name: firstName,
            address_attributes: {
              line1: addressLine1,
              line2: addressLine2,
              city: city,
            },
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error en el registro: ${errorData.status.message}`);
      }

      const data = await response.json();
      console.log('Registro exitoso:', data);

      // Verifica que el token esté presente en la respuesta antes de usarlo
      if (data && data.token) {
        // Inicia sesión automáticamente después del registro
        login(data.token);

        // Redirige a la página principal después del registro
        navigate('/');
      } else {
        throw new Error('Token no encontrado en la respuesta');
      }
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      alert(`Error al registrar el usuario: ${error.message}`);
    }
  };

  return (
    <div className="register-container">
      <h1 className="title">Pleasure to meet you!</h1>
      <h1 className="title">Tell me about yourself</h1>
      <form onSubmit={handleSubmit} className="register-form">
        <div>
          <label htmlFor="first_name">First Name</label>
          <input
            type="text"
            id="first_name"
            placeholder="Enter your Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="last_name">Last Name</label>
          <input
            type="text"
            id="last_name"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="handle">Username</label>
          <input
            type="text"
            id="handle"
            placeholder="Enter your Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="confirm_password">Confirm Password</label>
          <input
            type="password"
            id="confirm_password"
            placeholder="Repeat your Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {/* Address section */}
        <p className="address-info">Address information <span className="optional">(optional)</span></p>
        <div className="address-container">
          <input
            type="text"
            id="address_line1"
            placeholder="Line 1"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
          />
          <input
            type="text"
            id="address_line2"
            placeholder="Line 2"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
          />
        </div>
        <div>
          <input
            type="text"
            id="city"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default Register;
