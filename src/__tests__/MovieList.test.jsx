import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { fetchMovies, fetchMovieById } from '../utils/MovieListAPI';

vi.mock('axios');

describe('MovieList API', () => {
  const API_URL =
    'https://65f43205f54db27bc020c3ff.mockapi.io/api/v1/movieList';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches movies list successfully', async () => {
    const mockMovies = [
      {
        id: '1',
        title: 'Test Movie 1',
        type: 'Movie',
        year: '2024',
      },
      {
        id: '2',
        title: 'Test Movie 2',
        type: 'TV Series',
        year: '2023',
      },
    ];

    axios.get.mockResolvedValueOnce({ data: mockMovies });
    const result = await fetchMovies();

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(API_URL);
    expect(result).toEqual(mockMovies);
  });

  it('handles fetch movies error', async () => {
    const error = new Error('Failed to fetch movies');
    axios.get.mockRejectedValueOnce(error);
    await expect(fetchMovies()).rejects.toThrow('Failed to fetch movies');
    expect(axios.get).toHaveBeenCalledWith(API_URL);
  });

  it('fetches movie by ID successfully', async () => {
    const mockMovie = {
      id: '1',
      title: 'Test Movie',
      type: 'Movie',
      year: '2024',
    };
    const movieId = '1';

    axios.get.mockResolvedValueOnce({ data: mockMovie });
    const result = await fetchMovieById(movieId);

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(`${API_URL}/${movieId}`);

    expect(result).toEqual(mockMovie);
  });

  it('handles fetch movie by ID error', async () => {
    const movieId = '999';
    const error = new Error('Movie not found');
    axios.get.mockRejectedValueOnce(error);

    await expect(fetchMovieById(movieId)).rejects.toThrow();
    expect(axios.get).toHaveBeenCalledWith(`${API_URL}/${movieId}`);
  });
});
