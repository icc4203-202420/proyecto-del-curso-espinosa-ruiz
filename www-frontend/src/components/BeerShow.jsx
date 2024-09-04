import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import './BeerShow.css';

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

  if (!beer) return <div>Loading...</div>;

  return (
    <div className="container">
    <div>
        <h1 className="title">Beer Details</h1>
    </div>
    <div>
      <h2>{beer.name}</h2>
      <p>{beer.description}</p>
      {beer.image_url && <img src={beer.image_url} alt={beer.name} />}
      <div>
        <strong>Rating Promedio:</strong> {beer.average_rating || 'No ratings yet'}
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
            <form>
                <div>
                <label htmlFor="content">Content:</label>
                <textarea id="content" name="content"></textarea>
                </div>
                <div>
                <label htmlFor="rating">Rating:</label>
                <input type="number" id="rating" name="rating" min="1" max="5" />
                </div>
                <button type="submit">Submit Review</button>
            </form>
        </div>
      </div>
    </div>
    </div>
  );
};

export default BeerShow;