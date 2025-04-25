import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import "./MovieCarousel.scss";

const MovieCarousel = ({ movies }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const featuredMovies = movies
    .sort((a, b) => b.imdb_rating - a.imdb_rating)
    .slice(0, 5);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === featuredMovies.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? featuredMovies.length - 1 : prev - 1
    );
  };

  // useEffect(() => {
  //   const timer = setInterval(nextSlide, 5000);
  //   return () => clearInterval(timer);
  // });

  return (
    <div className="carousel-container">
      <div className="carousel">
        {featuredMovies.map((movie, index) => (
          <div
            key={movie.id}
            className={`carousel-slide ${index === currentSlide ? "active" : ""}`}
            style={{ backgroundImage: `url(${movie.poster})` }}
          >
            <div className="slide-content">
              <h2>{movie.title}</h2>
              <div className="movie-info">
                <span className="rating">⭐ {movie.imdb_rating}/10</span>
                <span className="year">{movie.year}</span>
                <span className="genre">{movie.genre.join(", ")}</span>
              </div>
              <p className="description">{movie.description}</p>
              <Link
                to={`/movie/${movie.id}`}
                className={`view-button ${index === currentSlide ? "active" : ""}`}
              >
                View Details
              </Link>
            </div>
          </div>
        ))}

        <button className="carousel-button prev" onClick={prevSlide}>
          ❮
        </button>
        <button className="carousel-button next" onClick={nextSlide}>
          ❯
        </button>

        <div className="carousel-dots">
          {featuredMovies.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieCarousel;
