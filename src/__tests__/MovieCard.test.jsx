import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { MovieContext } from '../context/MovieContext';
import MovieCard from '../components/pages/home/movieCard/MovieCard';
import '@testing-library/jest-dom/vitest';

const mockMovie = {
  id: '1',
  title: 'Test Movie',
  type: 'Movie',
  year: '2024',
  poster: 'test-poster.jpg',
  genre: ['Action', 'Drama'],
  imdb_rating: 8.5,
  runtime: '120 min',
};

const mockContextValue = {
  currentUser: null,
  favorites: [],
  addToFavorites: vi.fn(),
  removeFromFavorites: vi.fn(),
};

const renderMovieCard = (
  movie = mockMovie,
  contextValue = mockContextValue
) => {
  return render(
    <BrowserRouter>
      <MovieContext.Provider value={contextValue}>
        <MovieCard movie={movie} />
      </MovieContext.Provider>
    </BrowserRouter>
  );
};

describe('MovieCard Component', () => {
  it('renders movie information correctly', () => {
    renderMovieCard();

    expect(screen.getByText(mockMovie.title)).toBeInTheDocument();
    expect(screen.getByText(mockMovie.type)).toBeInTheDocument();
    expect(screen.getByText(mockMovie.year)).toBeInTheDocument();
    expect(
      screen.getByText((content) =>
        content.includes(mockMovie.imdb_rating.toString())
      )
    ).toBeInTheDocument();
    expect(screen.getByText(mockMovie.runtime)).toBeInTheDocument();

    mockMovie.genre.forEach((genre) => {
      expect(screen.getByText(genre)).toBeInTheDocument();
    });

    const posterImage = screen.getByAltText(mockMovie.title);
    expect(posterImage).toBeInTheDocument();
    expect(posterImage.src).toContain(mockMovie.poster);
  });
});
