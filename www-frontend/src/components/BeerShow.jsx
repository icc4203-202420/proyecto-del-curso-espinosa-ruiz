import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './BeerShow.css';

function ReviewsForm({ beerId, onNewReview, toggleForm }) {
  const [text, setText] = useState('');
  const [rating, setRating] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting review:', { beerId, text, rating });
    onNewReview({ text, rating, beerId });
    setText('');
    setRating('');
    toggleForm(); // Ocultar el formulario después de enviar la reseña
  };

  return (
    <form onSubmit={handleSubmit} className="reviews-form">
      <div>
        <label htmlFor="reviewText">Review:</label>
        <textarea id="reviewText" value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div>
        <label htmlFor="reviewRating">Rating:</label>
        <input type="number" id="reviewRating" value={rating} onChange={(e) => setRating(e.target.value)} />
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

  useEffect(() => {
    const token = localStorage.getItem('authToken');

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

  const handleNewReview = (review) => {
    console.log('New review added:', review);
    setBeer({
      ...beer,
      reviews: [...beer.reviews, review] // Añadir la nueva reseña a la lista de reseñas existentes
    });
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
          <li><strong>Style:</strong> {beer.style}</li>
          <li><strong>Hop:</strong> {beer.hop}</li>
          <li><strong>Yeast:</strong> {beer.yeast}</li>
          <li><strong>Malts:</strong> {beer.malts}</li>
          <li><strong>IBU:</strong> {beer.ibu}</li>
          <li><strong>Alcohol:</strong> {beer.alcohol}</li>
          <li><strong>BLG:</strong> {beer.blg}</li>
          {beer.brand && beer.brand.brewery && <li><strong>Brewery:</strong> {beer.brand.brewery.name}</li>}
        </ul>
      </div>

      {/* Botón para abrir el formulario de reseñas */}
      <div>
        <button type="button" onClick={toggleReviewForm}>
          {showReviewForm ? "Close Review Form" : "Add a Review"}
        </button>
      </div>

      {/* Mostrar el formulario de reseñas si está abierto */}
      {showReviewForm && <ReviewsForm beerId={beerId} onNewReview={handleNewReview} toggleForm={toggleReviewForm} />}

      {/* Tabla de reseñas */}
      <div className="reviews-table-container">
        <h3>Reviews</h3>
        {beer.reviews && beer.reviews.length > 0 ? (
          <table className="reviews-table">
            <thead>
              <tr>
                <th>Reviewer</th>
                <th>Rating</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {beer.reviews.map((review, index) => (
                <tr key={index}>
                  <td>{review.user ? review.user.name : "Anonymous"}</td>
                  <td>{review.rating}/5</td>
                  <td>{review.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No reviews yet.</p>
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
