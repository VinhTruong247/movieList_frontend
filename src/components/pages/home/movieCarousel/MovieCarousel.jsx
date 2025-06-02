import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import "./MovieCarousel.scss";

const MovieCarousel = ({ movies }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef(null);

  if (!movies || movies.length === 0) {
    return (
      <div className="carousel-container">
        <div className="carousel-loader">
          <div className="spinner"></div>
          <p>Loading featured movies...</p>
        </div>
      </div>
    );
  }

  const featuredMovies = movies
    .sort((a, b) => b.imdb_rating - a.imdb_rating)
    .slice(0, 5);

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === featuredMovies.length - 1 ? 0 : prev + 1
      );
    }, 5000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === featuredMovies.length - 1 ? 0 : prev + 1
    );
    resetTimer();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? featuredMovies.length - 1 : prev - 1
    );
    resetTimer();
  };

  const handleDotClick = (index) => {
    setCurrentSlide(index);
    resetTimer();
  };

  useEffect(() => {
    resetTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [featuredMovies.length]);

  const getGenreNames = (movie) => {
    if (!movie.MovieGenres || !Array.isArray(movie.MovieGenres)) {
      return "No genre information";
    }

    return movie.MovieGenres.filter((mg) => mg.Genres)
      .map((mg) => mg.Genres.name)
      .join(", ");
  };

  const shortenDescription = (text, maxLength = 100) => {
    if (!text) return "No description available";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  return (
    <div className="carousel-container">
      <div className="carousel">
        {featuredMovies.map((movie, index) => (
          <div
            key={movie.id}
            className={`carousel-slide ${index === currentSlide ? "active" : ""}`}
            style={{
              backgroundImage: `url(${movie.banner_url})`,
            }}
          >
            <div className="slide-content">
              <h2>{movie.title}</h2>
              <div className="movie-info">
                <span className="rating">⭐ {movie.imdb_rating}/10</span>
                <span className="year">{movie.year}</span>
                <span className="genre">{getGenreNames(movie)}</span>
              </div>
              <p className="description">{shortenDescription(movie.description)}</p>
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
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieCarousel;
