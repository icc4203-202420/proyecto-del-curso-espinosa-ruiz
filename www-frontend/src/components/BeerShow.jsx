import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import './BeerShow.css';

function ReviewsForm({ beerId, onNewReview }) {
    const [text, setText] = useState('');
    const [rating, setRating] = useState('');
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      // Aquí deberías enviar la reseña a tu API
      // Por ejemplo: axios.post('/api/reviews', { beerId, text, rating })
      console.log('Submitting review:', { beerId, text, rating });
      // Llamar a onNewReview para actualizar la lista de reseñas en el componente padre
      onNewReview({ text, rating, beerId });
      // Limpiar el formulario
      setText('');
      setRating('');
    };
  
    return (
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="reviewText">Review:</label>
          <textarea id="reviewText" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div>
          <label htmlFor="reviewRating">Rating:</label>
          <input type="number" id="reviewRating" value={rating} onChange={(e) => setRating(e.target.value)} />
        </div>
        <button type="submit">Submit Review</button>
      </form>
    );
  }

const BeerShow = () => {
  const [beer, setBeer] = useState(null);
  const actualUrl = window.location.href;
  const beerId = actualUrl.split('/')[4];

  useEffect(() => {
    fetch(`http://localhost:3001/api/v1/beers/${beerId}`)
      .then(response => response.json())
      .then(data => setBeer(data))
      .catch(error => console.error('Error fetching beer details:', error));
  }, [beerId]);

  const handleNewReview = (review) => {
    // Aquí deberías actualizar el estado para incluir la nueva reseña
    console.log('New review added:', review);
  };

  if (!beer) return <div>Loading...</div>;

  return (
    <div className="container">
    <div>
        <h1 className="title">Beer Details</h1>
    </div>
    <div className="beer-details">
        <h2>{beer.name}</h2>
        {beer.image_url && <img src={beer.image_url} alt={beer.name} className="beer-image" />}
        <p><strong>Style:</strong> {beer.style}</p>
        <p><strong>Hop:</strong> {beer.hop}</p>
        <p><strong>Yeast:</strong> {beer.yeast}</p>
        <p><strong>Malts:</strong> {beer.malts}</p>
        <p><strong>IBU:</strong> {beer.ibu}</p>
        <p><strong>Alcohol:</strong> {beer.alcohol}</p>
        <p><strong>BLG:</strong> {beer.blg}</p>
        {beer.brand && beer.brand.brewery && <p><strong>Brewery:</strong> {beer.brand.brewery.name}</p>}
        <div>
        <h3>Bars</h3>
        {beer.bars && beer.bars.length > 0 ? (
        <ul>
            {beer.bars.map((bar, index) => (
            <li key={index}>{bar.name} </li>
            ))}
        </ul>
        ) : (
        <p>No bar serve this beer.</p>
        )}
        </div>
        <div>
            <strong>Average Rating: </strong> {beer.average_rating || 'No ratings yet'}
        </div>
      <div>
        <h3>Reviews</h3>
        {beer.reviews && beer.reviews.length > 0 ? (
        <ul>
            {beer.reviews.map((review, index) => (
            <li key={index}>{review.content} - {review.rating}/5</li>
            ))}
        </ul>
        ) : (
        <p>No reviews yet.</p>
        )}
        <div>
        <h3>Add a Review</h3>
        <ReviewsForm beerId={beerId} onNewReview={handleNewReview} />
      </div>
      </div>
      <p></p>
      <div>
      <button type="button">
        <Link to="/beers" style={{ textDecoration: 'none', color: 'inherit' }}>
            Back
        </Link>
        </button>
        </div>
    </div>
    </div>
  );
};

export default BeerShow;