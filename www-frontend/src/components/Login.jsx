import React, { useState } from 'react';
import './Login.css'; 
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const response = await fetch('http://localhost:3001/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user:{
          email: email,
          password: password,
        }
        }),
      });
  
      if (!response.ok) {
        throw new Error('Error en el inicio de sesión');
      }
  
      const data = await response.json();
      console.log('Inicio de sesión exitoso:', data);
      login(data.token)
      navigate('/');
      // Aquí puedes almacenar el token de acceso en localStorage, por ejemplo:
      
      // Y luego redirigir al usuario o cambiar el estado de la aplicación
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <div>
          <label htmlFor="Email">Email:</label>
          <input
            type="text"
            id="Email"
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
        <button type="submit">Login</button>
        <p></p>
        <button type="button">
        <Link to="/register" style={{ textDecoration: 'none', color: 'inherit' }}>
            Register
        </Link>
        </button>
      </form>
    </div>
  );
}

export default Login;