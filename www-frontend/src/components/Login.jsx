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
      console.log(response);
      if (!response.ok) {
        throw new Error('Error en el inicio de sesión');
      }
  
      const data = await response.json();
      console.log('Inicio de sesión exitoso:', data);
      login(data.status.token)
      console.log(data.status.token)
      navigate('/');

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <div className="login-container">
      <h1 className="title">Welcome Back!</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <div>
          <label htmlFor="Email">Email:</label>
          <input
            type="text"
            id="Email"
            placeholder='Enter your email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            placeholder='Enter your password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
        <Link to="/register">Don't have an account? Register</Link>
      </form>
    </div>
  );
}

export default Login;
