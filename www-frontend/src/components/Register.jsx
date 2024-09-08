import React from 'react';
import './Register.css'; // Asegúrate de que la ruta sea correcta
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Esquema de validación con Yup
const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  username: yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup
    .string() 
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Confirm password is required'),
});

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            handle: data.username,
            email: data.email,
            password: data.password,
            password_confirmation: data.confirmPassword,
            last_name: data.lastName,
            first_name: data.firstName,
            address_attributes: {
              line1: data.addressLine1,
              line2: data.addressLine2,
              city: data.city,
            },
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error en el registro: ${errorData.status.message}`);
      }

      const responseData = await response.json();
      console.log('Registro exitoso:', responseData);

      if (responseData && responseData.token) {
        // Inicia sesión automáticamente después del registro
        login(responseData.token);

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
      <form onSubmit={handleSubmit(onSubmit)} className="register-form">
        <div>
          <label htmlFor="first_name">First Name</label>
          <input
            type="text"
            id="first_name"
            placeholder="Enter your Name"
            {...register('firstName')}
          />
          <p>{errors.firstName?.message}</p>
        </div>
        <div>
          <label htmlFor="last_name">Last Name</label>
          <input
            type="text"
            id="last_name"
            placeholder="Enter your last name"
            {...register('lastName')}
          />
          <p>{errors.lastName?.message}</p>
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            {...register('email')}
          />
          <p>{errors.email?.message}</p>
        </div>
        <div>
          <label htmlFor="handle">Username</label>
          <input
            type="text"
            id="handle"
            placeholder="Enter your Username"
            {...register('username')}
          />
          <p>{errors.username?.message}</p>
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your Password"
            {...register('password')}
          />
          <p>{errors.password?.message}</p>
        </div>
        <div>
          <label htmlFor="confirm_password">Confirm Password</label>
          <input
            type="password"
            id="confirm_password"
            placeholder="Repeat your Password"
            {...register('confirmPassword')}
          />
          <p>{errors.confirmPassword?.message}</p>
        </div>

        {/* Address section */}
        <p className="address-info">Address information <span className="optional">(optional)</span></p>
        <div className="address-container">
          <input
            type="text"
            id="address_line1"
            placeholder="Line 1"
            {...register('addressLine1')}
          />
          <input
            type="text"
            id="address_line2"
            placeholder="Line 2"
            {...register('addressLine2')}
          />
        </div>
        <div>
          <input
            type="text"
            id="city"
            placeholder="City"
            {...register('city')}
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default Register;
