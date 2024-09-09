import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './BeerShow.css';
import RatingSlider from './RatingSlider.jsx';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const reviewValidationSchema = Yup.object().shape({
  text: Yup.string()
    .min(15, 'Review must contain at least 15 characters')
    .required('Review is required'),
  rating: Yup.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot be more than 5').required('Rating is required'),
});

function ReviewsForm({ beerId, onNewReview, toggleForm }) {
  return (
    <Formik
      initialValues={{ text: '', rating: 3 }}
      validationSchema={reviewValidationSchema}
      onSubmit={(values, { resetForm }) => {
        console.log('Submitting review:', values);
        onNewReview(values);
        resetForm(); // Limpiar el formulario
        toggleForm(); // Cerrar el formulario
      }}
    >
      {({ values, setFieldValue }) => (
        <Form className="reviews-form">
          <div>
            <Field as="textarea" id="reviewText" name="text" placeholder="Write your review" />
            <ErrorMessage name="text" component="div" className="error-message" />
          </div>

          {/* Contenedor para el slider con estilo de cuadro */}
          <div className="rating-container">
            <label htmlFor="reviewRating">Rating:</label>
            <RatingSlider
              rating={values.rating}
              setRating={(value) => setFieldValue('rating', value)} // Sincronizar con Formik
            />
            <ErrorMessage name="rating" component="div" className="error-message" />
          </div>

          <button type="submit">Submit Review</button>
          <button type="button" onClick={toggleForm}>
            Cancel
          </button>
        </Form>
      )}
    </Formik>
  );
}

const BeerShow = () => {
  const [beer, setBeer] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const actualUrl = window.location.href;
  const beerId = actualUrl.split('/')[4];
  const [currentUser, setCurrentUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/v1/users', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
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

  useEffect(() => {
    fetch('http://localhost:3001/api/v1/current_user', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setCurrentUser(data))
      .catch((error) => console.error('Error fetching current user:', error));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      console.error('No token found');
      return;
    }

    fetch(`http://localhost:3001/api/v1/beers/${beerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unauthorized');
        }
        return response.json();
      })
      .then((data) => setBeer(data))
      .catch((error) => console.error('Error fetching beer details:', error));
  }, [beerId]);

  useEffect(() => {
    fetch(`http://localhost:3001/api/v1/beers/${beerId}/reviews`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
      }
    }
    )
    .then(response => response.json())
    .then(data => setReviews(data))
    .catch(error => console.error('Error fetching reviews:', error));
  },[] );


  const handleNewReview = async (new_review) => {
    console.log('New review added:', new_review);
    try {
      const response = await fetch(`http://localhost:3001/api/v1/beers/${beerId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
        body: JSON.stringify({
          review: {
            text: new_review.text,
            rating: new_review.rating,
            beer_id: beerId,
            user_id: currentUser.id,
          },
        }),
      });

      if (response.ok) {
        setShowReviewForm(false);
        window.location.reload();
      } else {
        console.error('Error al agregar reseña:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching:', error);
    }
  };

  const toggleReviewForm = () => {
    setShowReviewForm(!showReviewForm); // Mostrar u ocultar el formulario de reseñas
  };

  if (!beer) return <div>Loading...</div>;

  return (
    <div className="container">
      {/* Contenedor del encabezado */}
      <div className="header">
        <h1 className="title">Beer Details</h1>
        <h2 className="beer-name">{beer.name}</h2>
      </div>

      {/* Cuadrado para la imagen */}
      <div className="beer-image-container">
        {beer.image_url ? (
          <img src={beer.image_url} alt={beer.name} className="beer-image" />
        ) : (
          <div className="image-placeholder">No Image Available</div>
        )}
      </div>

      {/* Cuadrado informativo */}
      <div className="beer-info-container">
        <ul className="beer-info-list">
          <li>
            <strong>Style:</strong> {beer.style}
          </li>
          <li>
            <strong>Hop:</strong> {beer.hop}
          </li>
          <li>
            <strong>Yeast:</strong> {beer.yeast}
          </li>
          <li>
            <strong>Malts:</strong> {beer.malts}
          </li>
          <li>
            <strong>IBU:</strong> {beer.ibu}
          </li>
          <li>
            <strong>Alcohol:</strong> {beer.alcohol}
          </li>
          <li>
            <strong>BLG:</strong> {beer.blg}
          </li>
          {beer.brand && beer.brand.brewery && (
            <li>
              <strong>Brewery:</strong> {beer.brand.brewery.name}
            </li>
          )}
          <li>
            <strong>Average Rating:</strong> {beer.avg_rating}
          </li>
        </ul>
      </div>

      {/* Botón para abrir el formulario de reseñas */}
      <div>
        <button type="button" onClick={toggleReviewForm}>
          {showReviewForm ? 'Close Review Form' : 'Add a Review'}
        </button>
      </div>

      {/* Sección completa de reseñas */}
      <div className="reviews-section">
        <h3>Reviews</h3>
        {Array.isArray(reviews.reviews) && (
          <table className="reviews-table">
            <thead>
              <tr>
                <th>Reviewer</th>
                <th>Rating</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {reviews.reviews.map((review, index) => (
                <tr key={index}>
                  <td>{usersById[review.user_id] ? `${usersById[review.user_id].first_name} ${usersById[review.user_id].last_name}` : "Anonymous"}</td>
                  <td>{review.rating}/5</td>
                  <td>{review.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Mostrar el formulario de reseñas si está abierto */}
        {showReviewForm && (
          <ReviewsForm beerId={beerId} onNewReview={handleNewReview} toggleForm={toggleReviewForm} />
        )}
      </div>

      {/* Botón para volver */}
      <div>
        <button type="button">
          <Link to="/beers" style={{ textDecoration: 'none', color: 'inherit' }}>
            Back
          </Link>
        </button>
      </div>
    </div>
  );
};

export default BeerShow;
