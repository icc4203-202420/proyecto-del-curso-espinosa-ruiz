import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './BeerShow.css';
import RatingSlider from './RatingSlider.jsx';

function ReviewsForm({ beerId, onNewReview, toggleForm }) {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(3); // Valor inicial del slider

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting review:', { beerId, text, rating });
    onNewReview({ text, rating, beerId });
    setText('');
    setRating(3); // Restablecer a valor predeterminado después de enviar
    toggleForm(); // Ocultar el formulario después de enviar la reseña
  };

  return (
    <form onSubmit={handleSubmit} className="reviews-form">
      <div>
        <textarea
          id="reviewText"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your review"
        />
      </div>

      {/* Contenedor para el slider con estilo de cuadro */}
      <div className="rating-container">
        <label htmlFor="reviewRating">Rating:</label>
        <RatingSlider rating={rating} setRating={setRating} />
      </div>

      <button type="submit">Submit Review</button>
      <button type="button" onClick={toggleForm}>Cancel</button>
    </form>
  );
}

const BeerShow = () => {
  const [beer, setBeer] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const actualUrl = window.location.href;
  const beerId = actualUrl.split('/')[4];
  const [currentUser, setCurrentUser] = useState(null);
  const [reviews, setReviews] = useState([]);



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
        {reviews && reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} className="review-box">
              <p>
                <strong>Reviewer:</strong> {review.user ? review.user.name : 'Anonymous'}
              </p>
              <p>
                <strong>Rating:</strong> {review.rating}/5
              </p>
              <p>
                <strong>Review:</strong> {review.text}
              </p>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
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
